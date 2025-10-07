/* eslint-disable @typescript-eslint/no-explicit-any */
import { useImagePreloader } from "@/hooks/useImagePreloader";
import React, { useState, useEffect, useRef } from "react";
import { ReactImageTurntable } from "react-image-turntable";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef
} from "react-zoom-pan-pinch";

// Default configuration - can be overridden
const DEFAULT_360_CONFIG = {
  IMAGE_COUNT: 60,
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
  bucket360Url?: string;
}

// Generate image URLs with the standard naming pattern
const generateImageUrls = (baseUrl: string, imageCount: number): string[] => {
  console.log(`Generating ${imageCount} images for:`, baseUrl);

  // Remove trailing slash from baseUrl if it exists
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return Array.from({ length: imageCount }, (_, i) => {
    const filename = `${String(i + 1).padStart(4, "0")}.jpg`;
    return `${cleanBaseUrl}/${filename}`;
  });
};

// Determine image count based on URL
const getImageCountFromUrl = (bucket360Url: string): number => {
  if (bucket360Url.includes("Bathtub")) {
    console.log("Detected Bathtub - using 60 images");
    return 60;
  } else if (bucket360Url.includes("Sink")) {
    console.log("Detected Sink - using 30 images");
    return 30;
  }

  // Default fallback
  console.log("Unknown category - using default 60 images");
  return 60;
};

// Loading Overlay Component
const LoadingOverlay: React.FC<{ isVisible: boolean; progress: number }> = ({
  isVisible,
  progress
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-gray-100 sm:text-gray-600 mb-2 text-base font-medium">
          Loading 360° Viewer...
        </p>
        <div className="w-48 bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <p className="text-gray-100 sm:text-gray-600 text-sm">
          {Math.round(progress)}%
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
  isSink?: boolean;
}> = ({
  isLoading,
  showDragIndicator,
  isDragging,
  instance,
  isSink = false
}) => {
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
          <span className="text-sm font-medium">
            {isSink ? "Drag to rotate 180°" : "Drag to rotate 360°"}
          </span>
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
  initialImageIndex?: number;
  isSink?: boolean;
}> = ({
  images,
  isDragging,
  onDragStart,
  onDragEnd,
  initialImageIndex = 0,
  isSink = false
}) => {
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
        initialImageIndex={initialImageIndex}
        movementSensitivity={isSink ? 1.0 : 0.5} // More sensitive for 180° rotation
        autoRotate={{ disabled: true, interval: 50 }}
        // For sinks, we want to limit the rotation range
        // This might need to be implemented differently depending on the library
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

// Main Product360 Component
export default function Product360({
  transformRef,
  bucket360Url
}: Product360Props) {
  const internalTransformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const activeTransformRef = transformRef || internalTransformRef;
  const [images, setImages] = useState<string[]>([]);
  const [initialImageIndex, setInitialImageIndex] = useState<number>(0);

  // Check if it's a sink
  const isSink = bucket360Url?.includes("Sink") || false;

  // Generate images based on bucket360Url
  useEffect(() => {
    if (!bucket360Url) {
      setImages([]);
      return;
    }

    // Determine image count based on URL
    const imageCount = getImageCountFromUrl(bucket360Url);

    // Determine initial image index based on category
    let startIndex = 0;
    if (bucket360Url.includes("Sink")) {
      startIndex = 14; // 0015.jpg is at index 14 (0-based) - center position for 180° view
    }
    setInitialImageIndex(startIndex);

    // Generate image URLs using the standard naming pattern
    const imageList = generateImageUrls(bucket360Url, imageCount);

    setImages(imageList);
  }, [bucket360Url]);

  // Custom hooks
  const { isLoading, progress } = useImagePreloader(images);
  const { showDragIndicator, isDragging, handleDragStart, handleDragEnd } =
    useDragIndicator();

  console.log("Product360 bucket360Url:", bucket360Url);
  console.log("Generated images sample:", images.slice(0, 5));
  console.log("Total image count:", images.length);
  console.log("Initial image index:", initialImageIndex);
  console.log("Is sink:", isSink);

  // Don't render if no bucket360Url
  if (!bucket360Url) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <p className="text-gray-500">No 360° view available</p>
      </div>
    );
  }

  // Show debug info if images aren't loading
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No 360° images found</p>
          <p className="text-xs text-gray-400">Base URL: {bucket360Url}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden w-full h-full select-none pointer-events-auto relative">
      <TransformWrapper
        ref={activeTransformRef}
        initialScale={DEFAULT_360_CONFIG.ZOOM_CONFIG.initialScale}
        minScale={DEFAULT_360_CONFIG.ZOOM_CONFIG.minScale}
        maxScale={DEFAULT_360_CONFIG.ZOOM_CONFIG.maxScale}
        doubleClick={{
          disabled: false,
          step: DEFAULT_360_CONFIG.ZOOM_CONFIG.doubleClickStep
        }}
        wheel={{ step: DEFAULT_360_CONFIG.ZOOM_CONFIG.wheelStep }}
        panning={{ disabled: true }}
        pinch={{ disabled: false }}
        centerOnInit
        centerZoomedOut
        disablePadding
      >
        {({ instance }) => (
          <>
            <LoadingOverlay isVisible={isLoading} progress={progress} />
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
                initialImageIndex={initialImageIndex}
                isSink={isSink}
              />
            </TransformComponent>

            <DragIndicator
              isLoading={isLoading}
              showDragIndicator={showDragIndicator}
              isDragging={isDragging}
              instance={instance}
              isSink={isSink}
            />
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
