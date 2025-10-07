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

const pad2 = (n: number) => String(n).padStart(2, "0");
const replaceSegment = (
  url: string,
  kind: "Model" | "Mat" | "Color",
  idx1Based: number
): string => {
  const re = new RegExp(`(${kind}_)\\d+`);
  if (re.test(url)) return url.replace(re, `$1${pad2(idx1Based)}`);
  return url;
};

// ============================================================================
// UI COMPONENTS
// ============================================================================
const LoadingOverlay: React.FC<{ isVisible: boolean; progress: number }> = ({
  isVisible,
  progress
}) => {
  if (!isVisible) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-gray-800 mb-2 text-base font-medium">
          Loading 360° Viewer...
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
          <div className="absolute left-3 bottom-40 sm:bottom-32 md:bottom-24 z-20 pointer-events-auto">
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
  const { panoramas, updatePanorama } = usePanoramaContext();

  const [currentBucketUrl, setCurrentBucketUrl] = useState<string>(
    bucket360Url ?? ""
  );
  useEffect(() => {
    if (bucket360Url && bucket360Url !== currentBucketUrl) {
      setCurrentBucketUrl(bucket360Url);
    }
  }, [bucket360Url, currentBucketUrl]);

  const part: PartType = useMemo<PartType>(() => {
    if (panoramaType) return panoramaType;
    if (currentBucketUrl.includes("Sink")) return "sink";
    if (currentBucketUrl.includes("Bathtub")) return "bathtub";
    return "floor";
  }, [panoramaType, currentBucketUrl]);

  const selectedModelIndex = (panoramas as any)?.[part]?.modelIndex ?? 0;
  const selectedMaterialIndex = (panoramas as any)?.[part]?.materialIndex ?? 0;
  const selectedColorIndex = (panoramas as any)?.[part]?.colorIndex ?? null;

  const computedMaterialList = useMemo(() => {
    if (part === "bathtub" || part === "sink") {
      const models = menu_preview_images[part].models;
      const model = models[selectedModelIndex];
      return (
        model?.materials?.map((m) => ({ file: m.file, id: m.materialId })) ?? []
      );
    }
    return [];
  }, [part, selectedModelIndex]);

  const computedColorList = useMemo(() => {
    if (part === "bathtub" || part === "sink") {
      const models = menu_preview_images[part].models;
      const model = models[selectedModelIndex];
      const material = model?.materials?.[selectedMaterialIndex];
      return (
        material?.colors?.map((c) => ({ file: c.file, id: c.colorId })) ?? []
      );
    }
    return [];
  }, [part, selectedModelIndex, selectedMaterialIndex]);

  // Viewer + images
  const internalTransformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const activeTransformRef = transformRef || internalTransformRef;

  const isSink = !!currentBucketUrl?.includes("Sink");
  const { images, initialImageIndex } = useImageSequence(currentBucketUrl);
  const { isLoading, progress } = useImagePreloader(images);
  const { showDragIndicator, isDragging, handleDragStart, handleDragEnd } =
    useDragIndicator();

  // --- NEW: viewerKey to force remounts when selection/URL changes ---
  const viewerKey = useMemo(
    () =>
      `${part}-${selectedModelIndex}-${selectedMaterialIndex}-${
        selectedColorIndex ?? "x"
      }-${currentBucketUrl}`,
    [
      part,
      selectedModelIndex,
      selectedMaterialIndex,
      selectedColorIndex,
      currentBucketUrl
    ]
  );

  const selectionIds = useMemo(() => {
    if (part === "bathtub" || part === "sink") {
      const { models, categoryId } = menu_preview_images[part];
      const model = models[selectedModelIndex];
      const material = model?.materials?.[selectedMaterialIndex];
      const color = material?.colors?.[selectedColorIndex ?? -1];
      return {
        modelId: model?.modelId as string | undefined,
        categoryId: categoryId as string | undefined,
        materialId: material?.materialId as string | undefined,
        colorId: color?.colorId as string | undefined
      };
    }
    return {};
  }, [part, selectedModelIndex, selectedMaterialIndex, selectedColorIndex]);

  // handlers (unchanged)
  const handleMaterialSelect = (idx: number) => {
    const models = (menu_preview_images as any)[part]?.models ?? [];
    const model = models[selectedModelIndex];
    const material = model?.materials?.[idx];
    const nextHasColors =
      Array.isArray(material?.colors) && material!.colors.length > 0;
    const nextColorIndex = nextHasColors ? 0 : null;

    updatePanorama({
      part,
      patch: { materialIndex: idx, colorIndex: nextColorIndex }
    });

    const categoryIdStr = (menu_preview_images as any)[part]?.categoryId as
      | string
      | undefined;
    const modelIdStr = model?.modelId as string | undefined;
    const materialIdStr = material?.materialId as string | undefined;
    const colorIdStr = nextHasColors
      ? (material!.colors[0].colorId as string)
      : undefined;

    const nextUrl =
      getBucket360Url(
        categoryIdStr ? Number(categoryIdStr) : null,
        modelIdStr ? Number(modelIdStr) : null,
        materialIdStr ? Number(materialIdStr) : null,
        colorIdStr ? Number(colorIdStr) : undefined
      ) ?? currentBucketUrl;

    setCurrentBucketUrl(nextUrl);

    onSelect?.({
      modelIndex: selectedModelIndex,
      modelId: modelIdStr,
      categoryId: categoryIdStr,
      materialId: materialIdStr,
      colorId: colorIdStr
    });
  };

  const handleColorSelect = (idx: number) => {
    updatePanorama({
      part,
      patch: { colorIndex: idx }
    });

    const { models, categoryId } = (menu_preview_images as any)[part];
    const model = models[selectedModelIndex];
    const material = model?.materials?.[selectedMaterialIndex];
    const color = material?.colors?.[idx];

    const categoryIdStr = categoryId as string | undefined;
    const modelIdStr = model?.modelId as string | undefined;
    const materialIdStr = material?.materialId as string | undefined;
    const colorIdStr = color?.colorId as string | undefined;

    const nextUrl =
      getBucket360Url(
        categoryIdStr ? Number(categoryIdStr) : null,
        modelIdStr ? Number(modelIdStr) : null,
        materialIdStr ? Number(materialIdStr) : null,
        colorIdStr ? Number(colorIdStr) : undefined
      ) ?? currentBucketUrl;

    setCurrentBucketUrl(nextUrl);

    onSelect?.({
      modelIndex: selectedModelIndex,
      modelId: modelIdStr,
      categoryId: categoryIdStr,
      materialId: materialIdStr,
      colorId: colorIdStr
    });
  };

  // Early returns
  if (!currentBucketUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <p className="text-gray-500">No 360° view available</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No 360° images found</p>
          <p className="text-xs text-gray-400">Base URL: {currentBucketUrl}</p>
        </div>
      </div>
    );
  }

  // Render
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
            <LoadingOverlay isVisible={isLoading} progress={progress} />
            <ZoomLevelIndicator instance={instance} />

            <TransformComponent
              key={viewerKey} // <-- OPTION A: force subtree remount on change
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
                turntableKey={viewerKey} // <-- OPTION A: force turntable remount
              >
                {(computedMaterialList.length || computedColorList.length) && (
                  <div className="flex flex-col gap-2 z-10">
                    {computedMaterialList.length > 0 && (
                      <div className="flex flex-row gap-2 justify-center bg-black/40 backdrop-blur-sm p-2 rounded-xl">
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
                                "w-9 h-9 rounded-full overflow-hidden border-2 transition-shadow",
                                selected
                                  ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.6)]"
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
                                "w-9 h-9 rounded-full overflow-hidden border-2 transition-shadow",
                                selected
                                  ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.6)]"
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
                    )}
                  </div>
                )}
              </ImageTurntableWrapper>
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
