import { index, integer, pgTable, unique } from "drizzle-orm/pg-core";
import { AssetKindEnum, AssetTable } from "./asset";
import { relations } from "drizzle-orm";
import { RenderedImageTable } from "./renderedImage";

export const RenderedImageAssetTable = pgTable(
  "renderedImageAssets",
  {
    renderedImageId: integer("rendered_image_id")
      .notNull()
      .references(() => RenderedImageTable.id, { onDelete: "cascade" }),
    assetId: integer("asset_id")
      .notNull()
      .references(() => AssetTable.id, { onDelete: "restrict" }),

    // Role must be 'overlay' or 'floor' (base is implied by sourcePanoramaId)
    role: AssetKindEnum("role").notNull() // validate in app: role !== 'base'
  },
  (t) => [
    unique("uq_ria_once").on(t.renderedImageId, t.assetId),
    index("idx_ria_asset").on(t.assetId)
  ]
);

export const RenderedImageAssetRelations = relations(
  RenderedImageAssetTable,
  ({ one }) => ({
    rendered: one(RenderedImageTable, {
      fields: [RenderedImageAssetTable.renderedImageId],
      references: [RenderedImageTable.id]
    }),
    asset: one(AssetTable, {
      fields: [RenderedImageAssetTable.assetId],
      references: [AssetTable.id]
    })
  })
);
