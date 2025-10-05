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
  show360: boolean;
  show2D: boolean;
  renderZoomControls: (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>
  ) => React.ReactNode;
}

export const ZoomableContentViewer: React.FC<ZoomableContentViewerProps> = ({
  imageSrc,
  show360,
  renderZoomControls
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        {show360 ? (
          // Show 360° view with zoom functionality but disabled panning
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={6}
            doubleClick={{ disabled: true }}
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
            panning={{ disabled: true }} // Disable panning for 360° view
            centerZoomedOut
            zoomAnimation={{ animationTime: 200, animationType: "linear" }}
            alignmentAnimation={{ animationTime: 200 }}
          >
            <TransformComponent>
              <Product360 />
            </TransformComponent>
          </TransformWrapper>
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
            panning={{ disabled: true }} // Disable panning for 360° view
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
        {renderZoomControls(transformRef)}
      </div>
    </div>
  );
};
