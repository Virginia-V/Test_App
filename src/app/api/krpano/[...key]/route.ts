/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/krpano/[...key]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { s3, HETZNER_BUCKET } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const XML_TTL_SECONDS = 600;
const ASSET_TTL_SECONDS = 31536000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guessType(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> } // <-- Next 15: params is a Promise
) {
  const { key } = await ctx.params; // <-- await it
  const keyParts = key || [];
  if (keyParts.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 1:1 mapping from URL to S3 key:
  // /api/krpano/tours/tour-1-1/krpano.js -> "tours/tour-1-1/krpano.js"
  const s3Key = keyParts.join("/");

  const range = req.headers.get("range") ?? undefined;

  try {
    const resp = await s3.send(
      new GetObjectCommand({
        Bucket: HETZNER_BUCKET,
        Key: s3Key,
        Range: range
      })
    );

    const isXml = s3Key.endsWith(".xml");
    const cacheControl = isXml
      ? `public, max-age=${XML_TTL_SECONDS}`
      : `public, max-age=${ASSET_TTL_SECONDS}, immutable`;

    const status = range && resp.ContentRange ? 206 : 200;

    const headers = new Headers();
    headers.set("Content-Type", resp.ContentType || guessType(s3Key));
    headers.set("Cache-Control", cacheControl);
    headers.set("Accept-Ranges", "bytes");
    if (resp.ETag) headers.set("ETag", resp.ETag);
    if (resp.ContentLength != null)
      headers.set("Content-Length", String(resp.ContentLength));
    if (resp.ContentRange) headers.set("Content-Range", resp.ContentRange);
    if (resp.LastModified)
      headers.set("Last-Modified", resp.LastModified.toUTCString());

    // AWS SDK v3 gives a web ReadableStream in Next.js node runtime; return it directly.
    return new NextResponse(resp.Body as any, { status, headers });
  } catch (err: any) {
    const code = err?.$metadata?.httpStatusCode ?? 500;
    return new NextResponse(code === 404 ? "Not Found" : "Upstream Error", {
      status: code === 404 ? 404 : 502
    });
  }
}
