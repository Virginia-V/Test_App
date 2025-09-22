export * from "./3D_images";
export * from "./destination-images";
export * from "./flags";
export * from "./furniture-images";
export * from "./inventory-images";
export * from "./product_icons";
export * from "./menu_preview_images";

/**
 * Get all material keys for a given object type from a data object (MENU_IMAGES or PANORAMAS).
 */
export function getMaterialKeys<
  T extends Record<string, object>,
  K extends keyof T
>(data: T, objectType: K): Array<keyof T[K]> {
  const obj = data[objectType];
  if (!obj) return [];
  return Object.keys(obj) as Array<keyof T[K]>;
}

/**
 * Get all color keys for a given object type and material key from a data object (MENU_IMAGES or PANORAMAS).
 * For MENU_IMAGES, looks for a 'colors' property. For PANORAMAS, returns keys if the material is an object.
 */
export function getColorKeys<
  T extends Record<string, unknown>,
  K extends keyof T,
  M extends keyof T[K]
>(data: T, objectType: K, materialKey: M): string[] {
  const material = data[objectType][materialKey];
  if (material && typeof material === "object") {
    if ("colors" in material) {
      return Object.keys((material as { colors: object }).colors);
    }
    if (!Array.isArray(material)) {
      return Object.keys(material as object);
    }
  }
  return [];
}
