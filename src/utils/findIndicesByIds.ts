import { menu_preview_images } from "@/lib";

export function findIndicesByIds(
  type: "bathtub" | "sink" | "floor",
  modelId?: string | number,
  materialId?: string | number,
  colorId?: string | number | null
): { modelIndex?: number; materialIndex?: number; colorIndex?: number | null } {
  const models = menu_preview_images[type].models;

  const modelIndex = modelId
    ? models.findIndex((m) => m.modelId === String(modelId))
    : undefined;

  const materialIndex =
    modelIndex != null && modelIndex >= 0 && materialId
      ? models[modelIndex].materials?.findIndex(
          (mat) => mat.materialId === String(materialId)
        )
      : undefined;

  const colorIndex =
    materialIndex != null &&
    materialIndex >= 0 &&
    models[modelIndex!]?.materials?.[materialIndex]?.colors
      ? colorId === null
        ? null // explicit "no color"
        : models[modelIndex!]?.materials?.[materialIndex]?.colors?.findIndex(
            (c) => c.colorId === String(colorId)
          )
      : undefined;

  return { modelIndex, materialIndex, colorIndex };
}
