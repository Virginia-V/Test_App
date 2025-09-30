"use client";

import { useMemo } from "react";
import {  usePanoramaContext } from "@/context/PanoramaContext";
import {
  CategoryType,
  getEffectiveCategoryType,
  getEffectiveModelIndex,
  getModelImage
} from "@/helpers";

interface UseProductDataProps {
  panoramaType?: string;
  modelIndex?: number | null;
}

export function useProductData({
  panoramaType,
  modelIndex
}: UseProductDataProps) {
  const { panoramas } = usePanoramaContext();

  // Use utility functions to derive type and model index
  const derivedType = useMemo<CategoryType>(
    () => getEffectiveCategoryType(panoramaType, panoramas),
    [panoramaType, panoramas]
  );

  const derivedModelIndex = useMemo<number>(
    () =>
      getEffectiveModelIndex(modelIndex, panoramas?.[derivedType]?.modelIndex ?? undefined),
    [modelIndex, panoramas, derivedType]
  );

  // Get the selected image using utility function
  const selectedImageSrc = useMemo(
    () => getModelImage(derivedType, derivedModelIndex),
    [derivedType, derivedModelIndex]
  );

  return {
    categoryType: derivedType,
    modelIndex: derivedModelIndex,
    imageSrc: selectedImageSrc,
    canShow3D: derivedType === "bathtub" || derivedType === "sink"
  };
}
