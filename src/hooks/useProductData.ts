"use client";

import { useMemo } from "react";
import { usePanoramaContext } from "@/context/PanoramaContext";
import {
  CategoryType,
  getBucket360Url,
  getEffectiveCategoryType,
  getEffectiveModelIndex,
  getModelImage
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

  // Use utility functions to derive type and model index
  const derivedType = useMemo<CategoryType>(
    () => getEffectiveCategoryType(panoramaType, panoramas),
    [panoramaType, panoramas]
  );

  const derivedModelIndex = useMemo<number>(
    () =>
      getEffectiveModelIndex(
        modelIndex,
        panoramas?.[derivedType]?.modelIndex ?? undefined
      ),
    [modelIndex, panoramas, derivedType]
  );

  // Get the selected image using utility function
  const selectedImageSrc = useMemo(
    () => getModelImage(derivedType, derivedModelIndex),
    [derivedType, derivedModelIndex]
  );

  // Get the bucket360Url using the new function
  const bucket360Url = useMemo(
    () => getBucket360Url(categoryId, modelId, materialId, colorId),
    [categoryId, modelId, materialId, colorId]
  );

  return {
    categoryType: derivedType,
    modelIndex: derivedModelIndex,
    imageSrc: selectedImageSrc,
    bucket360Url,
    canShow3D: derivedType === "bathtub" || derivedType === "sink"
  };
}
