import { index, integer, pgTable, unique } from "drizzle-orm/pg-core";
import { AssetKindEnum, AssetTable } from "./asset";
import { relations } from "drizzle-orm";
import { RenderedPanoramaTable } from "./renderedPanorama";

export const RenderedPanoramaAssetTable = pgTable(
  "renderedPanoramaAssets",
  {
    renderedPanoramaId: integer("rendered_panorama_id")
      .notNull()
      .references(() => RenderedPanoramaTable.id, { onDelete: "cascade" }),
    assetId: integer("asset_id")
      .notNull()
      .references(() => AssetTable.id, { onDelete: "restrict" }),

    // Role must be 'overlay' or 'floor' (base is implied by sourcePanoramaId)
    role: AssetKindEnum("role").notNull() // validate in app: role !== 'base'
  },
  (t) => [
    unique("uq_rpa_once").on(t.renderedPanoramaId, t.assetId),
    index("idx_rpa_asset").on(t.assetId)
  ]
);

export const RenderedPanoramaAssetRelations = relations(
  RenderedPanoramaAssetTable,
  ({ one }) => ({
    rendered: one(RenderedPanoramaTable, {
      fields: [RenderedPanoramaAssetTable.renderedPanoramaId],
      references: [RenderedPanoramaTable.id]
    }),
    asset: one(AssetTable, {
      fields: [RenderedPanoramaAssetTable.assetId],
      references: [AssetTable.id]
    })
  })
);
