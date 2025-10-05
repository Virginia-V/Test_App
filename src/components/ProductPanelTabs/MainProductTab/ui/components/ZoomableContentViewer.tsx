"use client";

import React, { useRef, useMemo } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from "react-zoom-pan-pinch";
import { ZoomableImage } from "./ZoomableImage";
import {
  Model3DViewerWithLoading,
  preloadGLB
} from "./Model3DViewerWithLoading";
import { CategoryType } from "@/helpers";
import { get3DPreviewFor } from "@/lib";
import Product360 from "@/components/Product360";

interface ZoomableContentViewerProps {
  categoryType: CategoryType;
  modelIndex: number;
  imageSrc: string;
  show3D: boolean;
  show360: boolean;
  onToggle3D: () => void;
  renderZoomControls: (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>,
    show3D: boolean,
    onToggle3D: () => void
  ) => React.ReactNode;
}

export const ZoomableContentViewer: React.FC<ZoomableContentViewerProps> = ({
  categoryType,
  modelIndex,
  imageSrc,
  show3D,
  show360,
  onToggle3D,
  renderZoomControls
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const canShow3D = categoryType === "bathtub" || categoryType === "sink";
  const modelUrl = useMemo(
    () => (canShow3D ? get3DPreviewFor(categoryType, modelIndex) : null),
    [canShow3D, categoryType, modelIndex]
  );

  const handleToggle3D = () => {
    if (canShow3D && modelUrl) preloadGLB(modelUrl);
    onToggle3D();
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        {show3D ? (
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={6}
            doubleClick={{ disabled: true }}
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
            centerZoomedOut
            zoomAnimation={{ animationTime: 200, animationType: "linear" }}
            alignmentAnimation={{ animationTime: 200 }}
          >
            <TransformComponent>
              <Model3DViewerWithLoading
                categoryType={categoryType}
                modelIndex={modelIndex}
              />
            </TransformComponent>
          </TransformWrapper>
        ) : show360 ? (
          // Show 360° view without zoom/pan
          <div className="w-full h-full flex items-center justify-center">
            <Product360 />
          </div>
        ) : (
          // Show regular image with zoom/pan
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={6}
            doubleClick={{ disabled: true }}
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
            centerZoomedOut
            zoomAnimation={{ animationTime: 200, animationType: "linear" }}
            alignmentAnimation={{ animationTime: 200 }}
          >
            <TransformComponent>
              <ZoomableImage src={imageSrc} />
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>

      {/* Zoom controls positioned absolutely on top of the content */}
      <div className="absolute top-4 left-4 z-10">
        {renderZoomControls(transformRef, show3D, handleToggle3D)}
      </div>
    </div>
  );
};
