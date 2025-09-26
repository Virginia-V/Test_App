import { index, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { MaterialTable } from "./material";
import { relations } from "drizzle-orm";
import { AssetTable } from "./asset";

export const ColorTable = pgTable(
  "colors",
  {
    id,
    name: text("name").notNull(),
    materialId: integer("material_id")
      .notNull()
      .references(() => MaterialTable.id, { onDelete: "restrict" }),
    createdAt,
    updatedAt
  },
  (t) => [
    // Index for faster queries on materialId
    index("idx_colors_material_id").on(t.materialId),
    // Unique constraint to ensure each color name is unique per material
    unique("uq_colors_material_name").on(t.materialId, t.name)
  ]
);

// Define relationships for the ColorTable
export const ColorRelations = relations(ColorTable, ({ one, many }) => ({
  // Each color belongs to one material
  material: one(MaterialTable, {
    fields: [ColorTable.materialId],
    references: [MaterialTable.id]
  }),
  // Each color can have many assets
  assets: many(AssetTable)
}));

// ! Data

// --- Bathtub ---

// id "1"
// name "Color A"
// materialId "3"
// createdAt
// updatedAt

// id "2"
// name "Color B"
// materialId "3"
// createdAt
// updatedAt

// id "3"
// name "Color C"
// materialId "3"
// createdAt
// updatedAt
