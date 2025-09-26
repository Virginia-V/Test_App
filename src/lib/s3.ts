import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/data/env/server";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent } from "node:https";

// Optimized HTTPS agent for better connection pooling
const httpsAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 30000, // Keep connections alive for 30s
  maxSockets: 50, // Allow up to 50 concurrent connections
  maxFreeSockets: 10, // Keep 10 idle connections open
  timeout: 60000, // 60s connection timeout
});

export const s3 = new S3Client({
  region: env.HETZNER_S3_REGION,
  endpoint: env.HETZNER_S3_ENDPOINT,
  credentials: {
    accessKeyId: env.HETZNER_S3_ACCESS_KEY,
    secretAccessKey: env.HETZNER_S3_SECRET_KEY
  },
  forcePathStyle: false,
  requestHandler: new NodeHttpHandler({
    httpsAgent,
    requestTimeout: 30000, // 30s request timeout
    connectionTimeout: 10000, // 10s connection timeout
  }),
  // Add retry configuration for better reliability
  maxAttempts: 3,
  retryMode: "adaptive",
});

export const HETZNER_BUCKET = env.HETZNER_S3_BUCKET;

// Legacy export for backward compatibility
export const hzS3 = s3;
