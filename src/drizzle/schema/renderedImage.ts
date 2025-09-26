import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  unique
} from "drizzle-orm/pg-core";
import { PanoramaTable } from "./panorama";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { RenderedImageAssetTable } from "./renderedImageAsset";
import { RenderStatusEnum } from "./renderedPanorama";

// export const RenderStatusEnum = pgEnum("render_status", [
//   "pending",
//   "processing",
//   "succeeded",
//   "failed"
// ]);

// One row per baked output file produced by sharp()
export const RenderedImageTable = pgTable(
  "renderedImages",
  {
    id,

    // The source/base panorama you started from
    sourcePanoramaId: integer("source_panorama_id")
      .notNull()
      .references(() => PanoramaTable.id, { onDelete: "restrict" }),

    s3Key: text("s3_key").notNull(),

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
    index("idx_ri_source").on(t.sourcePanoramaId),
    unique("uq_ri_source_signature").on(t.sourcePanoramaId, t.signature)
  ]
);

export const RenderedImageRelations = relations(
  RenderedImageTable,
  ({ one, many }) => ({
    sourcePanorama: one(PanoramaTable, {
      fields: [RenderedImageTable.sourcePanoramaId],
      references: [PanoramaTable.id]
    }),
    layers: many(RenderedImageAssetTable)
  })
);
