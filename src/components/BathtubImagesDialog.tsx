"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Variants,
  easeIn,
  easeOut
} from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface BathtubImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BATHTUB_IMAGES = [
  { src: "/Bathtub_Images/Bathtub_Img_01.jpg", alt: "Bathtub Image 1" },
  { src: "/Bathtub_Images/Bathtub_Img_02.jpg", alt: "Bathtub Image 2" },
  { src: "/Bathtub_Images/Bathtub_Img_03.jpg", alt: "Bathtub Image 3" },
  { src: "/Bathtub_Images/Bathtub_Img_04.jpg", alt: "Bathtub Image 4" },
  { src: "/Bathtub_Images/Bathtub_Img_05.jpg", alt: "Bathtub Image 5" },
  { src: "/Bathtub_Images/Bathtub_Img_06.jpg", alt: "Bathtub Image 6" }
];

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    transition: { duration: 0.18, ease: easeIn }
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: easeOut }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.18, ease: easeIn }
  })
};

export const BathtubImagesDialog: React.FC<BathtubImagesDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => contentRef.current?.focus());
    }
  }, [isOpen]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((i) => (i === 0 ? BATHTUB_IMAGES.length - 1 : i - 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((i) => (i === BATHTUB_IMAGES.length - 1 ? 0 : i + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  if (!isOpen) return null;

  const dialogContent = (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div
        className="fixed inset-0 z-[100000] flex items-center justify-center"
        style={{
          position: "fixed", // Use fixed positioning to cover viewport
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100000
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Dialog Content - can exceed InfoPanel boundaries */}
        <div
          ref={contentRef}
          className={cn(
            "relative bg-white rounded-lg shadow-2xl max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden"
          )}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden>Bathtub Images</VisuallyHidden>
            </DialogTitle>
          </DialogHeader>

          {/* Custom close button */}
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full shadow-md border border-gray-200 transition-all duration-200 hover:scale-105 focus:outline-none cursor-pointer"
              aria-label="Close panel"
            >
              <X size={16} className="text-gray-600 hover:text-gray-800" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-4">
            {/* Main Image Display */}
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-lg bg-gray-100 grid place-items-center min-h-[280px] sm:min-h-[360px] max-h-[65vh]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.img
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  src={BATHTUB_IMAGES[currentIndex].src}
                  alt={BATHTUB_IMAGES[currentIndex].alt}
                  draggable={false}
                  className="max-w-full w-auto max-h-[65vh] h-auto object-contain select-none"
                  onError={() =>
                    console.error(
                      `Failed to load image: ${BATHTUB_IMAGES[currentIndex].src}`
                    )
                  }
                  onLoad={() =>
                    console.log(
                      `Successfully loaded: ${BATHTUB_IMAGES[currentIndex].src}`
                    )
                  }
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white cursor-pointer"
                onClick={goToPrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white cursor-pointer"
                onClick={goToNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );

  // Render directly without createPortal so it stays within InfoPanel
  return dialogContent;
};
