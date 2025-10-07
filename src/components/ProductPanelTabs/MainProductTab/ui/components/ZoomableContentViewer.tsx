"use client";

import React, { useRef } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from "react-zoom-pan-pinch";
import { ZoomableImage } from "./ZoomableImage";
import { CategoryType } from "@/helpers";
import Product360 from "@/components/Product360";

interface ZoomableContentViewerProps {
  categoryType: CategoryType;
  modelIndex: number;
  imageSrc: string;
  bucket360Url?: string;
  renderZoomControls: (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>
  ) => React.ReactNode;
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
  imageSrc,
  bucket360Url,
  renderZoomControls
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Determine viewer type based on category
  const is360Product = categoryType === "bathtub" || categoryType === "sink";

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        {is360Product ? (
          // 360° viewer for bathtubs and sinks
          <Product360 transformRef={transformRef} bucket360Url={bucket360Url} />
        ) : (
          // 2D zoomable image for floors and other categories
          <ZoomableImageViewer
            transformRef={transformRef}
            imageSrc={imageSrc}
          />
        )}
      </div>

      {/* Zoom controls overlay */}
      <div className="absolute top-4 left-4 z-10">
        {renderZoomControls(transformRef)}
      </div>
    </div>
  );
};
