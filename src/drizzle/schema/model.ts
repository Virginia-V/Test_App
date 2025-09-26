import { index, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CategoryTable } from "./category";
import { relations } from "drizzle-orm";
import { MaterialTable } from "./material";
import { AssetTable } from "./asset";
import { FloorOverlayCombinationModelTable } from "./floorOverlayCombinationModel";

export const ModelTable = pgTable(
  "models",
  {
    id,
    name: text("name").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => CategoryTable.id, { onDelete: "restrict" }),
    createdAt,
    updatedAt
  },
  (t) => [
    // Index for faster queries on categoryId
    index("idx_models_category_id").on(t.categoryId),
    // Unique constraint to ensure each model name is unique per category
    unique("uq_models_category_name").on(t.categoryId, t.name)
  ]
);

export const ModelRelations = relations(ModelTable, ({ one, many }) => ({
  // Each model belongs to one category
  category: one(CategoryTable, {
    fields: [ModelTable.categoryId],
    references: [CategoryTable.id]
  }),
  // Each model can have many materials
  materials: many(MaterialTable),
  // Each model can have many assets
  assets: many(AssetTable),

  // Relationships to floor overlay combinations (grouping specific floor assets)
  floorOverlayCombinations: many(FloorOverlayCombinationModelTable)
}));

// ! Data

// --- Bathtub ---

// id "1"
// name "Model A"
// categoryId "1"
// createdAt
// updatedAt

// id "2"
// name "Model B"
// categoryId "1"
// createdAt
// updatedAt

// id "3"
// name "Model C"
// categoryId "1"
// createdAt
// updatedAt

// --- Sink ---

// id "4"
// name "Model A"
// categoryId "2"
// createdAt
// updatedAt

// id "5"
// name "Model B"
// categoryId "2"
// createdAt
// updatedAt

// id "6"
// name "Model C"
// categoryId "2"
// createdAt
// updatedAt

// --- Floor ---

// id "7"
// name "Model A"
// categoryId "3"
// createdAt
// updatedAt

// id "8"
// name "Model B"
// categoryId "3"
// createdAt
// updatedAt

// id "9"
// name "Model C"
// categoryId "3"
// createdAt
// updatedAt
