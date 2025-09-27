/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import mime from "mime";
import { s3, HETZNER_BUCKET } from "@/lib/s3";

/**
 * Utility to build HTTP responses for files
 */
function buildFileResponse(
  stream: ReadableStream,
  contentType: string,
  contentLength?: number,
  etag?: string,
  lastModified?: Date
): Response {
  const headers = new Headers({
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Content-Disposition": "inline",
    "Cache-Control": "public, max-age=31536000, immutable",
    ...(etag ? { ETag: etag } : {}),
    ...(lastModified ? { "Last-Modified": lastModified.toUTCString() } : {})
  });
  if (contentLength) headers.set("Content-Length", String(contentLength));
  return new Response(stream, { status: 200, headers });
}

/**
 * GET handler for /api/tour-file?key=...
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return new Response(JSON.stringify({ error: "Missing ?key= parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get metadata (HEAD)
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: HETZNER_BUCKET, Key: key })
    );
    // Get file (GET)
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: HETZNER_BUCKET, Key: key })
    );
    if (!obj.Body) throw new Error("No file body");

    const stream = Readable.toWeb(obj.Body as Readable) as ReadableStream;
    const contentType =
      head.ContentType || mime.getType(key) || "application/octet-stream";
    const contentLength = head.ContentLength;
    const etag = head.ETag;
    const lastModified = head.LastModified;

    return buildFileResponse(
      stream,
      contentType,
      contentLength,
      etag,
      lastModified
    );
  } catch (err: any) {
    if (err.$metadata?.httpStatusCode === 404) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
