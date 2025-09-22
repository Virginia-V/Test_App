export const BATHTUB_PREVIEW_IMAGES = {
  BATHTUB_MODEL_01:
    "/menu-images/Bathtub/Bathtub_Model_01/PREVIEW_BATH-A_BMAT-A3.jpg",
  BATHTUB_MODEL_02:
    "/menu-images/Bathtub/Bathtub_Model_02/PREVIEW_BATH-B_BMAT-B1.jpg",
  BATHTUB_MODEL_03:
    "/menu-images/Bathtub/Bathtub_Model_03/PREVIEW_BATH-C_BMAT-C1.jpg"
};

export const BATHTUB_MATERIAL_IMAGES = {
  BATHTUB_MODEL_01_MAT_01:
    "/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_01/BMAT-A1.jpg",
  BATHTUB_MODEL_01_MAT_02:
    "/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_02/BMAT-A2.jpg",
  BATHTUB_MODEL_01_MAT_03:
    "/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/BMAT-A3.1.jpg",
  BATHTUB_MODEL_01_MAT_03_COLOR_01:
    "/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/Bathtub_Model_01_Mat_03_Colors/Bathtub_Model_01_Mat_03_Color_01/BMAT-A3.2.jpg",
  BATHTUB_MODEL_01_MAT_03_COLOR_02:
    "/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/Bathtub_Model_01_Mat_03_Colors/Bathtub_Model_01_Mat_03_Color_02/BMAT-A3.3.jpg",
  BATHTUB_MODEL_01_MAT_03_COLOR_03:
    "/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_Materials/Bathtub_Model_01_Mat_03/Bathtub_Model_01_Mat_03_Colors/Bathtub_Model_01_Mat_03_Color_03/BMAT-A3.4.jpg",

  BATHTUB_MODEL_02_MAT_01:
    "/menu-images/Bathtub/Bathtub_Model_02/Bathtub_Model_02_Materials/Bathtub_Model_02_Mat_01/BMAT-B1.jpg",
  BATHTUB_MODEL_02_MAT_02:
    "/menu-images/Bathtub/Bathtub_Model_02/Bathtub_Model_02_Materials/Bathtub_Model_02_Mat_02/BMAT-B2.jpg",
  BATHTUB_MODEL_02_MAT_03:
    "/menu-images/Bathtub/Bathtub_Model_02/Bathtub_Model_02_Materials/Bathtub_Model_02_Mat_03/BMAT-B3.jpg",
  BATHTUB_MODEL_03_MAT_01:
    "/menu-images/Bathtub/Bathtub_Model_03/Bathtub_Model_03_Materials/Bathtub_Model_03_Mat_01/BMAT-C1.jpg",
  BATHTUB_MODEL_03_MAT_02:
    "/menu-images/Bathtub/Bathtub_Model_03/Bathtub_Model_03_Materials/Bathtub_Model_03_Mat_02/BMAT-C2.jpg",
  BATHTUB_MODEL_03_MAT_03:
    "/menu-images/Bathtub/Bathtub_Model_03/Bathtub_Model_03_Materials/Bathtub_Model_03_Mat_03/BMAT-C3.jpg"
};

export const FLOOR_MATERIAL_IMAGES = {
  FLOOR_MAT_01: "/menu-images/Floor/Floor_Materials/Floor_Mat_01/FLOOR-1.jpg",
  FLOOR_MAT_02: "/menu-images/Floor/Floor_Materials/Floor_Mat_02/FLOOR-2.jpg",
  FLOOR_MAT_03: "/menu-images/Floor/Floor_Materials/Floor_Mat_03/FLOOR-3.jpg"
};

export const SINK_PREVIEW_IMAGES = {
  SINK_MODEL_01: "/menu-images/Sink/Sink_Model_01/PREVIEW_FURN-A_FMAT-A1.jpg",
  SINK_MODEL_02: "/menu-images/Sink/Sink_Model_02/PREVIEW_FURN-B_FMAT-1B.jpg",
  SINK_MODEL_03: "/menu-images/Sink/Sink_Model_03/PREVIEW_FURN-C_FMAT-C1.jpg"
};

export const SINK_MATERIAL_IMAGES = {
  SINK_MODEL_01_MAT_01:
    "/menu-images/Sink/Sink_Model_01/Sink_Model_01_Materials/Sink_Model_01_Mat_01/FMAT-A1.jpg",
  SINK_MODEL_01_MAT_02:
    "/menu-images/Sink/Sink_Model_01/Sink_Model_01_Materials/Sink_Model_01_Mat_02/FMAT-A2.jpg",
  SINK_MODEL_01_MAT_03:
    "/menu-images/Sink/Sink_Model_01/Sink_Model_01_Materials/Sink_Model_01_Mat_03/FMAT-A3.jpg",
  SINK_MODEL_02_MAT_01:
    "/menu-images/Sink/Sink_Model_02/Sink_Model_02_Materials/Sink_Model_02_Mat_01/FMAT-B1.jpg",
  SINK_MODEL_02_MAT_02:
    "/menu-images/Sink/Sink_Model_02/Sink_Model_02_Materials/Sink_Model_02_Mat_02/FMAT-B2.jpg",
  SINK_MODEL_02_MAT_03:
    "/menu-images/Sink/Sink_Model_02/Sink_Model_02_Materials/Sink_Model_02_Mat_03/FMAT-B3.jpg",
  SINK_MODEL_03_MAT_01:
    "/menu-images/Sink/Sink_Model_03/Sink_Model_03_Materials/Sink_Model_03_Mat_01/FMAT-C1.jpg",
  SINK_MODEL_03_MAT_02:
    "/menu-images/Sink/Sink_Model_03/Sink_Model_03_Materials/Sink_Model_03_Mat_02/FMAT-C2.jpg",
  SINK_MODEL_03_MAT_03:
    "/menu-images/Sink/Sink_Model_03/Sink_Model_03_Materials/Sink_Model_03_Mat_03/FMAT-C3.jpg"
};

type ColorVariant = {
  colorId: string;
  file: string;
};

type MaterialSpec = {
  materialId: string;
  file: string;
  colors?: ColorVariant[];
};

type ModelSpec = {
  modelId: string;
  previewFile: string;
  materials?: MaterialSpec[];
};

// --- Category shapes per furniture type ---
type BathtubCategory = { categoryId: string; models: ModelSpec[] };
type SinkCategory = { categoryId: string; models: ModelSpec[] };
type FloorCategory = { categoryId: string; models: ModelSpec[] };

export const menu_preview_images: {
  bathtub: BathtubCategory;
  sink: SinkCategory;
  floor: FloorCategory;
} = {
  bathtub: {
    categoryId: "1",
    models: [
      {
        modelId: "1",
        previewFile: BATHTUB_PREVIEW_IMAGES.BATHTUB_MODEL_01,
        materials: [
          {
            materialId: "1",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_01_MAT_01
          },
          {
            materialId: "2",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_01_MAT_02
          },
          {
            materialId: "3",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_01_MAT_03,
            colors: [
              {
                colorId: "1",
                file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_01_MAT_03_COLOR_01
              },
              {
                colorId: "2",
                file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_01_MAT_03_COLOR_02
              },
              {
                colorId: "3",
                file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_01_MAT_03_COLOR_03
              }
            ]
          }
        ]
      },
      {
        modelId: "2",
        previewFile: BATHTUB_PREVIEW_IMAGES.BATHTUB_MODEL_02,
        materials: [
          {
            materialId: "4",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_02_MAT_01
          },
          {
            materialId: "5",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_02_MAT_02
          },
          {
            materialId: "6",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_02_MAT_03
          }
        ]
      },
      {
        modelId: "3",
        previewFile: BATHTUB_PREVIEW_IMAGES.BATHTUB_MODEL_03,
        materials: [
          {
            materialId: "7",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_03_MAT_01
          },
          {
            materialId: "8",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_03_MAT_02
          },
          {
            materialId: "9",
            file: BATHTUB_MATERIAL_IMAGES.BATHTUB_MODEL_03_MAT_03
          }
        ]
      }
    ]
  },

  sink: {
    categoryId: "2",
    models: [
      {
        modelId: "4",
        previewFile: SINK_PREVIEW_IMAGES.SINK_MODEL_01,
        materials: [
          {
            materialId: "10",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_01_MAT_01
          },
          {
            materialId: "11",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_01_MAT_02
          },
          {
            materialId: "12",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_01_MAT_03
          }
        ]
      },
      {
        modelId: "5",
        previewFile: SINK_PREVIEW_IMAGES.SINK_MODEL_02,
        materials: [
          {
            materialId: "13",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_02_MAT_01
          },
          {
            materialId: "14",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_02_MAT_02
          },
          {
            materialId: "15",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_02_MAT_03
          }
        ]
      },
      {
        modelId: "6",
        previewFile: SINK_PREVIEW_IMAGES.SINK_MODEL_03,
        materials: [
          {
            materialId: "16",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_03_MAT_01
          },
          {
            materialId: "17",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_03_MAT_02
          },
          {
            materialId: "18",
            file: SINK_MATERIAL_IMAGES.SINK_MODEL_03_MAT_03
          }
        ]
      }
    ]
  },

  floor: {
    categoryId: "3",
    models: [
      { modelId: "7", previewFile: FLOOR_MATERIAL_IMAGES.FLOOR_MAT_01 },
      { modelId: "8", previewFile: FLOOR_MATERIAL_IMAGES.FLOOR_MAT_02 },
      { modelId: "9", previewFile: FLOOR_MATERIAL_IMAGES.FLOOR_MAT_03 }
    ]
  }
};
