/* eslint-disable @typescript-eslint/no-explicit-any */
import { useImagePreloader } from "@/hooks/useImagePreloader";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ReactImageTurntable } from "react-image-turntable";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef
} from "react-zoom-pan-pinch";

// Configuration constants
const PRODUCT_360_CONFIG = {
  IMAGE_COUNT: 120,
  BASE_URL:
    "https://pub-ad375fec02084613b3e47524e6061297.r2.dev/menu-images/Bathtub/Bathtub_Model_01/Bathtub_Model_01_360/Bathtub_Model_01_360_Mat_01",
  IMAGE_PREFIX: "BATH-A_BMAT-A1_",
  ZOOM_CONFIG: {
    initialScale: 1,
    minScale: 1,
    maxScale: 3,
    wheelStep: 0.1,
    doubleClickStep: 0.7
  }
} as const;

interface Product360Props {
  transformRef?: React.RefObject<ReactZoomPanPinchRef | null>;
}

// Loading Overlay Component
const LoadingOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-gray-100 sm:text-gray-600 mb-2 text-base font-medium">
          Loading 360° Viewer...
        </p>
      </div>
    </div>
  );
};

// Zoom Level Indicator Component
const ZoomLevelIndicator: React.FC<{
  instance: any;
}> = ({ instance }) => {
  if (!instance || instance.transformState.scale === 1) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm z-20">
      {Math.round(instance.transformState.scale * 100)}%
    </div>
  );
};

// Drag Indicator Component
const DragIndicator: React.FC<{
  isLoading: boolean;
  showDragIndicator: boolean;
  isDragging: boolean;
  instance: any;
}> = ({ isLoading, showDragIndicator, isDragging, instance }) => {
  const shouldShow =
    !isLoading &&
    showDragIndicator &&
    !isDragging &&
    (!instance || instance.transformState.scale === 1);

  if (!shouldShow) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-black/80 text-white px-6 py-4 rounded-lg flex items-center gap-3 animate-pulse">
        <div className="flex items-center gap-4">
          <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor">
            <path d="M0 8L8 0V4H24V12H8V16L0 8Z" />
          </svg>
          <span className="text-sm font-medium">Drag to rotate 360°</span>
          <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor">
            <path d="M24 8L16 0V4H0V12H16V16L24 8Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Image Turntable Wrapper Component
const ImageTurntableWrapper: React.FC<{
  images: string[];
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ images, isDragging, onDragStart, onDragEnd }) => {
  return (
    <div
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchEnd={onDragEnd}
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
  );
};

// Custom hook for drag logic
const useDragIndicator = () => {
  const [showDragIndicator, setShowDragIndicator] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  return {
    showDragIndicator,
    isDragging,
    handleDragStart,
    handleDragEnd
  };
};

// Generate image URLs helper
const generateImageUrls = (): string[] => {
  return Array.from(
    { length: PRODUCT_360_CONFIG.IMAGE_COUNT },
    (_, i) =>
      `${PRODUCT_360_CONFIG.BASE_URL}/${PRODUCT_360_CONFIG.IMAGE_PREFIX}${String(
        i + 1
      ).padStart(4, "0")}.jpg`
  );
};

// Main Product360 Component
export default function Product360({ transformRef }: Product360Props) {
  const internalTransformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const activeTransformRef = transformRef || internalTransformRef;

  // Memoize the images array to prevent recreation on every render
  const images = useMemo(generateImageUrls, []);

  // Custom hooks
  const { isLoading } = useImagePreloader(images);
  const { showDragIndicator, isDragging, handleDragStart, handleDragEnd } =
    useDragIndicator();

  return (
    <div className="rounded-md overflow-hidden w-full h-full select-none pointer-events-auto relative">
      <TransformWrapper
        ref={activeTransformRef}
        initialScale={PRODUCT_360_CONFIG.ZOOM_CONFIG.initialScale}
        minScale={PRODUCT_360_CONFIG.ZOOM_CONFIG.minScale}
        maxScale={PRODUCT_360_CONFIG.ZOOM_CONFIG.maxScale}
        doubleClick={{
          disabled: false,
          step: PRODUCT_360_CONFIG.ZOOM_CONFIG.doubleClickStep
        }}
        wheel={{ step: PRODUCT_360_CONFIG.ZOOM_CONFIG.wheelStep }}
        panning={{ disabled: true }}
        pinch={{ disabled: false }}
        centerOnInit
        centerZoomedOut
        disablePadding
      >
        {({ instance }) => (
          <>
            <LoadingOverlay isVisible={isLoading} />
            <ZoomLevelIndicator instance={instance} />

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <ImageTurntableWrapper
                images={images}
                isDragging={isDragging}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            </TransformComponent>

            <DragIndicator
              isLoading={isLoading}
              showDragIndicator={showDragIndicator}
              isDragging={isDragging}
              instance={instance}
            />
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
