import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    HETZNER_S3_ACCESS_KEY: z.string().min(1),
    HETZNER_S3_SECRET_KEY: z.string().min(1),
    HETZNER_S3_ENDPOINT: z
      .string()
      .regex(
        /^https?:\/\/[^.]+\.your-objectstorage\.com$/,
        "Must be a valid Hetzner endpoint URL"
      ),
    HETZNER_S3_BUCKET: z.string().min(1),
    HETZNER_S3_REGION: z.string().default("nbg1")
  },
  experimental__runtimeEnv: process.env
});
