import { pgTable, text, unique } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { AssetTable } from "./asset";
import { relations } from "drizzle-orm";

export const PanoramaTable = pgTable(
  "panoramas",
  {
    id,
    name: text("name").notNull(),
    key: text("key").notNull(),
    createdAt,
    updatedAt
  },
  // Unique constraint to ensure each panorama key is unique
  (t) => [unique("uq_panoramas_key").on(t.key)]
);

export const PanoramaRelations = relations(PanoramaTable, ({ many }) => ({
  // Each panorama can have many assets
  assets: many(AssetTable)
}));

// ! Data

// --- Panorama 1 ---

// id "1"
// name "Bali Bathroom"
// key "Bali_Bathroom"
// createdAt
// updatedAt
