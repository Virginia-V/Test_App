"use client";

import { useMemo } from "react";
import { usePanoramaContext } from "@/context/PanoramaContext";
import {
  CategoryType,
  getEffectiveCategoryType,
  getEffectiveModelIndex,
  getModelImage,
  getBucket360Url
} from "@/helpers";

interface UseProductDataProps {
  panoramaType?: string;
  modelIndex?: number | null;
  categoryId?: number | null | undefined;
  modelId?: number | null | undefined;
  materialId?: number | null | undefined;
  colorId?: number | null | undefined;
}

export function useProductData({
  panoramaType,
  modelIndex,
  categoryId,
  modelId,
  materialId,
  colorId
}: UseProductDataProps) {
  const { panoramas } = usePanoramaContext();

  // Derive category type
  const categoryType = useMemo<CategoryType>(
    () => getEffectiveCategoryType(panoramaType, panoramas),
    [panoramaType, panoramas]
  );

  // Derive effective model index
  const effectiveModelIndex = useMemo(
    () => getEffectiveModelIndex(modelIndex),
    [modelIndex]
  );

  // Get image source
  const imageSrc = useMemo(
    () => getModelImage(categoryType, effectiveModelIndex),
    [categoryType, effectiveModelIndex]
  );

  // Get bucket360Url - CRITICAL: React to all ID changes
  const bucket360Url = useMemo(() => {
    console.log("🔄 useProductData - Calculating bucket360Url with:", {
      categoryId,
      modelId,
      materialId,
      colorId
    });

    const url = getBucket360Url(categoryId, modelId, materialId, colorId);

    console.log("✅ useProductData - Generated bucket360Url:", url);

    return url;
  }, [categoryId, modelId, materialId, colorId]); // ✅ All dependencies

  return {
    categoryType,
    modelIndex: effectiveModelIndex,
    imageSrc,
    bucket360Url
  };
}
