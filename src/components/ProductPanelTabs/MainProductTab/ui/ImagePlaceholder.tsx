"use client";

import React, { useState } from "react";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomControls } from "./ZoomControls";
import { useProductData } from "@/hooks/useProductData";
import { ZoomableContentViewer } from "./components";
import { TwoDImagesDialog } from "@/components/TwoDImagesDialog";

interface ImagePlaceholderProps {
  panoramaType?: string;
  modelIndex?: number | null;
  categoryId?: number | null | undefined;
  modelId?: number | null | undefined;
  materialId?: number | null | undefined;
  colorId?: number | null | undefined;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  panoramaType,
  modelIndex,
  categoryId,
  modelId,
  materialId,
  colorId
}) => {
  const [show2DDialog, setShow2DDialog] = useState(false);

  console.log("🔄 ImagePlaceholder - Received props:", {
    categoryId,
    modelId,
    materialId,
    colorId
  });

  // Use custom hook for data management
  const {
    categoryType,
    modelIndex: derivedModelIndex,
    imageSrc,
    bucket360Url
  } = useProductData({
    panoramaType,
    modelIndex,
    categoryId,
    modelId,
    materialId,
    colorId
  });

  console.log("✅ ImagePlaceholder - Generated data:", {
    categoryType,
    derivedModelIndex,
    bucket360Url
  });

  const handleToggle2D = () => {
    setShow2DDialog(true);
  };

  const handleClose2DDialog = () => {
    setShow2DDialog(false);
  };

  // Render zoom controls with proper ref handling
  const renderZoomControls = (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>
  ) => (
    <ZoomControls
      onZoomIn={() => transformRef.current?.zoomIn()}
      onZoomOut={() => transformRef.current?.zoomOut()}
      onReset={() => transformRef.current?.resetTransform()}
      onToggle2D={handleToggle2D}
    />
  );

  return (
    <>
      <ZoomableContentViewer
        categoryType={categoryType}
        modelIndex={derivedModelIndex}
        imageSrc={imageSrc}
        renderZoomControls={renderZoomControls}
        bucket360Url={bucket360Url} // ✅ Pass the bucket360Url
      />

      {/* 2D Images Dialog */}
      <TwoDImagesDialog isOpen={show2DDialog} onClose={handleClose2DDialog} />
    </>
  );
};
