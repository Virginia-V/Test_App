// app/api/panoramas/list/route.ts (Next.js App Router)
import { NextRequest } from "next/server";
import { db } from "@/drizzle/db";
import { RenderedImageTable } from "@/drizzle/schema";

// Next.js runtime configuration for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Data Transfer Object for a single panorama */
interface PanoramaDTO {
  id: number;
  signature: string;
  s3Key: string;
  sourcePanoramaId: number | null;
  imageKey: string; // mirrors s3Key
}

/** Success response structure */
interface ListSuccessResponse {
  success: true;
  totalCount: number;
  panoramas: PanoramaDTO[];
}

/** Error response structure */
interface ListErrorResponse {
  error: string;
  [key: string]: unknown;
}

/** Utility class for logging performance and errors */
class PerformanceLogger {
  constructor(private context: string) {}
  log(operation: string, duration: number, extra?: string): void {
    // Logs operation duration and optional extra info
    console.log(
      `[${this.context}] ${operation}: ${duration}ms${
        extra ? ` (${extra})` : ""
      }`
    );
  }
  error(operation: string, error: unknown, extra?: string): void {
    // Logs errors with context and optional extra info
    console.error(
      `[${this.context}] ${operation} failed${extra ? ` (${extra})` : ""}:`,
      error
    );
  }
}

/** Utility class for building standardized JSON responses */
class ResponseBuilder {
  // Returns a JSON response with given status and body
  static json<T extends object>(status: number, body: T): Response {
    return new Response(JSON.stringify(body, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store"
      }
    });
  }
  // Shortcut for 200 OK JSON response
  static jsonOk(body: object): Response {
    return this.json(200, body);
  }
  // Shortcut for error JSON response with custom status and message
  static jsonError(
    status: number,
    message: string,
    extra?: Record<string, unknown>
  ): Response {
    const payload: ListErrorResponse = { error: message, ...(extra || {}) };
    return this.json(status, payload);
  }
}

/** Optional query params for pagination (limit/offset) */
interface RequestParams {
  limit?: number; // optional; defaults to "fetch all"
  offset?: number; // optional
}

/** Main handler for the GET /api/panoramas/list endpoint */
class PanoramaListHandler {
  private logger = new PerformanceLogger("PanoramaList");

  // Parses and validates query parameters from the request
  parseParams(req: NextRequest): RequestParams {
    const sp = req.nextUrl.searchParams;
    const limit = sp.get("limit");
    const offset = sp.get("offset");
    const toNum = (v: string | null | undefined) =>
      v != null ? Number(v) : undefined;

    const params: RequestParams = {
      limit: toNum(limit),
      offset: toNum(offset)
    };

    // Validate limit and offset (must be finite and non-negative if provided)
    if (
      params.limit !== undefined &&
      (!Number.isFinite(params.limit) || params.limit! < 0)
    ) {
      throw new Error("Invalid 'limit' query param");
    }
    if (
      params.offset !== undefined &&
      (!Number.isFinite(params.offset) || params.offset! < 0)
    ) {
      throw new Error("Invalid 'offset' query param");
    }

    return params;
  }

  // Handles the GET request: queries DB, builds response, logs performance
  async handle(req: NextRequest): Promise<Response> {
    const started = Date.now();
    try {
      const { limit, offset } = this.parseParams(req);

      // Build the database query for panoramas
      let q = db
        .select({
          id: RenderedImageTable.id,
          signature: RenderedImageTable.signature,
          s3Key: RenderedImageTable.s3Key,
          sourcePanoramaId: RenderedImageTable.sourcePanoramaId,
          createdAt: RenderedImageTable.createdAt
        })
        .from(RenderedImageTable)
        .orderBy(
          RenderedImageTable.sourcePanoramaId,
          RenderedImageTable.signature
        );

      // Apply optional pagination if provided
      if (typeof limit === "number") {
        // @ts-expect-error drizzle supports limit on select builders
        q = q.limit(limit);
      }
      if (typeof offset === "number") {
        // @ts-expect-error drizzle supports offset on select builders
        q = q.offset(offset);
      }

      // Execute the query and fetch panoramas
      const panoramas = await q;

      // Log DB fetch duration and row count
      this.logger.log(
        "DB fetch",
        Date.now() - started,
        `rows=${panoramas.length}`
      );

      // Log found panoramas (for debugging)
      console.log(`Found ${panoramas.length} panoramas in database`);

      // Build response payload
      const payload: ListSuccessResponse = {
        success: true,
        totalCount: panoramas.length, // preserves original semantics
        panoramas: panoramas.map((p) => ({
          id: p.id,
          signature: p.signature,
          s3Key: p.s3Key,
          sourcePanoramaId: p.sourcePanoramaId,
          imageKey: p.s3Key // keep s3Key as imageKey
        }))
      };

      // Return 200 OK JSON response
      return ResponseBuilder.jsonOk(payload);
    } catch (error) {
      // Log error and return 500 error response
      this.logger.error("Request", error);
      return ResponseBuilder.jsonError(500, "Failed to fetch panoramas");
    }
  }
}

/** Helper to add a timeout to any promise (rejects if timeout exceeded) */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    )
  ]);
}

/** Next.js route entry point for GET requests */
export async function GET(req: NextRequest) {
  const handler = new PanoramaListHandler();
  try {
    // Run handler with a 30s timeout
    return await withTimeout(handler.handle(req), 30000);
  } catch (error) {
    // Handle timeout or unexpected errors
    if (error instanceof Error && error.message === "Request timeout") {
      return ResponseBuilder.jsonError(408, "Request timeout");
    }
    return ResponseBuilder.jsonError(500, "Unexpected error");
  }
}

// This API endpoint handles GET requests to list panoramas from the database. 
// It supports optional pagination using limit and offset query parameters. The main steps are:

// 1. Parse and Validate Query Parameters:
// The handler extracts limit and offset from the request's query string, ensuring they are valid numbers if provided.

// 2. Database Query:
// It queries the RenderedImageTable for panoramas, ordering by sourcePanoramaId and signature. If pagination parameters are present, it applies them to the query.

// 3. Response Construction:
// The handler builds a JSON response containing the total count and an array of panoramas, each with its details.

// 4. Performance Logging:
// It logs the duration of the database fetch and any errors encountered.

// 5. Timeout Handling:
// The request is wrapped in a 30-second timeout. If exceeded, a timeout error is returned.

// 6. Error Handling:
// Any errors during processing result in a standardized error response.
