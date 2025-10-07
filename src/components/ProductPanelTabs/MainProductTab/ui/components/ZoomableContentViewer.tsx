"use client";

import React, { useMemo, useRef } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from "react-zoom-pan-pinch";
import { ZoomableImage } from "./ZoomableImage";
import { CategoryType } from "@/helpers";
import Product360 from "@/components/Product360";
import { menu_preview_images } from "@/lib/menu_preview_images";
import Image from "next/image";

interface ZoomableContentViewerProps {
  categoryType: CategoryType;
  modelIndex: number;
  materialIndex?: number; // <-- Add this line
  imageSrc: string;
  bucket360Url?: string;
  renderZoomControls: (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>
  ) => React.ReactNode;
  materialList?: { src: string }[];
  colorList?: { src: string }[];
}


/**
 * Shared zoom configuration for 2D images
 */
const ZOOM_CONFIG = {
  initialScale: 1,
  minScale: 1,
  maxScale: 6,
  doubleClick: { disabled: true },
  wheel: { step: 0.1 },
  pinch: { step: 5 },
  centerZoomedOut: true,
  panning: { disabled: true },
  zoomAnimation: { animationTime: 200, animationType: "linear" as const },
  alignmentAnimation: { animationTime: 200 }
};

/**
 * Renders zoomable 2D image with shared configuration
 */
const ZoomableImageViewer: React.FC<{
  transformRef: React.RefObject<ReactZoomPanPinchRef | null>;
  imageSrc: string;
}> = ({ transformRef, imageSrc }) => (
  <TransformWrapper ref={transformRef} {...ZOOM_CONFIG}>
    <TransformComponent>
      <ZoomableImage src={imageSrc} />
    </TransformComponent>
  </TransformWrapper>
);

export const ZoomableContentViewer: React.FC<ZoomableContentViewerProps> = ({
  categoryType,
  modelIndex,
  materialIndex = 0,
  imageSrc,
  bucket360Url,
  renderZoomControls
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const is360Product = categoryType === "bathtub" || categoryType === "sink";

  const materialList = useMemo(() => {
    if (categoryType === "bathtub" || categoryType === "sink") {
      const models = menu_preview_images[categoryType].models;
      const selectedModel = models[modelIndex ?? 0];
      return selectedModel?.materials
        ? selectedModel.materials.map((mat) => ({ src: mat.file }))
        : [];
    }
    return [];
  }, [categoryType, modelIndex]);

  const colorList = useMemo(() => {
    if (categoryType === "bathtub" || categoryType === "sink") {
      const models = menu_preview_images[categoryType].models;
      const selectedModel = models[modelIndex ?? 0];
      const selectedMaterial = selectedModel?.materials?.[materialIndex ?? 0];
      return selectedMaterial?.colors?.map((c) => ({ src: c.file })) ?? [];
    }
    return [];
  }, [categoryType, modelIndex, materialIndex]);

  return (
    <div className="relative w-full h-full">

      <div className="w-full h-full">
        {is360Product ? (
          <Product360
            transformRef={transformRef}
            bucket360Url={bucket360Url}
            key={`product360-${bucket360Url}`}
            // materialList={materialList}
            // colorList={colorList}
          />
        ) : (
          <ZoomableImageViewer
            transformRef={transformRef}
            imageSrc={imageSrc}
          />
        )}
      </div>
      <div className="absolute top-4 left-4 z-10">
        {renderZoomControls(transformRef)}
      </div>
    </div>
  );
};
