/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "framer-motion";

interface TwoDImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const images: { name: string; src: string }[] = [
  {
    name: "Bali 1",
    src: "https://pub-c83f1ba2cc05448bb87021240670356e.r2.dev/bathroom/BALI_001.png"
  },
  {
    name: "Bali 2",
    src: "https://pub-c83f1ba2cc05448bb87021240670356e.r2.dev/bathroom/BALI_002.png"
  },
  {
    name: "Bali 3",
    src: "https://pub-c83f1ba2cc05448bb87021240670356e.r2.dev/bathroom/BALI_003.jpg"
  }
];

export const TwoDImagesDialog: React.FC<TwoDImagesDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    setLoading(true);
  }, [currentIndex, isOpen]);

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
            <DialogContent className="w-[1200px] max-w-[100vw] sm:max-w-[98vw] lg:max-w-[1400px] h-[100vh] sm:h-[90vh] lg:h-[800px] max-h-[100vh] sm:max-h-[95vh] p-0 bg-black border-0 shadow-none flex flex-col overflow-hidden">
              <VisuallyHidden>
                <DialogTitle>Bali Images</DialogTitle>
              </VisuallyHidden>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-8 w-8 rounded-full"
                onClick={onClose}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>

              {/* Navigation Controls */}
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10 px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-10 w-10 rounded-full pointer-events-auto"
                    onClick={goToPrevious}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-10 w-10 rounded-full pointer-events-auto"
                    onClick={goToNext}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </Button>
                </div>
              )}

              {/* Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Image Viewer */}
              <div
                className="flex-1 relative flex items-center justify-center bg-black"
                draggable={false}
              >
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40">
                    {/* Simple circular spinner */}
                    <svg
                      className="animate-spin h-12 w-12 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  </div>
                )}
                <img
                  src={images[currentIndex].src}
                  alt={images[currentIndex].name}
                  className="h-full w-full object-cover select-none"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    userSelect: "none",
                    visibility: loading ? "hidden" : "visible"
                  }}
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
