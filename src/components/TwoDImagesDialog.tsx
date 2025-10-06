/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "framer-motion";

interface TwoDImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KrpanoView {
  name: string;
  xmlPath: string;
  jsPath: string;
}

const views: KrpanoView[] = [
  {
    name: "View 1",
    xmlPath: "/2D-images/view_1/pano.xml",
    jsPath: "/2D-images/view_1/pano.js"
  },
  {
    name: "View 2",
    xmlPath: "/2D-images/view_2/pano.xml",
    jsPath: "/2D-images/view_2/pano.js"
  }
];

const KrpanoViewer: React.FC<{
  view: KrpanoView;
  containerId: string;
}> = ({ view, containerId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const krpanoInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log(
      "Loading krpano for:",
      view.name,
      "with container:",
      containerId
    );

    // Clear any existing content
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }

    // Remove any existing krpano instance
    if (krpanoInstanceRef.current) {
      try {
        krpanoInstanceRef.current.call("removepano()");
      } catch (e) {
        console.log("Error removing previous instance:", e);
      }
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src="${view.jsPath}"]`
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Load krpano script
    const script = document.createElement("script");
    script.src = view.jsPath;
    script.onload = () => {
      console.log("Krpano script loaded:", view.jsPath);

      // Wait a bit for the script to initialize
      setTimeout(() => {
        if (typeof window.embedpano === "function") {
          console.log("Initializing embedpano with:", {
            xml: view.xmlPath,
            target: containerId
          });

          try {
            window.embedpano({
              xml: view.xmlPath,
              target: containerId,
              html5: "auto",
              mobilescale: 1.0,
              passQueryParameters: false,
              consolelog: true, // Enable console logging for debugging
              onready: function () {
                console.log("Krpano viewer ready for:", view.name);
                krpanoInstanceRef.current = this;
              },
              onerror: function (message: string) {
                console.error("Krpano error:", message);
              }
            });
          } catch (error) {
            console.error("Error initializing krpano:", error);
          }
        } else {
          console.error("embedpano function not found");
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error("Failed to load krpano script:", view.jsPath, error);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (krpanoInstanceRef.current) {
        try {
          krpanoInstanceRef.current.call("removepano()");
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }

      // Remove script
      const scriptToRemove = document.querySelector(
        `script[src="${view.jsPath}"]`
      );
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [view, containerId]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className="w-full h-full"
      style={{
        minHeight: "400px",
        position: "relative",
        overflow: "hidden"
      }}
    />
  );
};

export const TwoDImagesDialog: React.FC<TwoDImagesDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentViewIndex((prev) => (prev === 0 ? views.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentViewIndex((prev) => (prev === views.length - 1 ? 0 : prev + 1));
  };

  // Debug: Log when view changes
  useEffect(() => {
    console.log("Current view index changed to:", currentViewIndex);
  }, [currentViewIndex]);

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
            <DialogContent className="w-full max-w-[100vw] sm:max-w-[98vw] lg:max-w-[1400px] h-[100vh] sm:h-[90vh] lg:h-[800px] max-h-[100vh] sm:max-h-[95vh] p-0 bg-black border-0 shadow-none flex flex-col overflow-hidden">
              <VisuallyHidden>
                <DialogTitle>2D Views</DialogTitle>
              </VisuallyHidden>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-8 w-8 rounded-full"
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
              {views.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10 px-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-10 w-10 rounded-full pointer-events-auto"
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
                    className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/50 backdrop-blur-sm text-white hover:text-white h-10 w-10 rounded-full pointer-events-auto"
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
                {currentViewIndex + 1} / {views.length}
              </div>
              
              {/* Krpano Viewer */}
              <div className="flex-1 relative">
                <KrpanoViewer
                  view={views[currentViewIndex]}
                  containerId={`krpano-viewer-${currentViewIndex}`}
                />
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
