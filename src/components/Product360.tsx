import React, { useState, useEffect, useRef } from "react";
import { ReactImageTurntable } from "react-image-turntable";

export default function Product360() {
  const [showDragIndicator, setShowDragIndicator] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const images = Array.from(
    { length: 120 },
    (_, i) =>
      `360-images-2/BATH-A_BMAT-A1_${String(i + 1).padStart(4, "0")}.jpg`
  );

  const handleDragStart = () => {
    setShowDragIndicator(false);
    setIsDragging(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Show indicator again after 2 seconds of no dragging
    timeoutRef.current = setTimeout(() => {
      setShowDragIndicator(true);
    }, 1000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="rounded-md overflow-hidden w-full h-full select-none pointer-events-auto relative"
      // style={{
      //   height: "500px",
      //   minHeight: "500px"
      // }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      <ReactImageTurntable
        images={images}
        initialImageIndex={0}
        movementSensitivity={0.5}
        autoRotate={{ disabled: true, interval: 50 }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />

      {/* Simple Drag Indicator */}
      {showDragIndicator && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/80 text-white px-6 py-4 rounded-lg flex items-center gap-3 animate-pulse">
            <div className="flex items-center gap-4">
              {/* Left arrow */}
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="currentColor"
              >
                <path d="M0 8L8 0V4H24V12H8V16L0 8Z" />
              </svg>
              <span className="text-sm font-medium">Drag to rotate 360°</span>
              {/* Right arrow */}
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="currentColor"
              >
                <path d="M24 8L16 0V4H0V12H16V16L24 8Z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
