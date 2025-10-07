/* eslint-disable @typescript-eslint/no-explicit-any */
import { useImagePreloader } from "@/hooks/useImagePreloader";
import React, { useState, useEffect, useRef } from "react";
import { ReactImageTurntable } from "react-image-turntable";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef
} from "react-zoom-pan-pinch";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

/**
 * Default configuration for 360° viewer behavior
 * Defines zoom settings and default image count for different product types
 */
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

/**
 * Props interface for the main Product360 component
 * @param transformRef - Optional ref for controlling zoom/pan state externally
 * @param bucket360Url - Base URL where 360° images are stored
 */
interface Product360Props {
  transformRef?: React.RefObject<ReactZoomPanPinchRef | null>;
  bucket360Url?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates an array of numbers from start to end (inclusive)
 * Used to generate frame sequences like [1, 2, 3, ..., 30]
 */
const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * Rotates array so it starts at the specified value
 * Used to make sink sequences start at frame 15 (front view)
 * Example: [1,2,3,4,5] rotated to start at 3 becomes [3,4,5,1,2]
 */
const rotateArrayToStart = <T,>(arr: T[], startValue: T): T[] => {
  const index = arr.indexOf(startValue);
  if (index <= 0) return arr;
  return arr.slice(index).concat(arr.slice(0, index));
};

/**
 * Creates a ping-pong sequence for 180° rotation
 * Goes from first to last, then back down (no repeated endpoints)
 * Example: buildPingPong(1, 5) returns [1,2,3,4,5,4,3,2]
 * This creates smooth 180° back-and-forth motion for sinks
 */
const buildPingPong = (first: number, last: number): number[] => {
  const up = range(first, last);
  const down = range(first + 1, last - 1).reverse();
  return up.concat(down);
};

/**
 * Converts frame numbers to full image URLs with unique identifiers
 * Adds #pp=index fragment to ensure React keys are unique (prevents duplicate key errors)
 * @param baseUrl - Base CDN URL for images
 * @param frames - Array of frame numbers to convert
 */
const toUrls = (baseUrl: string, frames: number[]): string[] => {
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return frames.map(
    (frameNumber, index) =>
      `${cleanBaseUrl}/${String(frameNumber).padStart(4, "0")}.jpg#pp=${index}`
  );
};

/**
 * Determines how many images to generate based on product type
 * - Bathtub: 60 images for full 360° rotation
 * - Sink: 30 images for 180° left-right motion
 */
const getImageCountFromUrl = (bucket360Url: string): number => {
  if (bucket360Url.includes("Bathtub")) {
    console.log("Detected Bathtub - using 60 images");
    return 60;
  } else if (bucket360Url.includes("Sink")) {
    console.log("Detected Sink - using 30 images");
    return 30;
  }
  console.log("Unknown category - using default 60 images");
  return 60;
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * Loading overlay that appears while images are being preloaded
 * Shows spinning indicator, progress bar, and percentage
 * @param isVisible - Controls whether overlay is shown
 * @param progress - Loading progress from 0-100
 */
const LoadingOverlay: React.FC<{
  isVisible: boolean;
  progress: number;
}> = ({ isVisible, progress }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="text-center">
        {/* Spinning loading indicator */}
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4 mx-auto" />

        {/* Loading text */}
        <p className="text-gray-800 mb-2 text-base font-medium">
          Loading 360° Viewer...
        </p>

        {/* Progress bar */}
        <div className="w-48 bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>

        {/* Percentage text */}
        <p className="text-gray-700 text-sm">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

/**
 * Shows current zoom level when user has zoomed in
 * Only appears when zoom is greater than 100%
 * @param instance - Zoom/pan instance from react-zoom-pan-pinch
 */
const ZoomLevelIndicator: React.FC<{
  instance: any;
}> = ({ instance }) => {
  // Only show if zoomed in beyond 100%
  if (!instance || instance.transformState.scale === 1) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm z-20">
      {Math.round(instance.transformState.scale * 100)}%
    </div>
  );
};

/**
 * Instructional overlay that shows drag hints to users
 * Appears when not loading, not dragging, and not zoomed in
 * Shows different text for sinks (180°) vs bathtubs (360°)
 */
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
}) => {
  // Only show when appropriate conditions are met
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
          {/* Left arrow */}
          <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor">
            <path d="M0 8L8 0V4H24V12H8V16L0 8Z" />
          </svg>

          {/* Instruction text - different for sinks vs bathtubs */}
          <span className="text-sm font-medium">Drag to rotate 360°</span>

          {/* Right arrow */}
          <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor">
            <path d="M24 8L16 0V4H0V12H16V16L24 8Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper for the ReactImageTurntable component
 * Handles mouse/touch events and passes through configuration
 * Supports both 360° (bathtub) and 180° (sink) rotation modes
 */
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
      // Mouse event handlers
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchEnd={onDragEnd}
      // Dynamic cursor based on drag state
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
        // Higher sensitivity for sinks since they have fewer frames over 180°
        movementSensitivity={isSink ? 1.0 : 0.5}
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

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook to manage drag indicator visibility
 * Shows hint when user first loads, hides during drag, shows again after delay
 * Provides consistent UX for teaching users how to interact
 */
const useDragIndicator = () => {
  const [showDragIndicator, setShowDragIndicator] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Called when user starts dragging
   * Immediately hides the drag indicator
   */
  const handleDragStart = () => {
    setShowDragIndicator(false);
    setIsDragging(true);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  /**
   * Called when user stops dragging
   * Shows drag indicator again after 1 second delay
   */
  const handleDragEnd = () => {
    setIsDragging(false);

    // Show indicator again after delay
    timeoutRef.current = setTimeout(() => {
      setShowDragIndicator(true);
    }, 1000);
  };

  // Cleanup timeout on unmount
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

/**
 * Custom hook to generate image sequences based on product type
 * Handles the complex logic for creating different rotation behaviors:
 * - Bathtub: Simple 1-60 sequence for 360° rotation
 * - Sink: Ping-pong 1-30-1 sequence starting at 15 for 180° motion
 */
const useImageSequence = (bucket360Url?: string) => {
  const [images, setImages] = useState<string[]>([]);
  const [initialImageIndex, setInitialImageIndex] = useState<number>(0);

  useEffect(() => {
    if (!bucket360Url) {
      setImages([]);
      return;
    }

    const isSinkProduct = bucket360Url.includes("Sink");

    if (isSinkProduct) {
      // Sink: 180° ping-pong rotation starting from center
      const first = 1;
      const last = 30;
      const pivot = 15; // Start at center/front view

      // Create ping-pong sequence and rotate to start at center
      const pingPongSequence = buildPingPong(first, last);
      const rotatedSequence = rotateArrayToStart(pingPongSequence, pivot);
      const imageUrls = toUrls(bucket360Url, rotatedSequence);

      setImages(imageUrls);
      setInitialImageIndex(0); // First image in rotated array is frame 15
    } else {
      // Bathtub: Standard 360° rotation
      const imageCount = getImageCountFromUrl(bucket360Url);
      const frameSequence = range(1, imageCount);
      const imageUrls = toUrls(bucket360Url, frameSequence);

      setImages(imageUrls);
      setInitialImageIndex(0); // Start at frame 1
    }
  }, [bucket360Url]);

  return { images, initialImageIndex };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Main Product360 component that renders an interactive 360°/180° product viewer
 *
 * Features:
 * - Automatic detection of product type (Bathtub vs Sink)
 * - Different rotation behaviors per product type
 * - Image preloading with progress indication
 * - Zoom and pan capabilities
 * - Touch/mouse drag support
 * - Loading states and error handling
 *
 * @param transformRef - Optional external ref for zoom/pan control
 * @param bucket360Url - CDN URL where product images are stored
 */
export default function Product360({
  transformRef,
  bucket360Url
}: Product360Props) {
  // Zoom/pan ref management
  const internalTransformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const activeTransformRef = transformRef || internalTransformRef;

  // Product type detection
  const isSink = !!bucket360Url?.includes("Sink");

  // Custom hooks for functionality
  const { images, initialImageIndex } = useImageSequence(bucket360Url);
  const { isLoading, progress } = useImagePreloader(images);
  const { showDragIndicator, isDragging, handleDragStart, handleDragEnd } =
    useDragIndicator();

  // Debug logging
  console.log("Product360 Debug Info:", {
    bucket360Url,
    imageCount: images.length,
    initialImageIndex,
    isSink,
    sampleImages: images.slice(0, 3)
  });

  // Early return: No URL provided
  if (!bucket360Url) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <p className="text-gray-500">No 360° view available</p>
      </div>
    );
  }

  // Early return: No images loaded
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

  // Main render: Full 360° viewer with all features
  return (
    <div className="rounded-md overflow-hidden w-full h-full select-none pointer-events-auto relative">
      {/* Zoom/Pan wrapper with configuration */}
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
        panning={{ disabled: true }} // Disable panning to avoid conflicts with rotation
        pinch={{ disabled: false }} // Allow pinch-to-zoom on mobile
        centerOnInit
        centerZoomedOut
        disablePadding
      >
        {({ instance }) => (
          <>
            {/* Loading overlay - shows during image preload */}
            <LoadingOverlay isVisible={isLoading} progress={progress} />

            {/* Zoom level indicator - shows current zoom percentage */}
            <ZoomLevelIndicator instance={instance} />

            {/* Main image container with zoom/pan capabilities */}
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

            {/* Drag instruction overlay - teaches users how to interact */}
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
