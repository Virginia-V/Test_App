import {
  BATHTUB_PREVIEW_IMAGES,
  CHAIR_MODEL_ITEMS,
  FLOOR_MATERIAL_IMAGES,
  menu_preview_images,
  SINK_PREVIEW_IMAGES
} from "../lib";

// Allowed category types
export type CategoryType = "bathtub" | "sink" | "floor";

// Create a mapping for the IMG_ constants
const IMG_PREVIEW_MAPS = {
  sink: SINK_PREVIEW_IMAGES,
  bathtub: BATHTUB_PREVIEW_IMAGES,
  floor: FLOOR_MATERIAL_IMAGES
} as const;

/**
 * Normalizes a panorama type string to a valid CategoryType
 */
export function normalizeCategoryType(
  panoramaType?: string
): CategoryType | undefined {
  if (typeof panoramaType !== "string") return undefined;
  const normalized = panoramaType.trim().toLowerCase();
  return normalized === "bathtub" ||
    normalized === "sink" ||
    normalized === "floor"
    ? (normalized as CategoryType)
    : undefined;
}

/**
 * Gets the image source for a specific model in a category
 */
export function getModelImage(
  categoryType: CategoryType,
  modelIndex: number
): string {
  const previewMap = IMG_PREVIEW_MAPS[categoryType];

  if (!previewMap) {
    return CHAIR_MODEL_ITEMS.Chair_1.src;
  }

  // Get the keys array and clamp the index
  const keys = Object.keys(previewMap);
  const clampedIndex = Math.max(0, Math.min(keys.length - 1, modelIndex));
  const selectedKey = keys[clampedIndex];

  return (
    previewMap[selectedKey as keyof typeof previewMap] ||
    CHAIR_MODEL_ITEMS.Chair_1.src
  );
}

/**
 * Helper function to match category by type
 */
function findCategoryByType(categoryType: CategoryType) {
  return Object.values(menu_preview_images).find((category) => {
    // Match based on categoryId patterns or known IDs
    // You'll need to adjust these based on your actual category IDs
    const categoryId = category.categoryId;

    switch (categoryType) {
      case "bathtub":
        // Adjust these conditions based on your actual category IDs
        return (
          categoryId === "1" ||
          categoryId === "bathtub" ||
          categoryId?.toLowerCase().includes("bathtub")
        );
      case "sink":
        return (
          categoryId === "2" ||
          categoryId === "sink" ||
          categoryId?.toLowerCase().includes("sink")
        );
      case "floor":
        return (
          categoryId === "3" ||
          categoryId === "floor" ||
          categoryId?.toLowerCase().includes("floor")
        );
      default:
        return false;
    }
  });
}

/**
 * Gets all model images for a category with their associated IDs
 */
export function getCategoryModelImages(categoryType: CategoryType): Array<{
  src: string;
  label: string;
  modelId: string;
  categoryId?: string;
  materialId?: string;
  colorId?: string;
}> {
  const previewMap = IMG_PREVIEW_MAPS[categoryType];

  if (!previewMap) {
    // Fallback to chair items if no preview map exists
    return Object.keys(CHAIR_MODEL_ITEMS).map((key) => ({
      src: CHAIR_MODEL_ITEMS[key as keyof typeof CHAIR_MODEL_ITEMS].src,
      label: "CH-2045-LN",
      modelId: key,
      categoryId: undefined,
      materialId: undefined,
      colorId: undefined
    }));
  }

  // Find matching category using the helper function
  const matchingCategory = findCategoryByType(categoryType);

  if (!matchingCategory) {
    // Fallback to just preview map data
    return Object.entries(previewMap).map(([key, src], idx) => ({
      src,
      label: `Model ${idx + 1}`,
      modelId: key,
      categoryId: undefined,
      materialId: undefined,
      colorId: undefined
    }));
  }

  // Extract data from menu_preview_images structure
  const results: Array<{
    src: string;
    label: string;
    modelId: string;
    categoryId?: string;
    materialId?: string;
    colorId?: string;
  }> = [];

  const previewKeys = Object.keys(previewMap);

  matchingCategory.models.forEach((model, modelIdx) => {
    // Use the first material as default
    const firstMaterial = model.materials?.[0];

    // Use the first color if available, otherwise use material data
    const firstColor = firstMaterial?.colors?.[0];

    // Get preview image from previewMap using model index
    const previewKey = previewKeys[modelIdx];
    const previewSrc = previewKey
      ? previewMap[previewKey as keyof typeof previewMap]
      : "";

    // Fallback to a default image if no preview found
    const fallbackSrc = CHAIR_MODEL_ITEMS.Chair_1.src;

    // Generate label from modelId or use generic label
    const generateLabel = (modelId: string, index: number): string => {
      // Try to create a meaningful label from modelId
      if (modelId) {
        return modelId.toUpperCase();
      }
      return `Model ${index + 1}`;
    };

    results.push({
      src: previewSrc || fallbackSrc,
      label: generateLabel(model.modelId, modelIdx),
      modelId: model.modelId,
      categoryId: matchingCategory.categoryId,
      materialId: firstMaterial?.materialId,
      colorId: firstColor?.colorId
    });
  });

  return results;
}

/**
 * Gets the effective category type with fallback logic
 */
export function getEffectiveCategoryType(
  propType?: string,
  panoramaContext?: {
    sink?: { menuOpen?: boolean };
    bathtub?: { menuOpen?: boolean };
    floor?: { menuOpen?: boolean };
  }
): CategoryType {
  // Prop takes precedence
  const normalizedProp = normalizeCategoryType(propType);
  if (normalizedProp) return normalizedProp;

  // Check context
  if (panoramaContext?.sink?.menuOpen) return "sink";
  if (panoramaContext?.bathtub?.menuOpen) return "bathtub";
  if (panoramaContext?.floor?.menuOpen) return "floor";

  // Default fallback
  return "bathtub";
}

/**
 * Gets the effective model index with fallback logic
 */
export function getEffectiveModelIndex(
  propModelIndex?: number | null,
  contextModelIndex?: number
): number {
  // Prop takes precedence if it's a finite number
  if (typeof propModelIndex === "number" && Number.isFinite(propModelIndex)) {
    return propModelIndex;
  }

  // Context fallback
  if (
    typeof contextModelIndex === "number" &&
    Number.isFinite(contextModelIndex)
  ) {
    return contextModelIndex;
  }

  // Default to 0
  return 0;
}

/**
 * Get bucket360Url based on categoryId, modelId, materialId, and optionally colorId
 */
export const getBucket360Url = (
  categoryId?: number | null | undefined,
  modelId?: number | null | undefined,
  materialId?: number | null | undefined,
  colorId?: number | null | undefined
): string | undefined => {
  console.log("🔍 getBucket360Url - Input parameters:", {
    categoryId,
    modelId,
    materialId,
    colorId
  });

  // Convert to strings for comparison
  const categoryIdStr = categoryId?.toString();
  const modelIdStr = modelId?.toString();
  const materialIdStr = materialId?.toString();
  const colorIdStr = colorId?.toString();

  // Find the category
  const category = Object.values(menu_preview_images).find(
    (cat) => cat.categoryId === categoryIdStr
  );

  if (!category) {
    console.warn(
      `❌ getBucket360Url - Category not found for categoryId: ${categoryId}`
    );
    return undefined;
  }

  console.log("✅ getBucket360Url - Found category:", category.categoryId);

  // Find the model
  const model = category.models.find((m) => m.modelId === modelIdStr);
  if (!model) {
    console.warn(
      `❌ getBucket360Url - Model not found for modelId: ${modelId}`
    );
    return undefined;
  }

  console.log("✅ getBucket360Url - Found model:", model.modelId);

  // Find the material
  const material = model.materials?.find(
    (mat) => mat.materialId === materialIdStr
  );
  if (!material) {
    console.warn(
      `❌ getBucket360Url - Material not found for materialId: ${materialId}`
    );
    return undefined;
  }

  console.log("✅ getBucket360Url - Found material:", material.materialId);

  // If colorId is provided and the material has colors, look for the color's bucket360Url
  if (colorId && material.colors) {
    const color = material.colors.find((c) => c.colorId === colorIdStr);
    if (color?.bucket360Url) {
      console.log(
        "✅ getBucket360Url - Using color bucket360Url:",
        color.bucket360Url
      );
      return color.bucket360Url;
    }
    console.warn(
      `❌ getBucket360Url - Color not found or no bucket360Url for colorId: ${colorId}`
    );
  }

  console.log(
    "✅ getBucket360Url - Using material bucket360Url:",
    material.bucket360Url
  );
  return material.bucket360Url;
};
