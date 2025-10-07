"use client";

import React, { useState } from "react";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomControls } from "./ZoomControls";
import { useProductData } from "@/hooks/useProductData";
import { ZoomableContentViewer } from "./components";
import { TwoDImagesDialog } from "@/components/TwoDImagesDialog";
import { BathtubImagesDialog } from "@/components/BathtubImagesDialog"; // ✅ Import new dialog

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
  const [showBathtubDialog, setShowBathtubDialog] = useState(false);

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
    materialIndex: derivedMaterialIndex, // <-- add this if your hook returns it
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

  // ✅ Handler for 2D dialog
  const handleToggle2D = () => {
    setShow2DDialog(true);
  };

  const handleClose2DDialog = () => {
    setShow2DDialog(false);
  };

  // ✅ Handler for camera/bathtub dialog
  const handleCamera = () => {
    setShowBathtubDialog(true);
  };

  const handleCloseBathtubDialog = () => {
    setShowBathtubDialog(false);
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
      onCamera={handleCamera} // ✅ Pass camera handler
    />
  );

  return (
    <>
      <ZoomableContentViewer
        categoryType={categoryType}
        modelIndex={derivedModelIndex}
        materialIndex={derivedMaterialIndex ?? 0} // <-- pass materialIndex
        imageSrc={imageSrc}
        renderZoomControls={renderZoomControls}
        bucket360Url={bucket360Url}
      />

      {/* 2D Images Dialog */}
      <TwoDImagesDialog isOpen={show2DDialog} onClose={handleClose2DDialog} />

      {/* ✅ Bathtub Images Dialog */}
      <BathtubImagesDialog
        isOpen={showBathtubDialog}
        onClose={handleCloseBathtubDialog}
      />
    </>
  );
};
