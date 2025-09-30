// import { PanoramaType } from "@/context/PanoramaContext";

export const IMAGES_3D = {
  Armchair_3D_Hotspot: "/3D-images/3D_LOGO_ARMCHAIR.glb",
  Armchair_3D_Image: "/3D-images/test_02.glb",
  Floor_3D_Hotspot_01: "/3D-images/3D_LOGO_FLOOR_01.glb",
  Floor_3D_Hotspot_02: "/3D-images/3D_LOGO_FLOOR_02.glb",
  Bathtub_3D_Hotspot: "/3D-images/3D_LOGO_BATHTUB_V02.glb",
  Sink_3D_Hotspot: "/3D-images/3D_LOGO_SINK.glb"
};

export const IMAGES_3D_PREVIEWS = {
  BATHTUB_MODEL_01: "/3D-images/Bathtub/Bathtub_Model_01/BATH-A_BMAT-A1.glb",
  BATHTUB_MODEL_02: "/3D-images/Bathtub/Bathtub_Model_02/BATH-B_BMAT-B1.glb",
  BATHTUB_MODEL_03: "/3D-images/Bathtub/Bathtub_Model_03/BATH-C_BMAT-C1.glb",

  SINK_MODEL_01: "/3D-images/Sink/Sink_Model_01/FURN-A_FMAT-A1.glb",
  SINK_MODEL_02: "/3D-images/Sink/Sink_Model_02/FURN-B_FMAT-B1.glb",
  SINK_MODEL_03: "/3D-images/Sink/Sink_Model_03/FURN-C_FMAT-C1.glb"
};

// types
export type Preview3DModelSpec = {
  modelId: string;
  file: string;
};

type BathtubPreviewCategory = { models: Preview3DModelSpec[] };
type SinkPreviewCategory = { models: Preview3DModelSpec[] };

// catalog
export const previews3D: {
  bathtub: BathtubPreviewCategory;
  sink: SinkPreviewCategory;
} = {
  bathtub: {
    models: [
      {
        modelId: "model01",
        file: IMAGES_3D_PREVIEWS.BATHTUB_MODEL_01
      },
      {
        modelId: "model02",
        file: IMAGES_3D_PREVIEWS.BATHTUB_MODEL_02
      },
      {
        modelId: "model03",
        file: IMAGES_3D_PREVIEWS.BATHTUB_MODEL_03
      }
    ]
  },

  sink: {
    models: [
      {
        modelId: "model01",
        file: IMAGES_3D_PREVIEWS.SINK_MODEL_01
      },
      {
        modelId: "model02",
        file: IMAGES_3D_PREVIEWS.SINK_MODEL_02
      },
      {
        modelId: "model03",
        file: IMAGES_3D_PREVIEWS.SINK_MODEL_03
      }
    ]
  }
};

// export type PreviewPanoramaType = "bathtub" | "sink";

// Safe, index-clamped accessor that only supports bathtub | sink
// export const get3DPreviewFor = (
//   type: Exclude<PanoramaType, "floor">,
//   modelIndex: number
// ): string | null => {
//   const list = previews3D[type]?.models ?? [];
//   if (!list.length) return null;
//   const idx = Math.max(0, Math.min(modelIndex ?? 0, list.length - 1));
//   return list[idx]?.file ?? null;
// };

// export const get3DPreviewForId = (
//   type: Exclude<PanoramaType, "floor">,
//   modelId: string
// ): string | null =>
//   previews3D[type]?.models.find((m) => m.modelId === modelId)?.file ?? null;
