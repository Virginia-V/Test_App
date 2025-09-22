export const IMG_SINK_PREVIEW_IMAGES = {
  SINK_MODEL_01:
    "/menu-images/Sink/Sink_Model_01/IMG_PREVIEW_FURN-A_FMAT-A1.jpg",
  SINK_MODEL_02: "/menu-images/Sink/Sink_Model_02/PREVIEW_FURN-B_FMAT-1B.jpg",
  SINK_MODEL_03: "/menu-images/Sink/Sink_Model_03/PREVIEW_FURN-C_FMAT-C1.jpg"
};

export const IMG_BATHTUB_PREVIEW_IMAGES = {
  BATHTUB_MODEL_01:
    "/menu-images/Bathtub/Bathtub_Model_01/PREVIEW_BATH-A_BMAT-A3.jpg",
  BATHTUB_MODEL_02:
    "/menu-images/Bathtub/Bathtub_Model_02/PREVIEW_BATH-B_BMAT-B1.jpg",
  BATHTUB_MODEL_03:
    "/menu-images/Bathtub/Bathtub_Model_03/PREVIEW_BATH-C_BMAT-C1.jpg"
};

export const IMG_FLOOR_PREVIEW_IMAGES = {
  FLOOR_MODEL_01: "/menu-images/Floor/Floor_Materials/Floor_Mat_01/FLOOR-1.jpg",
  FLOOR_MODEL_02: "/menu-images/Floor/Floor_Materials/Floor_Mat_02/FLOOR-2.jpg",
  FLOOR_MODEL_03: "/menu-images/Floor/Floor_Materials/Floor_Mat_03/FLOOR-3.jpg"
};

export const BATHTUB_PANEL_IMAGES = {
  BATHTUB_MODEL_01:
    "/menu-images/Bathtub/Bathtub_Model_01/PREVIEW_BATH-A_BMAT-A3.jpg",
  BATHTUB_MODEL_02:
    "/menu-images/Bathtub/Bathtub_Model_02/PREVIEW_BATH-B_BMAT-B1.jpg",
  BATHTUB_MODEL_03:
    "/menu-images/Bathtub/Bathtub_Model_03/PREVIEW_BATH-C_BMAT-C1.jpg"
};

export const SINK_PREVIEW_IMAGES = {
  SINK_MODEL_01: "/menu-images/Sink/Sink_Model_01/PREVIEW_FURN-A_FMAT-A1.jpg",
  SINK_MODEL_02: "/menu-images/Sink/Sink_Model_02/PREVIEW_FURN-B_FMAT-1B.jpg",
  SINK_MODEL_03: "/menu-images/Sink/Sink_Model_03/PREVIEW_FURN-C_FMAT-C1.jpg"
};

export const FLOOR_MODEL_IMAGES = {
  FLOOR_MODEL_01: "/menu-images/Floor/Floor_Materials/Floor_Mat_01/FLOOR-1.jpg",
  FLOOR_MODEL_02: "/menu-images/Floor/Floor_Materials/Floor_Mat_02/FLOOR-2.jpg",
  FLOOR_MODEL_03: "/menu-images/Floor/Floor_Materials/Floor_Mat_03/FLOOR-3.jpg"
};

export const BATHTUB_IMAGES = {
  BATHTUB_MODEL_01: {
    modelId: 1,
    filePath: BATHTUB_PANEL_IMAGES.BATHTUB_MODEL_01
  },
  BATHTUB_MODEL_02: {
    modelId: 2,
    filePath: BATHTUB_PANEL_IMAGES.BATHTUB_MODEL_02
  },
  BATHTUB_MODEL_03: {
    modelId: 3,
    filePath: BATHTUB_PANEL_IMAGES.BATHTUB_MODEL_03
  }
};

export const SINK_IMAGES = {
  SINK_MODEL_01: {
    modelId: 1,
    filePath: SINK_PREVIEW_IMAGES.SINK_MODEL_01
  },
  SINK_MODEL_02: {
    modelId: 2,
    filePath: SINK_PREVIEW_IMAGES.SINK_MODEL_02
  },
  SINK_MODEL_03: {
    modelId: 3,
    filePath: SINK_PREVIEW_IMAGES.SINK_MODEL_03
  }
};

export const FLOOR_IMAGES = {
  FLOOR_MODEL_01: {
    modelId: 1,
    filePath: FLOOR_MODEL_IMAGES.FLOOR_MODEL_01
  },
  FLOOR_MODEL_02: {
    modelId: 2,
    filePath: FLOOR_MODEL_IMAGES.FLOOR_MODEL_02
  },
  FLOOR_MODEL_03: {
    modelId: 3,
    filePath: FLOOR_MODEL_IMAGES.FLOOR_MODEL_03
  }
};

// --- Types (same as yours) ---
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

type BathtubCategory = { categoryId: string; models: ModelSpec[] };
type SinkCategory = { categoryId: string; models: ModelSpec[] };
type FloorCategory = { categoryId: string; models: ModelSpec[] };

type FlatPreviewMap = Record<string, { modelId: number; filePath: string }>;

function mapToModelSpecs<T extends FlatPreviewMap>(src: T): ModelSpec[] {
  return Object.values(src)
    .sort((a, b) => a.modelId - b.modelId)
    .map(({ modelId, filePath }) => ({
      modelId: String(modelId),
      previewFile: filePath
    }));
}

const CATEGORY_IDS = {
  bathtub: "1",
  sink: "2",
  floor: "3"
} as const;

export const info_panel_images: {
  bathtub: BathtubCategory;
  sink: SinkCategory;
  floor: FloorCategory;
} = {
  bathtub: {
    categoryId: CATEGORY_IDS.bathtub,
    models: mapToModelSpecs(BATHTUB_IMAGES)
  },
  sink: {
    categoryId: CATEGORY_IDS.sink,
    models: mapToModelSpecs(SINK_IMAGES)
  },
  floor: {
    categoryId: CATEGORY_IDS.floor,
    models: mapToModelSpecs(FLOOR_IMAGES)
  }
};
