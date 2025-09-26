import { index, integer, pgTable, text, unique } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { ModelTable } from "./model";
import { ColorTable } from "./color";
import { AssetTable } from "./asset";
import { relations } from "drizzle-orm";


export const MaterialTable = pgTable(
  "materials",
  {
    id,
    name: text("name").notNull(),
    modelId: integer("model_id")
      .notNull()
      .references(() => ModelTable.id, { onDelete: "restrict" }),
    createdAt,
    updatedAt
  },
  (t) => [
    // Index for faster queries on modelId
    index("idx_materials_model_id").on(t.modelId),
    // Unique constraint to ensure each material name is unique per model
    unique("uq_materials_model_name").on(t.modelId, t.name)
  ]
);

export const MaterialRelations = relations(MaterialTable, ({ one, many }) => ({
  // Each material belongs to one model
  model: one(ModelTable, {
    fields: [MaterialTable.modelId],
    references: [ModelTable.id]
  }),
  // Each material can have many colors
  colors: many(ColorTable),
  // Each material can have many assets
  assets: many(AssetTable)
}));

// ! Data

// --- Bathtub ---

// --- Model 01 ---

// id "1"
// name "Material A"
// modelId "1"
// createdAt
// updatedAt

// id "2"
// name "Material B"
// modelId "1"
// createdAt
// updatedAt

// id "3"
// name "Material C"
// modelId "1"
// createdAt
// updatedAt

// --- Model 02 ---

// id "4"
// name "Material A"
// modelId "2"
// createdAt
// updatedAt

// id "5"
// name "Material B"
// modelId "2"
// createdAt
// updatedAt

// id "6"
// name "Material C"
// modelId "2"
// createdAt
// updatedAt

// --- Model 03 ---

// id "7"
// name "Material A"
// modelId "3"
// createdAt
// updatedAt

// id "8"
// name "Material B"
// modelId "3"
// createdAt
// updatedAt

// id "9"
// name "Material C"
// modelId "3"
// createdAt
// updatedAt

// ---------------------------------

// --- Sink ---

// --- Model 01 ---

// id "10"
// name "Material A"
// modelId "4"
// createdAt
// updatedAt

// id "11"
// name "Material B"
// modelId "4"
// createdAt
// updatedAt

// id "12"
// name "Material C"
// modelId "4"
// createdAt
// updatedAt

// --- Model 02 ---

// id "13"
// name "Material A"
// modelId "5"
// createdAt
// updatedAt

// id "14"
// name "Material B"
// modelId "5"
// createdAt
// updatedAt

// id "15"
// name "Material C"
// modelId "5"
// createdAt
// updatedAt

// --- Model 03 ---

// id "16"
// name "Material A"
// modelId "6"
// createdAt
// updatedAt

// id "17"
// name "Material B"
// modelId "6"
// createdAt
// updatedAt

// id "18"
// name "Material C"
// modelId "6"
// createdAt
// updatedAt
