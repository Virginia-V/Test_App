"use client";

import React, { useState } from "react";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomControls } from "./ZoomControls";

import { ZoomableContentViewer } from "./components";
import { useProductData } from "@/hooks/useProductData";

interface ImagePlaceholderProps {
  panoramaType?: string;
  modelIndex?: number | null;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  panoramaType,
  modelIndex
}) => {
  const [show3D, setShow3D] = useState(false);

  // Use custom hook for data management
  const {
    categoryType,
    modelIndex: derivedModelIndex,
    imageSrc
  } = useProductData({
    panoramaType,
    modelIndex
  });

  const handleToggle3D = () => {
    setShow3D((prev) => !prev);
  };

  // Render zoom controls with proper ref handling
  const renderZoomControls = (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>,
    show3D: boolean,
    onToggle3D?: () => void
  ) => (
    <ZoomControls
      onZoomIn={() => transformRef.current?.zoomIn()}
      onZoomOut={() => transformRef.current?.zoomOut()}
      onReset={() => transformRef.current?.resetTransform()}
      // show3D={show3D}
      // onToggle3D={onToggle3D ?? u}
    />
  );

  return (
    <ZoomableContentViewer
      categoryType={categoryType}
      modelIndex={derivedModelIndex}
      imageSrc={imageSrc}
      show3D={show3D}
      onToggle3D={handleToggle3D}
      renderZoomControls={renderZoomControls}
    />
  );
};
