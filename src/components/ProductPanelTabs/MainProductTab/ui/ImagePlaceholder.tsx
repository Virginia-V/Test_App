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
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  panoramaType,
  modelIndex
}) => {
  const [show360, setShow360] = useState(false);
  const [show2D, setShow2D] = useState(false); // Changed to false since we're showing a dialog
  const [show2DDialog, setShow2DDialog] = useState(false); // New state for dialog

  // Use custom hook for data management
  const {
    categoryType,
    modelIndex: derivedModelIndex,
    imageSrc
  } = useProductData({
    panoramaType,
    modelIndex
  });

  const handleToggle360 = () => {
    setShow360((prev) => !prev);
    setShow2D(false);
  };

  const handleToggle2D = () => {
    setShow2DDialog(true); // Open dialog instead of toggling state
  };

  const handleClose2DDialog = () => {
    setShow2DDialog(false);
  };

  // Render zoom controls with proper ref handling
  const renderZoomControls = (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>,
  ) => (
    <ZoomControls
      onZoomIn={() => transformRef.current?.zoomIn()}
      onZoomOut={() => transformRef.current?.zoomOut()}
      onReset={() => transformRef.current?.resetTransform()}
      show360={show360}
      onToggle360={handleToggle360}
      show2D={show2D}
      onToggle2D={handleToggle2D}
    />
  );

  return (
    <>
      <ZoomableContentViewer
        categoryType={categoryType}
        modelIndex={derivedModelIndex}
        imageSrc={imageSrc}
        show360={show360}
        show2D={show2D}
        renderZoomControls={renderZoomControls}
      />

      {/* 2D Images Dialog */}
      <TwoDImagesDialog isOpen={show2DDialog} onClose={handleClose2DDialog} />
    </>
  );
};
