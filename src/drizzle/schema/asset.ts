import {
  pgTable,
  text,
  index,
  unique,
  pgEnum,
  integer
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CategoryTable } from "./category";
import { ModelTable } from "./model";
import { ColorTable } from "./color";
import { MaterialTable } from "./material";
import { relations } from "drizzle-orm";
import { PanoramaTable } from "./panorama";

export const AssetKindEnum = pgEnum("asset_kind", ["base", "overlay", "floor"]);

export const AssetTable = pgTable(
  "assets",
  {
    id,

    s3Key: text("s3_key").notNull(),

    filePath: text("file_path").notNull(),

    panoramaId: integer("panorama_id")
      .notNull()
      .references(() => PanoramaTable.id, { onDelete: "restrict" }),

    assetKind: AssetKindEnum("asset_kind").notNull(), // "base" | "overlay" | "floor"

    // For overlays / floors (optional for base)
    categoryId: integer("category_id").references(() => CategoryTable.id, {
      onDelete: "restrict"
    }),
    modelId: integer("model_id").references(() => ModelTable.id, {
      onDelete: "restrict"
    }),
    materialId: integer("material_id").references(() => MaterialTable.id, {
      onDelete: "restrict"
    }),
    colorId: integer("color_id").references(() => ColorTable.id, {
      onDelete: "restrict"
    }),

    createdAt,
    updatedAt
  },
  (t) => [
    index("idx_assets_panorama_id").on(t.panoramaId),
    index("idx_assets_kind").on(t.assetKind),
    index("idx_assets_category_id").on(t.categoryId),
    index("idx_assets_model_id").on(t.modelId),
    index("idx_assets_material_id").on(t.materialId),
    index("idx_assets_color_id").on(t.colorId),

    // Prevent duplicate tuple per panorama+specificity+kind
    unique("uq_assets_combo").on(
      t.panoramaId,
      t.assetKind,
      t.categoryId,
      t.modelId,
      t.materialId,
      t.colorId
    )
  ]
);

export const AssetRelations = relations(AssetTable, ({ one }) => ({
  panorama: one(PanoramaTable, {
    fields: [AssetTable.panoramaId],
    references: [PanoramaTable.id]
  }),
  category: one(CategoryTable, {
    fields: [AssetTable.categoryId],
    references: [CategoryTable.id]
  }),
  model: one(ModelTable, {
    fields: [AssetTable.modelId],
    references: [ModelTable.id]
  }),
  material: one(MaterialTable, {
    fields: [AssetTable.materialId],
    references: [MaterialTable.id]
  }),
  color: one(ColorTable, {
    fields: [AssetTable.colorId],
    references: [ColorTable.id]
  })
}));

// ! Data

// --- Main ---

// id "1"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Main/00_BACKGROUND.png
// panoramaId "1"
// assetKind "base"
// categoryId null
// modelId null
// materialId null
// colorId null
// createdAt
// updatedAt

// --- Bathtub ---

// --- Model 01 ---

// id "2"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_01/01_BATH-A_BMAT-A1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "1"
// materialId "1"
// colorId null
// createdAt
// updatedAt

// id "3"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_02/01_BATH-A_BMAT-A2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "1"
// materialId "2"
// colorId null
// createdAt
// updatedAt

// id "4"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/01_BATH-A_BMAT-A3.1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "1"
// materialId "3"
// colorId null
// createdAt
// updatedAt

// id "5"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/Bathtub_Model_01_Mat_03_Colors/Bathtub_Model_01_Mat_03_Color_01/01_BATH-A_BMAT-A3.2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "1"
// materialId "3"
// colorId "1"
// createdAt
// updatedAt

// id "6"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/Bathtub_Model_01_Mat_03_Colors/Bathtub_Model_01_Mat_03_Color_02/01_BATH-A_BMAT-A3.3.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "1"
// materialId "3"
// colorId "2"
// createdAt
// updatedAt

// id "7"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/Bathtub_Model_01_Mat_03_Colors/Bathtub_Model_01_Mat_03_Color_03/01_BATH-A_BMAT-A3.4.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "1"
// materialId "3"
// colorId "3"
// createdAt
// updatedAt

// --- Model 02 ---

// id "8"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_02_Materials/Bathtub_Model_02_Mat_01/01_BATH-B_BMAT-B1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "2"
// materialId "4"
// colorId null
// createdAt
// updatedAt

// id "9"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_02_Materials/Bathtub_Model_02_Mat_02/01_BATH-B_BMAT-B2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "2"
// materialId "5"
// colorId null
// createdAt
// updatedAt

// id "10"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_02_Materials/Bathtub_Model_02_Mat_03/01_BATH-B_BMAT-B3.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "2"
// materialId "6"
// colorId null
// createdAt
// updatedAt

// --- Model 03 ---

// id "11"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_03_Materials/Bathtub_Model_03_Mat_01/01_BATH-C_BMAT-C1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "3"
// materialId "7"
// colorId null
// createdAt
// updatedAt

// id "12"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_03_Materials/Bathtub_Model_03_Mat_02/01_BATH-C_BMAT-C2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "3"
// materialId "8"
// colorId null
// createdAt
// updatedAt

// id "13"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Bathtub/Bathtub_Model_03_Materials/Bathtub_Model_03_Mat_03/01_BATH-C_BMAT-C3.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "1"
// modelId "3"
// materialId "9"
// colorId null
// createdAt
// updatedAt

// --- Sink ---

// --- Model 01 ---

// id "14"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_01_Materials/Sink_Model_01_Mat_01/02_FURNITURE-A_FMAT-A1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "4"
// materialId "10"
// colorId null
// createdAt
// updatedAt

// id "15"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_01_Materials/Sink_Model_01_Mat_02/02_FURNITURE-A_FMAT-A2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "4"
// materialId "11"
// colorId null
// createdAt
// updatedAt

// id "16"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_01_Materials/Sink_Model_01_Mat_03/02_FURNITURE-A_FMAT-A3.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "4"
// materialId "12"
// colorId null
// createdAt
// updatedAt

// -- Model 02 ---

// id "17"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_02_Materials/Sink_Model_02_Mat_01/02_FURNITURE-B_FMAT-B1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "5"
// materialId "13"
// colorId null
// createdAt
// updatedAt

// id "18"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_02_Materials/Sink_Model_02_Mat_02/02_FURNITURE-B_FMAT-B2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "5"
// materialId "14"
// colorId null
// createdAt
// updatedAt

// id "19"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_02_Materials/Sink_Model_02_Mat_03/02_FURNITURE-B_FMAT-B3.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "5"
// materialId "15"
// colorId null
// createdAt
// updatedAt

// --- Model 03 ---

// id "20"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_03_Materials/Sink_Model_03_Mat_01/02_FURNITURE-C_FMAT-C1.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "6"
// materialId "16"
// colorId null
// createdAt
// updatedAt

// id "21"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_03_Materials/Sink_Model_03_Mat_02/02_FURNITURE-C_FMAT-C2.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "6"
// materialId "17"
// colorId null
// createdAt
// updatedAt

// id "22"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Sink/Sink_Model_03_Materials/Sink_Model_03_Mat_03/02_FURNITURE-C_FMAT-C3.png
// panoramaId "1"
// assetKind "overlay"
// categoryId "2"
// modelId "6"
// materialId "18"
// colorId null
// createdAt
// updatedAt

// ! --- Floor Model 1 ---

// id "23"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-A_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "24"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-A_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "25"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-A_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "26"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-B_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "27"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-B_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "28"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-B_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "29"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-C_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "30"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-C_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "31"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_01/03_FLOOR-1_BATH-C_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "7"
// materialId null
// colorId null
// createdAt
// updatedAt

// ! --- Floor Model 2 ---

// id "32"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-A_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "33"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-A_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "34"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-A_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "35"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-B_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "36"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-B_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "37"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-B_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "38"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-C_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "39"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-C_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "40"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_02/03_FLOOR-2_BATH-C_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "8"
// materialId null
// colorId null
// createdAt
// updatedAt

// ! --- Floor Model 3 ---

// id "41"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-A_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "42"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-A_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "43"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-A_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "44"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-B_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "45"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-B_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "46"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-B_FURN-C.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "47"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-C_FURN-A.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "48"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-C_FURN-B.png
// panoramaId "1"
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt

// id "49"
// filePath: https://nhztukbxm7x5n3yc.public.blob.vercel-storage.com/Floor/Floor_Material_03/03_FLOOR-3_BATH-C_FURN-C.png
// assetKind "floor"
// categoryId "3"
// modelId "9"
// materialId null
// colorId null
// createdAt
// updatedAt
