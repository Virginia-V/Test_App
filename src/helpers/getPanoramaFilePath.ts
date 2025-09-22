import { getRenderSignature } from "./getRenderSignature";
import { RenderPayload } from "./selectionFromMenu";

// helpers/getPanoramaFilePath.ts
export async function getPanoramaFilePath(
  payload: RenderPayload
): Promise<string> {
  const signature = getRenderSignature({
    panoramaId: payload.panoramaId,
    baseAssetId: payload.baseAssetId,
    bathtub: {
      bathtub_category_id: payload.bathtub.bathtub_category_id,
      bathtub_model_id: payload.bathtub.bathtub_model_id,
      bathtub_material_id: payload.bathtub.bathtub_material_id ?? null,
      bathtub_color_id: payload.bathtub.bathtub_color_id ?? null
    },
    sink: {
      sink_category_id: payload.sink.sink_category_id,
      sink_model_id: payload.sink.sink_model_id,
      sink_material_id: payload.sink.sink_material_id ?? null
    },
    floor: {
      floor_category_id: payload.floor.floor_category_id,
      floor_model_id: payload.floor.floor_model_id
    }
  });

  const qs = new URLSearchParams({
    signature,
    panoramaId: String(payload.panoramaId)
  });

  // This URL is what you feed into <Image src=... unoptimized />
  return `/api/panorama-file?${qs.toString()}`;
}
