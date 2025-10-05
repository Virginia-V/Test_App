"use client";

import React, { useState } from "react";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomControls } from "./ZoomControls";
import { useProductData } from "@/hooks/useProductData";
import { ZoomableContentViewer } from "./components";

interface ImagePlaceholderProps {
  panoramaType?: string;
  modelIndex?: number | null;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  panoramaType,
  modelIndex
}) => {
  const [show3D, setShow3D] = useState(false);
  const [show360, setShow360] = useState(false);

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
    setShow360(false); // Hide 360 when showing 3D
  };

  const handleToggle360 = () => {
    setShow360((prev) => !prev);
    setShow3D(false); // Hide 3D when showing 360
  };

  // Render zoom controls with proper ref handling
  const renderZoomControls = (
    transformRef: React.RefObject<ReactZoomPanPinchRef | null>,
    show3D: boolean,
    onToggle3D: () => void
  ) => (
    <ZoomControls
      onZoomIn={() => transformRef.current?.zoomIn()}
      onZoomOut={() => transformRef.current?.zoomOut()}
      onReset={() => transformRef.current?.resetTransform()}
      show3D={show3D}
      onToggle3D={onToggle3D}
      show360={show360}
      onToggle360={handleToggle360}
    />
  );

  return (
    <ZoomableContentViewer
      categoryType={categoryType}
      modelIndex={derivedModelIndex}
      imageSrc={imageSrc}
      show3D={show3D}
      show360={show360}
      onToggle3D={handleToggle3D}
      renderZoomControls={renderZoomControls}
    />
  );
};
