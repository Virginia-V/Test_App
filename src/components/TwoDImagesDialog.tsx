"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "framer-motion";

interface TwoDImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImageData {
  src: string;
  alt: string;
}

interface NavigationButtonProps {
  direction: "previous" | "next";
  onClick: () => void;
}

interface ImageCounterProps {
  current: number;
  total: number;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onClick
}) => {
  const isPrevious = direction === "previous";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-10 w-10 rounded-full pointer-events-auto transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
      onClick={onClick}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      >
        <polyline
          points={isPrevious ? "15,18 9,12 15,6" : "9,18 15,12 9,6"}
        ></polyline>
      </svg>
    </Button>
  );
};

const ImageCounter: React.FC<ImageCounterProps> = ({ current, total }) => {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      key={`counter-${current}`}
    >
      {current + 1} / {total}
    </motion.div>
  );
};

const NavigationControls: React.FC<{
  showNavigation: boolean;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ showNavigation, onPrevious, onNext }) => {
  if (!showNavigation) return null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-between pointer-events-none z-10 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <NavigationButton direction="previous" onClick={onPrevious} />
      <NavigationButton direction="next" onClick={onNext} />
    </motion.div>
  );
};

const AnimatedImage: React.FC<{
  image: ImageData;
  index: number;
}> = ({ image, index }) => {
  return (
    <motion.div
      key={`image-${index}`}
      className="absolute inset-0"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        quality={100}
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 98vw, 95vw"
      />
    </motion.div>
  );
};

const ImageDisplay: React.FC<{
  image: ImageData;
  showNavigation: boolean;
  currentIndex: number;
  totalImages: number;
  onPrevious: () => void;
  onNext: () => void;
}> = ({
  image,
  showNavigation,
  currentIndex,
  totalImages,
  onPrevious,
  onNext
}) => {
  return (
    <div className="relative flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <AnimatedImage image={image} index={currentIndex} />
      </AnimatePresence>

      <NavigationControls
        showNavigation={showNavigation}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <AnimatePresence mode="wait">
        <ImageCounter current={currentIndex} total={totalImages} />
      </AnimatePresence>
    </div>
  );
};

export const TwoDImagesDialog: React.FC<TwoDImagesDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const dialogContentStyles =
    "w-full sm:max-w-[98vw] lg:max-w-[1400px] h-[95vh] sm:h-[90vh] lg:h-[800px] max-h-[95vh] p-0 bg-black border-0 shadow-none flex flex-col overflow-hidden [&>button]:cursor-pointer [&>button]:focus:outline-none [&>button]:focus:ring-0";

  const images: ImageData[] = [
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            <DialogContent className={dialogContentStyles}>
              <VisuallyHidden>
                <DialogTitle>2D Views</DialogTitle>
              </VisuallyHidden>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-20 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-8 w-8 rounded-full pointer-events-auto transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
                onClick={onClose}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-sm"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>

              <ImageDisplay
                image={images[currentImageIndex]}
                showNavigation={images.length > 1}
                currentIndex={currentImageIndex}
                totalImages={images.length}
                onPrevious={goToPrevious}
                onNext={goToNext}
              />
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
