import { pgTable, text, unique } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { AssetTable } from "./asset";
import { relations } from "drizzle-orm";
import { ModelTable } from "./model";

export const CategoryTable = pgTable(
  "categories",
  {
    id,
    key: text("key").notNull(), // e.g. "bathtub", "sink", "floor"
    createdAt,
    updatedAt
  },
  (t) => [unique("uq_categories_key").on(t.key)] // Add a unique constraint on the 'key' column
);

export const CategoryRelations = relations(CategoryTable, ({ many }) => ({
  models: many(ModelTable), // A category can have many models
  assets: many(AssetTable) // A category can have many assets
}));

// ! Data

// id "1"
// key "Bathtub"
// createdAt
// updatedAt

// id "2"
// key "Sink"
// createdAt
// updatedAt

// id "3"
// key "Floor"
// createdAt
// updatedAt
