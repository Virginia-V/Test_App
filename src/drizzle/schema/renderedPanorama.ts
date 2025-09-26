import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  unique
} from "drizzle-orm/pg-core";
import { PanoramaTable } from "./panorama";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { RenderedPanoramaAssetTable } from "./renderedPanoramaAsset";

export const RenderStatusEnum = pgEnum("render_status", [
  "pending",
  "processing",
  "succeeded",
  "failed"
]);

// One row per baked output file produced by sharp()
export const RenderedPanoramaTable = pgTable(
  "renderedPanoramas",
  {
    id,

    s3Key: text("s3_key"),

    // The source/base panorama you started from
    sourcePanoramaId: integer("source_panorama_id")
      .notNull()
      .references(() => PanoramaTable.id, { onDelete: "restrict" }),

    // Where the baked image lives (e.g., Vercel Blob URL)
    outputFilePath: text("output_file_path").notNull(),

    // Deterministic signature of the recipe (see usage below)
    signature: text("signature").notNull(),

    format: text("format").notNull().default("png"),
    status: RenderStatusEnum("status").notNull().default("succeeded"),

    params: jsonb("params").$type<{
      overlays: Array<{
        assetId: string;
        role: "overlay" | "floor";
      }>;
      notes?: string;
    }>(),

    createdAt,
    updatedAt
  },
  (t) => [
    index("idx_rendered_source").on(t.sourcePanoramaId),
    unique("uq_rendered_signature").on(t.sourcePanoramaId, t.signature)
  ]
);

export const RenderedPanoramaRelations = relations(
  RenderedPanoramaTable,
  ({ one, many }) => ({
    sourcePanorama: one(PanoramaTable, {
      fields: [RenderedPanoramaTable.sourcePanoramaId],
      references: [PanoramaTable.id]
    }),
    layers: many(RenderedPanoramaAssetTable)
  })
);
