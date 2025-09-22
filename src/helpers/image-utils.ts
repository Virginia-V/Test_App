import {
  IMG_SINK_PREVIEW_IMAGES,
  IMG_BATHTUB_PREVIEW_IMAGES,
  IMG_FLOOR_PREVIEW_IMAGES
} from "../lib/panel-images";
import { CHAIR_MODEL_ITEMS } from "../lib";

// Allowed category types
export type CategoryType = "bathtub" | "sink" | "floor";

// Create a mapping for the IMG_ constants
const IMG_PREVIEW_MAPS = {
  sink: IMG_SINK_PREVIEW_IMAGES,
  bathtub: IMG_BATHTUB_PREVIEW_IMAGES,
  floor: IMG_FLOOR_PREVIEW_IMAGES
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
 * Gets all model images for a category (useful for galleries)
 */
export function getCategoryModelImages(categoryType: CategoryType): Array<{
  src: string;
  label: string;
  modelId: string;
}> {
  const previewMap = IMG_PREVIEW_MAPS[categoryType];

  if (!previewMap) {
    return Object.keys(CHAIR_MODEL_ITEMS).map((key) => ({
      src: CHAIR_MODEL_ITEMS[key as keyof typeof CHAIR_MODEL_ITEMS].src,
      label: "CH-2045-LN",
      modelId: key
    }));
  }

  return Object.entries(previewMap).map(([key, src], idx) => ({
    src,
    label: `Model ${idx + 1}`,
    modelId: key
  }));
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
