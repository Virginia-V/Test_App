import { relations } from "drizzle-orm";
import { FloorOverlayCombinationTable } from "./floorOverlayCombination";
import { ModelTable } from "./model";
import { index, integer, pgTable, unique } from "drizzle-orm/pg-core";

// Define the "floor_overlay_combination_models" pivot table schema
export const FloorOverlayCombinationModelTable = pgTable(
  "floorOverlayCombinationModels",
  {
    // Foreign key referencing a floor overlay combination
    floorOverlayCombinationId: integer("floor_overlay_combination_id")
      .notNull()
      .references(() => FloorOverlayCombinationTable.id, {
        onDelete: "cascade"
      }),
    // Foreign key referencing a model
    modelId: integer("model_id")
      .notNull()
      .references(() => ModelTable.id, { onDelete: "restrict" })
  },
  (t) => [
    // Unique constraint to ensure each combination of floorOverlayCombinationId and modelId is unique
    unique("pk_focm").on(t.floorOverlayCombinationId, t.modelId),
    // Index for faster queries on modelId
    index("idx_focm_model_id").on(t.modelId)
  ]
);

export const FloorOverlayCombinationModelRelations = relations(
  FloorOverlayCombinationModelTable,
  ({ one }) => ({
    // Each entry references one floor overlay combination
    floorOverlayCombination: one(FloorOverlayCombinationTable, {
      fields: [FloorOverlayCombinationModelTable.floorOverlayCombinationId],
      references: [FloorOverlayCombinationTable.id]
    }),
    // Each entry references one model
    model: one(ModelTable, {
      fields: [FloorOverlayCombinationModelTable.modelId],
      references: [ModelTable.id]
    })
  })
);

// ! Data

// Floor Combinations

// --- Floor ModelId = 7 ---

// Bathtub ModelId = 1 + Sink ModelId = 4
// Bathtub ModelId = 1 + Sink ModelId = 5
// Bathtub ModelId = 1 + Sink ModelId = 6

// Bathtub ModelId = 2 + Sink ModelId = 4
// Bathtub ModelId = 2 + Sink ModelId = 5
// Bathtub ModelId = 2 + Sink ModelId = 6

// Bathtub ModelId = 3 + Sink ModelId = 4
// Bathtub ModelId = 3 + Sink ModelId = 5
// Bathtub ModelId = 3 + Sink ModelId = 6

// --- Floor ModelId = 8 ---

// Bathtub ModelId = 1 + Sink ModelId = 4
// Bathtub ModelId = 1 + Sink ModelId = 5
// Bathtub ModelId = 1 + Sink ModelId = 6

// Bathtub ModelId = 2 + Sink ModelId = 4
// Bathtub ModelId = 2 + Sink ModelId = 5
// Bathtub ModelId = 2 + Sink ModelId = 6

// Bathtub ModelId = 3 + Sink ModelId = 4
// Bathtub ModelId = 3 + Sink ModelId = 5
// Bathtub ModelId = 3 + Sink ModelId = 6

// --- Floor ModelId = 9 ---

// Bathtub ModelId = 1 + Sink ModelId = 4
// Bathtub ModelId = 1 + Sink ModelId = 5
// Bathtub ModelId = 1 + Sink ModelId = 6

// Bathtub ModelId = 2 + Sink ModelId = 4
// Bathtub ModelId = 2 + Sink ModelId = 5
// Bathtub ModelId = 2 + Sink ModelId = 6

// Bathtub ModelId = 3 + Sink ModelId = 4
// Bathtub ModelId = 3 + Sink ModelId = 5
// Bathtub ModelId = 3 + Sink ModelId = 6

// INSERT TABLE

// ! --- Floor ModelId = 7 ---
// ! Bathtub ModelId = 1 + Sink ModelId = 4
// floorModelId "7"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 1 + Sink ModelId = 5
// floorModelId "7"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 1 + Sink ModelId = 6
// floorModelId "7"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "6"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 4
// floorModelId "7"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 5
// floorModelId "7"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 6
// floorModelId "7"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "6"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 4
// floorModelId "7"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 5
// floorModelId "7"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 6
// floorModelId "7"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "7"
// furnitureModelId "6"
// createdAt
// updatedAt


// ! --- Floor ModelId = 8 ---
// ! Bathtub ModelId = 1 + Sink ModelId = 4
// floorModelId "8"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 1 + Sink ModelId = 5
// floorModelId "8"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 1 + Sink ModelId = 6
// floorModelId "8"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "6"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 4
// floorModelId "8"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 5
// floorModelId "8"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 6
// floorModelId "8"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "6"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 4
// floorModelId "8"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 5
// floorModelId "8"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 6
// floorModelId "8"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "8"
// furnitureModelId "6"
// createdAt
// updatedAt


// ! --- Floor ModelId = 9 ---
// ! Bathtub ModelId = 1 + Sink ModelId = 4
// floorModelId "9"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 1 + Sink ModelId = 5
// floorModelId "9"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 1 + Sink ModelId = 6
// floorModelId "9"
// furnitureModelId "1"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "6"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 4
// floorModelId "9"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 5
// floorModelId "9"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 2 + Sink ModelId = 6
// floorModelId "9"
// furnitureModelId "2"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "6"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 4
// floorModelId "9"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "4"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 5
// floorModelId "9"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "5"
// createdAt
// updatedAt

// ! Bathtub ModelId = 3 + Sink ModelId = 6
// floorModelId "9"
// furnitureModelId "3"
// createdAt
// updatedAt

// floorModelId "9"
// furnitureModelId "6"
// createdAt
// updatedAt
