/* eslint-disable @typescript-eslint/no-explicit-any */
import { useImagePreloader } from "@/hooks/useImagePreloader";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ReactImageTurntable } from "react-image-turntable";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { usePanoramaContext } from "@/context/PanoramaContext";
import { menu_preview_images } from "@/lib/menu_preview_images";
import { getBucket360Url } from "@/helpers/image-utils";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import { useTranslations } from "next-intl";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================
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

type PartType = "bathtub" | "sink" | "floor";

interface Product360Props {
  transformRef?: React.RefObject<ReactZoomPanPinchRef | null>;
  bucket360Url?: string;
  panoramaType?: PartType;
  onSelect?: (selection: {
    modelIndex: number;
    modelId?: string;
    categoryId?: string;
    materialId?: string;
    colorId?: string;
  }) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const rotateArrayToStart = <T,>(arr: T[], startValue: T): T[] => {
  const index = arr.indexOf(startValue);
  if (index <= 0) return arr;
  return arr.slice(index).concat(arr.slice(0, index));
};

const buildPingPong = (first: number, last: number): number[] => {
  const up = range(first, last);
  const down = range(first + 1, last - 1).reverse();
  return up.concat(down);
};

const toUrls = (baseUrl: string, frames: number[]): string[] => {
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return frames.map(
    (frameNumber, index) =>
      `${cleanBaseUrl}/${String(frameNumber).padStart(4, "0")}.jpg#pp=${index}`
  );
};

const getImageCountFromUrl = (bucket360Url: string): number => {
  if (bucket360Url.includes("Bathtub")) return 60;
  if (bucket360Url.includes("Sink")) return 30;
  return 60;
};

// ============================================================================
// UI COMPONENTS
// ============================================================================
const LoadingOverlay: React.FC<{ isVisible: boolean; progress: number }> = ({
  isVisible,
  progress
}) => {
  const t = useTranslations("product");
  if (!isVisible) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-gray-800 mb-2 text-base font-medium">
          {t("loadingViewer")}
        </p>
        <div className="w-48 bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <p className="text-gray-700 text-sm">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

const ZoomLevelIndicator: React.FC<{ instance: any }> = ({ instance }) => {
  if (!instance || instance.transformState.scale === 1) return null;
  return (
    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm z-20">
      {Math.round(instance.transformState.scale * 100)}%
    </div>
  );
};

const DragIndicator: React.FC<{
  isLoading: boolean;
  showDragIndicator: boolean;
  isDragging: boolean;
  instance: any;
  isSink?: boolean;
}> = ({ isLoading, showDragIndicator, isDragging, instance }) => {
  const t = useTranslations("product");
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
          <span className="text-sm font-medium">{t("dragToRotate")}</span>
          <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor">
            <path d="M24 8L16 0V4H0V12H16V16L24 8Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/** Turntable wrapper */
const ImageTurntableWrapper: React.FC<{
  images: string[];
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  initialImageIndex?: number;
  isSink?: boolean;
  children?: React.ReactNode;
  turntableKey?: string;
}> = ({
  images,
  isDragging,
  onDragStart,
  onDragEnd,
  initialImageIndex = 0,
  isSink = false,
  children,
  turntableKey
}) => {
  return (
    <div
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchEnd={onDragEnd}
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      style={{ width: "100%", height: "100%", flex: 1 }}
    >
      <div
        className="relative overflow-hidden"
        style={{ width: "100%", height: "100%" }}
      >
        <ReactImageTurntable
          key={turntableKey} // force remount when key changes
          images={images}
          initialImageIndex={initialImageIndex}
          movementSensitivity={isSink ? 1.0 : 0.5}
          autoRotate={{ disabled: true, interval: 50 }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "inherit"
          }}
        />
        {children ? (
          <div className="absolute left-3 bottom-24 sm:bottom-28 md:bottom-20 z-20 pointer-events-auto">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================
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
    timeoutRef.current = setTimeout(() => setShowDragIndicator(true), 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { showDragIndicator, isDragging, handleDragStart, handleDragEnd };
};

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
      const first = 1;
      const last = 30;
      const pivot = 15;
      const pingPongSequence = buildPingPong(first, last);
      const rotatedSequence = rotateArrayToStart(pingPongSequence, pivot);
      const imageUrls = toUrls(bucket360Url, rotatedSequence);
      setImages(imageUrls);
      setInitialImageIndex(0);
    } else {
      const imageCount = getImageCountFromUrl(bucket360Url);
      const frameSequence = range(1, imageCount);
      const imageUrls = toUrls(bucket360Url, frameSequence);
      setImages(imageUrls);
      setInitialImageIndex(0);
    }
  }, [bucket360Url]);

  return { images, initialImageIndex };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Product360({
  transformRef,
  bucket360Url,
  panoramaType,
  onSelect
}: Product360Props) {
  // Access panorama context for current selection and update function
  const { panoramas, updatePanorama } = usePanoramaContext();
  const t = useTranslations("product");
  // Determine which part (bathtub, sink, floor) is currently active
  const part: PartType = useMemo<PartType>(() => {
    if (panoramaType) return panoramaType;
    if (bucket360Url?.includes("Sink")) return "sink";
    if (bucket360Url?.includes("Bathtub")) return "bathtub";
    return "floor";
  }, [panoramaType, bucket360Url]);

  // Get current selection indices from context (model, material, color)
  const selectedModelIndex = (panoramas as any)?.[part]?.modelIndex ?? 0;
  const selectedMaterialIndex = (panoramas as any)?.[part]?.materialIndex ?? 0;
  const selectedColorIndex = (panoramas as any)?.[part]?.colorIndex ?? null;

  // Get the selected model, material, and color objects from menu_preview_images
  const models = menu_preview_images[part]?.models ?? [];
  const model = models[selectedModelIndex];
  const material = model?.materials?.[selectedMaterialIndex];
  const color =
    material && selectedColorIndex !== null
      ? material.colors?.[selectedColorIndex]
      : undefined;

  // Get string IDs for the current selection (needed for getBucket360Url)
  const categoryIdStr = menu_preview_images[part]?.categoryId as
    | string
    | undefined;
  const modelIdStr = model?.modelId as string | undefined;
  const materialIdStr = material?.materialId as string | undefined;
  const colorIdStr = color?.colorId as string | undefined;

  // Always compute the 360 URL from the current selection using helper
  // This ensures the viewer always reflects the latest selection
  const computedBucket360Url =
    getBucket360Url(
      categoryIdStr ? Number(categoryIdStr) : null,
      modelIdStr ? Number(modelIdStr) : null,
      materialIdStr ? Number(materialIdStr) : null,
      colorIdStr ? Number(colorIdStr) : undefined
    ) ??
    bucket360Url ??
    "";

  // Compute the list of materials for the current model (for material selector UI)
  const computedMaterialList = useMemo(() => {
    if (part === "bathtub" || part === "sink") {
      return (
        model?.materials?.map((m) => ({ file: m.file, id: m.materialId })) ?? []
      );
    }
    return [];
  }, [model?.materials, part]);

  // Compute the list of colors for the current material (for color selector UI)
  const computedColorList = useMemo(() => {
    if (part === "bathtub" || part === "sink") {
      return (
        material?.colors?.map((c) => ({ file: c.file, id: c.colorId })) ?? []
      );
    }
    return [];
  }, [part, material?.colors]);

  // Set up refs for zoom/pan pinch
  const internalTransformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const activeTransformRef = transformRef || internalTransformRef;

  // Determine if the current product is a sink (affects turntable sensitivity)
  const isSink = !!computedBucket360Url?.includes("Sink");

  // Get the image sequence for the current 360 URL
  const { images, initialImageIndex } = useImageSequence(computedBucket360Url);

  // Preload images and track loading progress
  const { isLoading, progress } = useImagePreloader(images);

  // Drag indicator state and handlers
  const { showDragIndicator, isDragging, handleDragStart, handleDragEnd } =
    useDragIndicator();

  // Generate a unique key for the viewer to force remount on selection change
  const viewerKey = useMemo(
    () =>
      `${part}-${selectedModelIndex}-${selectedMaterialIndex}-${
        selectedColorIndex ?? "x"
      }-${computedBucket360Url}`,
    [
      part,
      selectedModelIndex,
      selectedMaterialIndex,
      selectedColorIndex,
      computedBucket360Url
    ]
  );

  // Handler for selecting a material
  // Updates panorama context and notifies parent with new selection
  const handleMaterialSelect = (idx: number) => {
    const nextMaterial = model?.materials?.[idx];
    const nextHasColors =
      Array.isArray(nextMaterial?.colors) && nextMaterial!.colors.length > 0;
    const nextColorIndex = nextHasColors ? 0 : null;

    // Update panorama context with new material and reset color if needed
    updatePanorama({
      part,
      patch: { materialIndex: idx, colorIndex: nextColorIndex }
    });

    const nextMaterialIdStr = nextMaterial?.materialId as string | undefined;
    const nextColorIdStr = nextHasColors
      ? nextMaterial.colors && (nextMaterial!.colors[0].colorId as string)
      : undefined;

    // Notify parent with new selection data
    onSelect?.({
      modelIndex: selectedModelIndex,
      modelId: modelIdStr,
      categoryId: categoryIdStr,
      materialId: nextMaterialIdStr,
      colorId: nextColorIdStr
    });
  };

  // Handler for selecting a color
  // Updates panorama context and notifies parent with new selection
  const handleColorSelect = (idx: number) => {
    updatePanorama({
      part,
      patch: { colorIndex: idx }
    });

    const nextColor = material?.colors?.[idx];
    const nextColorIdStr = nextColor?.colorId as string | undefined;

    // Notify parent with new selection data
    onSelect?.({
      modelIndex: selectedModelIndex,
      modelId: modelIdStr,
      categoryId: categoryIdStr,
      materialId: materialIdStr,
      colorId: nextColorIdStr
    });
  };

  // If no 360 URL is available, show a fallback message
  if (!computedBucket360Url) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <p className="text-gray-500">No 360° view available</p>
      </div>
    );
  }

  // If no images are found for the 360 URL, show a fallback message
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No 360° images found</p>
          <p className="text-xs text-gray-400">
            Base URL: {computedBucket360Url}
          </p>
        </div>
      </div>
    );
  }

  // Main render: 360 viewer with zoom, drag, and material/color selectors
  return (
    <div className="rounded-md overflow-hidden w-full h-full select-none pointer-events-auto relative flex flex-col">
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
            {/* Show loading overlay while images are loading */}
            <LoadingOverlay isVisible={isLoading} progress={progress} />
            {/* Show zoom level indicator when zoomed in */}
            <ZoomLevelIndicator instance={instance} />

            <TransformComponent
              key={viewerKey}
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
                turntableKey={viewerKey}
              />
            </TransformComponent>

            {/* Show material and color selectors OUTSIDE the zoomable area */}
            {(computedMaterialList.length || computedColorList.length) && (
              <div className="absolute left-3 bottom-24 sm:bottom-28 md:bottom-20 flex flex-col gap-2 z-30 items-start pointer-events-auto">
                {computedMaterialList.length > 0 && (
                  <div className="flex flex-row gap-2 justify-center bg-black/40 backdrop-blur-sm p-2 rounded-xl self-start">
                    {computedMaterialList.map((mat, idx) => {
                      const selected = idx === selectedMaterialIndex;
                      return (
                        <button
                          key={`${mat.file}-${idx}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMaterialSelect(idx);
                          }}
                          className={[
                            "w-9 h-9 rounded-full overflow-hidden border-2 transition-shadow cursor-pointer",
                            selected
                              ? "border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.6)]"
                              : "border-white/60 hover:border-white"
                          ].join(" ")}
                        >
                          <Image
                            src={mat.file}
                            alt={`Material ${idx + 1}`}
                            width={36}
                            height={36}
                            className="object-cover w-full h-full pointer-events-none"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {computedColorList.length > 0 && (
                  <div className="flex flex-row items-center gap-3 self-start">
                    <div className="flex flex-row gap-2 justify-center bg-black/40 backdrop-blur-sm p-2 rounded-xl">
                      {computedColorList.map((col, idx) => {
                        const selected = idx === selectedColorIndex;
                        return (
                          <button
                            key={`${col.file}-${idx}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleColorSelect(idx);
                            }}
                            className={[
                              "w-9 h-9 rounded-full overflow-hidden border-2 transition-shadow cursor-pointer",
                              selected
                                ? "border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.6)]"
                                : "border-white/60 hover:border-white"
                            ].join(" ")}
                          >
                            <Image
                              src={col.file}
                              alt={`Color ${idx + 1}`}
                              width={36}
                              height={36}
                              className="object-cover w-full h-full pointer-events-none"
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-black/70 text-white px-3 py-1 rounded-md flex items-center gap-2 shadow-sm animate-pulse">
                      <InvertColorsIcon
                        fontSize="small"
                        className="!text-green-500 opacity-80"
                      />
                      <span className="text-xs font-medium">
                        {t("availableColors")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show drag indicator when appropriate */}
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
