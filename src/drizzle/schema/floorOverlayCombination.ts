import { index, integer, pgTable, unique } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { AssetTable } from "./asset";
import { relations } from "drizzle-orm";
import { FloorOverlayCombinationModelTable } from "./floorOverlayCombinationModel";

export const FloorOverlayCombinationTable = pgTable(
  "floorOverlayCombinations",
  {
    // Primary key column, imported from schemaHelpers
    id,
    // Foreign key referencing an asset (typically with asset_kind = 'floor')
    assetId: integer("asset_id")
      .notNull()
      .references(() => AssetTable.id, { onDelete: "restrict" }),
    // Timestamps for creation and last update
    createdAt,
    updatedAt
  },
  (t) => [
    // Index for faster queries on assetId
    index("idx_foc_asset_id").on(t.assetId),
    // Unique constraint to ensure each asset is only used once in combinations
    unique("uq_foc_asset").on(t.assetId)
  ]
);

// Define relationships for the FloorOverlayCombinationTable
export const FloorOverlayCombinationRelations = relations(
  FloorOverlayCombinationTable,
  ({ one, many }) => ({
    // Each combination references one asset
    asset: one(AssetTable, {
      fields: [FloorOverlayCombinationTable.assetId],
      references: [AssetTable.id]
    }),
    // Each combination can be linked to many models through the pivot table
    models: many(FloorOverlayCombinationModelTable)
  })
);
