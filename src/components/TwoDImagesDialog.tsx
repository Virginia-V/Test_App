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

        <DialogHeader className="p-6 pb-4 flex-shrink-0"></DialogHeader>

        <div className="flex-1 flex flex-col p-2 pt-0 overflow-hidden">
          {/* Main Image Display */}
          <div className="relative flex-1 rounded-lg overflow-hidden">
            <Image
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              fill
              className="object-contain p-2"
              quality={100}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 98vw, 95vw"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10 px-4">
                {/* Left Arrow */}
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

                {/* Right Arrow */}
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
          </div>

          {/* Thumbnail Navigation */}
          {/* {images.length > 1 && (
            <div className="flex justify-center gap-6 mt-4 flex-shrink-0">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-24 h-24 rounded-lg overflow-hidden border-3 transition-all ${
                    index === currentImageIndex
                      ? "border-[var(--color-caramel)] ring-4 ring-[var(--color-caramel)]/30 scale-110"
                      : "border-gray-300 hover:border-gray-400 hover:scale-105"
                  }`}
                  onClick={() => goToSlide(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    quality={75}
                  />
                </button>
              ))}
            </div>
          )} */}
        </div>

        {/* Footer to match InfoPanel style */}
        <div className="flex flex-row h-10 gap-0 -mb-3 flex-shrink-0">
          <div className="flex-1 bg-[var(--color-caramel)] -ml-[1px] rounded-bl-lg" />
          <div className="flex-1 bg-[var(--color-wood)] -mr-[1px] rounded-br-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
