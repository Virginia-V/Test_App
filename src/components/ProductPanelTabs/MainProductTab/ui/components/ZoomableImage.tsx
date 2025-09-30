"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LoadingIndicator } from "./LoadingIndicator";

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoadingComplete?: () => void;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt = "Zoomable Product",
  className = "rounded-md w-full h-full object-cover select-none pointer-events-auto",
  width = 800,
  height = 800,
  priority = true,
  onLoadingComplete
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoaded = () => {
    setImageLoading(false);
    onLoadingComplete?.();
  };

  return (
    <>
      {imageLoading && <LoadingIndicator />}
      <Image
        src={src}
        alt={alt}
        onLoadingComplete={handleImageLoaded}
        className={className}
        width={width}
        quality={100}
        height={height}
        priority={priority}
        unoptimized={true} 
        style={{
          height: "500px",
          objectFit: "cover"
        }}
      />
    </>
  );
};
