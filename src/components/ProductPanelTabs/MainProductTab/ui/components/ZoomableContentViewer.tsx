"use client";

import React, { useRef, useMemo } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from "react-zoom-pan-pinch";
import { ZoomableImage } from "./ZoomableImage";
// import {
//   Model3DViewerWithLoading,
//   preloadGLB
// } from "./Model3DViewerWithLoading";
import { CategoryType } from "@/helpers";
// import { get3DPreviewFor } from "@/lib";

interface ZoomableContentViewerProps {
  categoryType: CategoryType;
  modelIndex: number;
  imageSrc: string;
  show3D?: boolean;
  onToggle3D?: () => void;
  renderZoomControls?: (
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
  onToggle3D,
  renderZoomControls
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const canShow3D = categoryType === "bathtub" || categoryType === "sink";
  // const modelUrl = useMemo(
  //   () => (canShow3D ? get3DPreviewFor(categoryType, modelIndex) : null),
  //   [canShow3D, categoryType, modelIndex]
  // );

  // const handleToggle3D = () => {
  //   if (canShow3D && modelUrl) preloadGLB(modelUrl);
  //   onToggle3D();
  // };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full ">
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
            {/* {show3D ? (
              <Model3DViewerWithLoading
                categoryType={categoryType}
                modelIndex={modelIndex}
              />
            ) : ( */}
              <ZoomableImage src={imageSrc} />
            {/* )} */}
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Zoom controls positioned absolutely on top of the content */}
      {/* <div className="absolute top-4 left-4 z-10">
        {renderZoomControls(transformRef)}
      </div> */}
    </div>
  );
};
