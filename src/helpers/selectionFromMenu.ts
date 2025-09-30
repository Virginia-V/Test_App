import { PanoramaState } from "@/context/PanoramaContext";
import { menu_preview_images } from "@/lib/menu_preview_images";

// // Type representing a selected overlay (bathtub, sink, etc.) with snake_case keys
// export type OverlaySel = {
//   category_id: number;
//   model_id: number;
//   material_id?: number | null;
//   color_id?: number | null;
// };

// // Type for the payload sent to the renderer (now includes baseAssetId and snake_case overlays)
// export type RenderPayload = {
//   panoramaId: number;
//   baseAssetId: number;
//   bathtub: {
//     bathtub_category_id: number;
//     bathtub_model_id: number;
//     bathtub_material_id?: number | null;
//     bathtub_color_id?: number | null;
//   };
//   sink: {
//     sink_category_id: number;
//     sink_model_id: number;
//     sink_material_id?: number | null;
//     sink_color_id?: number | null;
//   };
//   floor: {
//     floor_category_id: number;
//     floor_model_id: number;
//   };
//   order?: Array<"floor" | "bathtub" | "sink">;
// };

// // Helper to safely convert values to numbers, returning undefined for null/undefined
// const num = (v?: string | number | null) => (v == null ? undefined : Number(v));

// /**
//  * Builds a RenderPayload object from the current panorama selection state.
//  * Uses menu_preview_images for categoryId values, including floor.
//  */
// export function buildRenderPayloadFromState({
//   panoramaId,
//   panoramas,
//   order = ["floor", "bathtub", "sink"],
//   baseAssetId = 1
// }: {
//   panoramaId: number;
//   panoramas: Record<"bathtub" | "sink" | "floor", PanoramaState>;
//   order?: Array<"floor" | "bathtub" | "sink">;
//   baseAssetId?: number;
// }): RenderPayload {
//   // --- Bathtub selection ---
//   const btCatId = num(menu_preview_images.bathtub.categoryId)!;
//   const btModelIdx = panoramas.bathtub.modelIndex ?? 0;
//   const btModel = menu_preview_images.bathtub.models[btModelIdx];
//   const btModelId = num(btModel?.modelId)!;
//   const btMatIdx = panoramas.bathtub.materialIndex ?? 0;
//   const btMat = btModel?.materials?.[btMatIdx];
//   const btMatId = num(btMat?.materialId);
//   const btColorIdx = panoramas.bathtub.colorIndex ?? null;
//   const btColor = btColorIdx != null ? btMat?.colors?.[btColorIdx] : undefined;
//   const btColorId = num(btColor?.colorId) ?? null;

//   console.log(
//     "Building RenderPayload with:",
//     btCatId,
//     btModelId,
//     btMatId,
//     btColorId
//   );

//   // --- Sink selection ---
//   const skCatId = num(menu_preview_images.sink.categoryId)!;
//   const skModelIdx = panoramas.sink.modelIndex ?? 0;
//   const skModel = menu_preview_images.sink.models[skModelIdx];
//   const skModelId = num(skModel?.modelId)!;
//   const skMatIdx = panoramas.sink.materialIndex ?? 0;
//   const skMat = skModel?.materials?.[skMatIdx];
//   const skMatId = num(skMat?.materialId);
//   const skColorIdx = panoramas.sink.colorIndex ?? null;
//   const skColor = skColorIdx != null ? skMat?.colors?.[skColorIdx] : undefined;
//   const skColorId = num(skColor?.colorId) ?? null;

//   // --- Floor selection ---
//   const flCatId = num(menu_preview_images.floor.categoryId)!;
//   const flModelIdx = panoramas.floor.modelIndex ?? 0;
//   const flModel = menu_preview_images.floor.models[flModelIdx];
//   const flModelId = num(flModel?.modelId)!;

//   return {
//     panoramaId,
//     baseAssetId,
//     bathtub: {
//       bathtub_category_id: btCatId,
//       bathtub_model_id: btModelId,
//       bathtub_material_id: btMatId ?? null,
//       bathtub_color_id: btColorId ?? null
//     },
//     sink: {
//       sink_category_id: skCatId,
//       sink_model_id: skModelId,
//       sink_material_id: skMatId ?? null,
//       sink_color_id: skColorId ?? null
//     },
//     floor: {
//       floor_category_id: flCatId,
//       floor_model_id: flModelId
//     },
//     order
//   };
// }

// export function getInitialPanoramaState(): {
//   panoramaId: number;
//   baseAssetId: number;
//   panoramas: Record<"bathtub" | "sink" | "floor", PanoramaState>;
// } {
//   return {
//     panoramaId: 1,
//     baseAssetId: 1,
//     panoramas: {
//       bathtub: {
//         modelIndex: 0, // ModelId = 1 (first in menu_preview_images.bathtub.models)
//         materialIndex: 0, // MaterialId = 1 (first in that model's materials)
//         colorIndex: null, // If you want a color, set to 0 or appropriate index
//         menuOpen: false, // Open by default so the menu is visible
//         destinationIndex: 0
//       },
//       sink: {
//         modelIndex: 0, // ModelId = 4 (first in menu_preview_images.sink.models)
//         materialIndex: 0, // MaterialId = 10 (first in that model's materials)
//         colorIndex: null,
//         menuOpen: false,
//         destinationIndex: 0
//       },
//       floor: {
//         modelIndex: 0, // ModelId = 7 (first in menu_preview_images.floor.models)
//         materialIndex: 0,
//         colorIndex: null,
//         menuOpen: false,
//         destinationIndex: 0
//       }
//     }
//   };
// }
