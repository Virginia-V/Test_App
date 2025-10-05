"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface TwoDImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoDImagesDialog: React.FC<TwoDImagesDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // List of 2D images
  const images = [
    {
      src: "/2D-images/view-1.jpg",
      alt: "2D View 1"
    },
    {
      src: "/2D-images/view-2.jpg",
      alt: "2D View 2"
    }
  ];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[98vw] lg:max-w-[1400px] w-full max-h-[95vh] h-[95vh] sm:h-[90vh] lg:h-[800px] p-0 bg-[#EDECEB] [&>button]:cursor-pointer [&>button]:focus:outline-none [&>button]:focus:ring-0 flex flex-col">
        <VisuallyHidden>
          <DialogTitle>2D Views</DialogTitle>
        </VisuallyHidden>

        {/* Main Image Display - Full Space */}
        <div className="relative flex-1 overflow-hidden">
          <Image
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].alt}
            fill
            className="object-contain"
            quality={100}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 98vw, 95vw"
          />


          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10 px-6">

              <Button
                variant="ghost"
                size="lg"
                className="bg-black/60 hover:bg-black/80 text-white h-16 w-16 rounded-full pointer-events-auto"
                onClick={goToPrevious}
              >
                <svg
                  width="28"
                  height="20"
                  viewBox="0 0 24 16"
                  fill="currentColor"
                >
                  <path d="M0 8L8 0V4H24V12H8V16L0 8Z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="bg-black/60 hover:bg-black/80 text-white h-16 w-16 rounded-full pointer-events-auto"
                onClick={goToNext}
              >
                <svg
                  width="28"
                  height="20"
                  viewBox="0 0 24 16"
                  fill="currentColor"
                >
                  <path d="M24 8L16 0V4H0V12H16V16L24 8Z" />
                </svg>
              </Button>
            </div>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Footer to match InfoPanel style */}
        {/* <div className="flex flex-row h-8 gap-0 flex-shrink-0">
          <div className="flex-1 bg-[var(--color-caramel)] rounded-bl-lg" />
          <div className="flex-1 bg-[var(--color-wood)] rounded-br-lg" />
        </div> */}
      </DialogContent>
    </Dialog>
  );
};
