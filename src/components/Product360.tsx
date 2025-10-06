import React, { useState, useEffect, useRef } from "react";
import { ReactImageTurntable } from "react-image-turntable";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef
} from "react-zoom-pan-pinch";

interface Product360Props {
  transformRef?: React.RefObject<ReactZoomPanPinchRef | null>;
}

export default function Product360({ transformRef }: Product360Props) {
  const [showDragIndicator, setShowDragIndicator] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const internalTransformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Use external ref if provided, otherwise use internal ref
  const activeTransformRef = transformRef || internalTransformRef;

  const images = Array.from(
    { length: 120 },
    (_, i) =>
      `360-images-2/BATH-A_BMAT-A1_${String(i + 1).padStart(4, "0")}.jpg`
  );

  const handleDragStart = () => {
    setShowDragIndicator(false);
    setIsDragging(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    timeoutRef.current = setTimeout(() => {
      setShowDragIndicator(true);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="rounded-md overflow-hidden w-full h-full select-none pointer-events-auto relative">
      <TransformWrapper
        ref={activeTransformRef}
        initialScale={1}
        minScale={1}
        maxScale={3}
        doubleClick={{ disabled: false, step: 0.7 }}
        wheel={{ step: 0.1 }}
        panning={{ disabled: true }}
        pinch={{ disabled: false }}
        centerOnInit={true}
        centerZoomedOut={true}
        disablePadding={true}
      >
        {({ instance }) => (
          <>
            {/* Zoom Level Indicator */}
            {instance && instance.transformState.scale !== 1 && (
              <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm z-20">
                {Math.round(instance.transformState.scale * 100)}%
              </div>
            )}

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <div
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchEnd={handleDragEnd}
                className={isDragging ? "cursor-grabbing" : "cursor-grab"}
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: isDragging ? "grabbing" : "grab"
                }}
              >
                <ReactImageTurntable
                  images={images}
                  initialImageIndex={0}
                  movementSensitivity={0.5}
                  autoRotate={{ disabled: true, interval: 50 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "inherit"
                  }}
                />
              </div>
            </TransformComponent>

            {/* Simple Drag Indicator */}
            {showDragIndicator &&
              !isDragging &&
              (!instance || instance.transformState.scale === 1) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-black/80 text-white px-6 py-4 rounded-lg flex items-center gap-3 animate-pulse">
                    <div className="flex items-center gap-4">
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 24 16"
                        fill="currentColor"
                      >
                        <path d="M0 8L8 0V4H24V12H8V16L0 8Z" />
                      </svg>
                      <span className="text-sm font-medium">
                        Drag to rotate 360°
                      </span>
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 24 16"
                        fill="currentColor"
                      >
                        <path d="M24 8L16 0V4H0V12H16V16L24 8Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
