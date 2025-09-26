import { NextRequest } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { and, eq } from "drizzle-orm";
import mime from "mime";
import { s3, HETZNER_BUCKET } from "@/lib/s3";
import { RenderedImageTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { fileCache, type CachedFileMetadata } from "@/lib/fileCache";

// Next.js runtime configuration - uses Node.js runtime for full API support
export const runtime = "nodejs";
// Force dynamic rendering to ensure fresh responses for file requests
export const dynamic = "force-dynamic";

/**
 * Parameters that can be passed to identify and retrieve a file
 * Three different ways to identify a file:
 * 1. Direct S3 key (fastest, no DB lookup)
 * 2. Database ID (single table lookup)
 * 3. Signature + optional panorama ID (filtered lookup)
 */
interface RequestParams {
  id?: string; // Database record ID for direct lookup
  key?: string; // Direct S3 key - bypasses database entirely
  signature?: string; // Unique signature identifier
  panoramaId?: string; // Optional filter when using signature
}

/**
 * Metadata for streaming file responses
 * Contains all necessary HTTP headers and content information
 */
interface StreamMetadata {
  contentType: string; // MIME type of the file
  contentLength: number; // Size in bytes
  lastModified: Date; // When file was last modified
  etag: string; // Entity tag for caching
  isPartial: boolean; // True for range requests (HTTP 206)
  contentRange?: string; // Range header for partial content
}

/**
 * Centralized performance monitoring and logging utility
 * Provides consistent logging format across all operations
 */
class PerformanceLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log successful operations with timing information
   * @param operation - Name of the operation (e.g., "DB lookup", "S3 fetch")
   * @param duration - Time taken in milliseconds
   * @param key - Optional identifier (S3 key, DB ID, etc.)
   */
  log(operation: string, duration: number, key?: string): void {
    console.log(
      `[${this.context}] ${operation}: ${duration}ms${key ? ` (${key})` : ""}`
    );
  }

  /**
   * Log errors with context information
   * @param operation - Operation that failed
   * @param error - Error object or message
   * @param key - Optional identifier for debugging
   */
  error(operation: string, error: unknown, key?: string): void {
    console.error(
      `[${this.context}] ${operation} failed${key ? ` (${key})` : ""}:`,
      error
    );
  }
}

/**
 * Utility class for creating standardized HTTP responses
 * Ensures consistent headers and error formats across the API
 */
class ResponseBuilder {
  /**
   * Create a JSON error response with appropriate headers
   * @param status - HTTP status code
   * @param message - Error message for the client
   * @param extra - Additional fields to include in response body
   */
  static jsonError(
    status: number,
    message: string,
    extra?: Record<string, unknown>
  ): Response {
    return new Response(JSON.stringify({ error: message, ...extra }, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store" // Prevent caching of error responses
      }
    });
  }

  /**
   * Create a 304 Not Modified response for cached content
   * Used when client already has the latest version (ETag match)
   * @param etag - Entity tag to include in response
   */
  static notModified(etag: string): Response {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "X-Cache": "HIT-304" // Debug header to identify cache hit
      }
    });
  }

  /**
   * Create response for files served from memory cache
   * Includes all necessary headers for proper browser caching
   * @param metadata - Cached file metadata and data
   */
  static cachedFile(metadata: CachedFileMetadata): Response {
    const headers = new Headers({
      "Content-Type": metadata.contentType,
      "Content-Length": String(metadata.contentLength),
      "Accept-Ranges": "bytes", // Enable range requests for media files
      "Content-Disposition": "inline", // Display in browser, don't force download
      "Cache-Control": "public, max-age=31536000, immutable", // Long-term caching
      ETag: `"${metadata.etag}"`, // Quoted ETag for proper HTTP compliance
      "Last-Modified": metadata.lastModified.toUTCString(),
      "X-Content-Type-Options": "nosniff", // Security: prevent MIME type sniffing
      "X-Cache": "HIT-MEMORY" // Debug header to identify memory cache hit
    });

    // Add compression hint for images to improve performance
    if (metadata.contentType.startsWith("image/")) {
      headers.set("Vary", "Accept-Encoding");
    }

    // Convert buffer data to Uint8Array for Response constructor
    return new Response(new Uint8Array(metadata.data!), {
      status: 200,
      headers
    });
  }

  /**
   * Create response for streaming files from S3
   * Handles both full files and partial content (range requests)
   * @param stream - ReadableStream containing file data
   * @param metadata - File metadata for response headers
   */
  static streamingFile(
    stream: ReadableStream,
    metadata: StreamMetadata
  ): Response {
    const headers = new Headers({
      "Content-Type": metadata.contentType,
      "Accept-Ranges": "bytes", // Enable range requests
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: metadata.etag,
      "Last-Modified": metadata.lastModified.toUTCString(),
      "X-Content-Type-Options": "nosniff",
      "X-Cache": "MISS-STREAM" // Debug header to identify streaming response
    });

    // Set content length if known (helps with progress indicators)
    if (metadata.contentLength > 0) {
      headers.set("Content-Length", String(metadata.contentLength));
    }

    // Add range headers for partial content responses
    if (metadata.isPartial && metadata.contentRange) {
      headers.set("Content-Range", metadata.contentRange);
    }

    // Add compression hints for media files
    if (
      metadata.contentType.startsWith("image/") ||
      metadata.contentType.startsWith("video/")
    ) {
      headers.set("Vary", "Accept-Encoding");
    }

    return new Response(stream, {
      status: metadata.isPartial ? 206 : 200, // 206 for partial content, 200 for full
      headers
    });
  }
}

/**
 * Handles resolution of S3 keys from various input parameters
 * Supports three lookup methods with different performance characteristics:
 * - Direct key: O(1) - no database lookup needed
 * - ID lookup: O(1) - single indexed database query
 * - Signature lookup: O(1) - indexed query with optional filtering
 */
class S3KeyResolver {
  private logger: PerformanceLogger;

  constructor(logger: PerformanceLogger) {
    this.logger = logger;
  }

  /**
   * Main entry point for S3 key resolution
   * Tries different resolution methods in order of performance
   * @param params - Request parameters containing identification info
   * @returns Promise resolving to S3 key string
   */
  async resolve(params: RequestParams): Promise<string> {
    const startTime = Date.now();

    try {
      // Fastest path: direct S3 key provided (no DB lookup needed)
      if (params.key) {
        return params.key; // Direct key bypass
      }

      // Second fastest: lookup by database ID
      if (params.id) {
        const s3Key = await this.resolveById(params.id);
        this.logger.log("DB lookup by ID", Date.now() - startTime, s3Key);
        return s3Key;
      }

      // Slowest: lookup by signature (potentially with filtering)
      if (params.signature) {
        const s3Key = await this.resolveBySignature(
          params.signature,
          params.panoramaId
        );
        this.logger.log(
          "DB lookup by signature",
          Date.now() - startTime,
          s3Key
        );
        return s3Key;
      }

      throw new Error("Missing required parameters");
    } catch (error) {
      this.logger.error("S3Key resolution", error);
      throw error;
    }
  }

  /**
   * Resolve S3 key by database record ID
   * Uses indexed primary key lookup for fast retrieval
   * @param idParam - String representation of database ID
   * @returns Promise resolving to S3 key
   */
  private async resolveById(idParam: string): Promise<string> {
    // Validate and convert ID to number
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      throw new Error(`Invalid id: ${idParam}`);
    }

    // Query database for S3 key using primary key index
    const [row] = await db
      .select({ s3Key: RenderedImageTable.s3Key })
      .from(RenderedImageTable)
      .where(eq(RenderedImageTable.id, id))
      .limit(1); // Optimization: only need first result

    if (!row) {
      throw new Error(`Not found by ID: ${id}`);
    }

    return row.s3Key;
  }

  /**
   * Resolve S3 key by signature with optional panorama ID filtering
   * More complex query that may use composite index
   * @param signature - Unique signature identifier
   * @param panoramaIdParam - Optional panorama ID for filtering
   * @returns Promise resolving to S3 key
   */
  private async resolveBySignature(
    signature: string,
    panoramaIdParam?: string
  ): Promise<string> {
    const panoId = panoramaIdParam ? Number(panoramaIdParam) : NaN;

    // Build WHERE clause - use composite condition if panorama ID provided
    const whereClause = Number.isFinite(panoId)
      ? and(
          eq(RenderedImageTable.signature, signature),
          eq(RenderedImageTable.sourcePanoramaId, panoId)
        )
      : eq(RenderedImageTable.signature, signature);

    // Execute query with appropriate filtering
    const [row] = await db
      .select({ s3Key: RenderedImageTable.s3Key })
      .from(RenderedImageTable)
      .where(whereClause)
      .limit(1);

    if (!row) {
      throw new Error(`Not found by signature: ${signature}`);
    }

    return row.s3Key;
  }
}

/**
 * Handles all S3 operations including metadata fetching, caching, and streaming
 * Optimizes for different file sizes and request patterns
 */
class S3FileHandler {
  private logger: PerformanceLogger;
  // Files larger than 2MB are not cached in memory to prevent excessive RAM usage
  private static readonly CACHE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB

  constructor(logger: PerformanceLogger) {
    this.logger = logger;
  }

  /**
   * Generate deterministic ETag from S3 key
   * Used when S3 doesn't provide ETag or as fallback
   * @param s3Key - S3 object key
   * @returns Quoted ETag string
   */
  generateETag(s3Key: string): string {
    return `"${Buffer.from(s3Key)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")}"`;
  }

  /**
   * Fetch file metadata from S3 using HEAD request
   * More efficient than GET when only metadata is needed
   * @param s3Key - S3 object key
   * @returns Promise resolving to cached file metadata
   */
  async getMetadata(s3Key: string): Promise<CachedFileMetadata> {
    try {
      // HEAD request - gets metadata without downloading file content
      const headObj = await s3.send(
        new HeadObjectCommand({
          Bucket: HETZNER_BUCKET,
          Key: s3Key
        })
      );

      // Infer MIME type from file extension as fallback
      const inferredType = mime.getType(s3Key) || "application/octet-stream";
      const contentType = headObj.ContentType || inferredType;

      return {
        contentType,
        contentLength: headObj.ContentLength || 0,
        lastModified: headObj.LastModified || new Date(),
        etag:
          headObj.ETag?.replace(/"/g, "") || // Remove quotes from S3 ETag
          this.generateETag(s3Key).replace(/"/g, ""), // Generate fallback ETag
        cachedAt: Date.now() // Timestamp for cache invalidation
      };
    } catch (error) {
      this.logger.error("S3 HEAD request", error, s3Key);
      throw error;
    }
  }

  /**
   * Download complete file from S3 for memory caching
   * Only used for small files that benefit from caching
   * @param s3Key - S3 object key
   * @returns Promise resolving to file buffer
   */
  async getFileForCache(s3Key: string): Promise<Buffer> {
    const obj = await s3.send(
      new GetObjectCommand({
        Bucket: HETZNER_BUCKET,
        Key: s3Key
      })
    );

    if (!obj.Body) {
      throw new Error("No body in S3 response");
    }

    // Collect all chunks from the readable stream
    const chunks: Buffer[] = [];
    const nodeReadable = obj.Body as Readable;

    // Efficiently read all chunks into memory
    for await (const chunk of nodeReadable) {
      chunks.push(chunk);
    }

    // Combine all chunks into single buffer
    return Buffer.concat(chunks);
  }

  /**
   * Create a transform stream for progress tracking
   * Allows monitoring of bytes transferred during streaming
   * @returns TransformStream that passes data through while tracking progress
   */
  createProgressStream(): TransformStream {
    let bytesRead = 0;

    return new TransformStream({
      transform(chunk, controller) {
        bytesRead += chunk.byteLength;
        // Example: log every 1MB
        if (bytesRead % (1024 * 1024) < chunk.byteLength) {
          console.log(`Streamed ${bytesRead} bytes`);
        }
        controller.enqueue(chunk);
      }
    });
  }

  /**
   * Stream file from S3 with optional range support
   * Handles both full file requests and partial content (HTTP range requests)
   * @param s3Key - S3 object key
   * @param range - Optional HTTP range header value
   * @returns Promise resolving to stream and metadata
   */
  async streamFile(
    s3Key: string,
    range?: string
  ): Promise<{
    stream: ReadableStream;
    metadata: StreamMetadata;
  }> {
    try {
      // Get object from S3, with optional range for partial content
      const obj = await s3.send(
        new GetObjectCommand({
          Bucket: HETZNER_BUCKET,
          Key: s3Key,
          ...(range ? { Range: range } : {}) // Add range header if specified
        })
      );

      // Convert Node.js Readable to Web ReadableStream
      const nodeReadable = obj.Body as Readable;
      const webStream = Readable.toWeb(nodeReadable) as ReadableStream;

      // Add progress tracking layer
      const progressStream = this.createProgressStream();
      const trackedStream = webStream.pipeThrough(progressStream);

      // Determine content type with fallback to file extension
      const inferredType = mime.getType(s3Key) || "application/octet-stream";
      const contentType = obj.ContentType || inferredType;

      // Build metadata object for response headers
      const metadata: StreamMetadata = {
        contentType,
        contentLength: obj.ContentLength || 0,
        lastModified: obj.LastModified || new Date(),
        etag: obj.ETag || this.generateETag(s3Key),
        isPartial: Boolean(range) && Boolean(obj.ContentRange), // Check if partial response
        contentRange: obj.ContentRange // Range info for 206 responses
      };

      return { stream: trackedStream, metadata };
    } catch (error) {
      this.logger.error("S3 streaming", error, s3Key);
      throw error;
    }
  }

  /**
   * Determine if file should be cached in memory based on size
   * Prevents memory exhaustion from large files while improving performance for small files
   * @param contentLength - File size in bytes
   * @returns True if file should be cached in memory
   */
  shouldCacheInMemory(contentLength: number): boolean {
    return contentLength < S3FileHandler.CACHE_SIZE_LIMIT;
  }
}

/**
 * Main orchestrator class that coordinates the entire request handling flow
 * Manages the interaction between parameter parsing, key resolution, caching, and response generation
 */
class PanoramaFileHandler {
  private logger: PerformanceLogger;
  private keyResolver: S3KeyResolver;
  private s3Handler: S3FileHandler;

  constructor() {
    this.logger = new PerformanceLogger("PanoramaFile");
    this.keyResolver = new S3KeyResolver(this.logger);
    this.s3Handler = new S3FileHandler(this.logger);
  }

  /**
   * Parse and extract request parameters from URL search params
   * @param req - Next.js request object
   * @returns Parsed request parameters
   */
  parseRequestParams(req: NextRequest): RequestParams {
    const url = req.nextUrl;
    return {
      id: url.searchParams.get("id") || undefined,
      key: url.searchParams.get("key") || undefined,
      signature: url.searchParams.get("signature") || undefined,
      panoramaId: url.searchParams.get("panoramaId") || undefined
    };
  }

  /**
   * Validate that required parameters are present
   * At least one identification method must be provided
   * @param params - Parsed request parameters
   * @throws Error if validation fails
   */
  validateParams(params: RequestParams): void {
    if (!params.key && !params.id && !params.signature) {
      throw new Error(
        "Missing query: provide ?key=... OR ?id=... OR ?signature=...&panoramaId=..."
      );
    }
  }

  /**
   * Main request handling logic with optimized caching strategy
   * Implements multi-layer caching: HTTP 304 -> Memory cache -> S3 streaming
   * @param req - Next.js request object
   * @returns Promise resolving to HTTP response
   */
  async handleRequest(req: NextRequest): Promise<Response> {
    const startTime = Date.now();

    try {
      // Step 1: Parse and validate request parameters
      const params = this.parseRequestParams(req);
      this.validateParams(params);

      // Step 2: Resolve S3 key from parameters (may involve database lookup)
      const s3Key = await this.keyResolver.resolve(params);
      const cacheKey = s3Key; // Use S3 key as cache key

      // Step 3: Extract relevant HTTP headers for caching logic
      const ifNoneMatch = req.headers.get("if-none-match"); // Client's cached ETag
      const range = req.headers.get("range") || undefined; // Range request header
      const etag = this.s3Handler.generateETag(s3Key); // Generate ETag for comparison

      // Step 4: Handle HTTP 304 Not Modified (fastest response path)
      if (ifNoneMatch === etag) {
        this.logger.log(
          "Request (304 cache hit)",
          Date.now() - startTime,
          s3Key
        );
        return ResponseBuilder.notModified(etag);
      }

      // Step 5: Check memory cache for previously cached files
      let cachedMetadata: CachedFileMetadata | undefined;
      if (fileCache.shouldCache(cacheKey)) {
        cachedMetadata = fileCache.get(cacheKey);

        // Serve from memory cache if available and not a range request
        if (cachedMetadata?.data && !range) {
          this.logger.log(
            "Request (memory cache hit)",
            Date.now() - startTime,
            s3Key
          );
          return ResponseBuilder.cachedFile(cachedMetadata);
        }
      }

      // Step 6: Handle cache miss - fetch metadata and potentially cache small files
      if (!cachedMetadata && !range && fileCache.shouldCache(cacheKey)) {
        try {
          // Get file metadata from S3
          cachedMetadata = await this.s3Handler.getMetadata(s3Key);

          // For small files, download and cache in memory for future requests
          if (
            this.s3Handler.shouldCacheInMemory(cachedMetadata.contentLength)
          ) {
            cachedMetadata.data = await this.s3Handler.getFileForCache(s3Key);
            fileCache.set(cacheKey, cachedMetadata);

            this.logger.log(
              "Request (S3 + cache)",
              Date.now() - startTime,
              s3Key
            );
            return ResponseBuilder.cachedFile(cachedMetadata);
          } else {
            // For large files, cache only metadata (not file content)
            fileCache.set(cacheKey, cachedMetadata);
          }
        } catch (error) {
          // If metadata fetch fails, continue with streaming as fallback
          this.logger.error(
            "Metadata fetch failed, falling back to streaming",
            error,
            s3Key
          );
        }
      }

      // Step 7: Stream the file directly from S3 (for large files, range requests, or cache misses)
      const { stream, metadata } = await this.s3Handler.streamFile(
        s3Key,
        range
      );

      this.logger.log("Request (streaming)", Date.now() - startTime, s3Key);
      return ResponseBuilder.streamingFile(stream, metadata);
    } catch (error) {
      this.logger.error("Request failed", error);

      // Map different error types to appropriate HTTP status codes
      if (error instanceof Error) {
        if (
          error.message.includes("Invalid id") ||
          error.message.includes("Missing query")
        ) {
          return ResponseBuilder.jsonError(400, error.message); // Bad Request
        }
        if (error.message.includes("Not found")) {
          return ResponseBuilder.jsonError(404, error.message); // Not Found
        }
      }

      return ResponseBuilder.jsonError(500, "Internal server error"); // Generic server error
    }
  }
}

/**
 * Utility function to add timeout protection to promises
 * Prevents hanging requests that could exhaust server resources
 * @param promise - Promise to wrap with timeout
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns Promise that rejects with timeout error if not resolved in time
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    )
  ]);
}

/**
 * Next.js API route handler for GET requests
 * Entry point for all panorama file requests
 * Handles timeout protection and top-level error catching
 */
export async function GET(req: NextRequest) {
  // Create handler instance for this request
  const handler = new PanoramaFileHandler();

  try {
    // Handle request with 30-second timeout to prevent hanging
    return await withTimeout(handler.handleRequest(req), 30000);
  } catch (error) {
    // Handle timeout specifically
    if (error instanceof Error && error.message === "Request timeout") {
      return ResponseBuilder.jsonError(408, "Request timeout");
    }
    // Handle any other unexpected errors
    return ResponseBuilder.jsonError(500, "Unexpected error");
  }
}
