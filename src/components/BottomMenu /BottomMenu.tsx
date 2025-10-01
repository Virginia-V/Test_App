"use client";

import { CarouselGroup, InfoIconWrapper, MenuContainer } from "./menu-ui";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

import { useCallback, useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { variants } from "@/constants";

import { menu_preview_images } from "@/lib/menu_preview_images";
import { DESTINATION_IMAGES } from "@/lib/destination-images";
import { usePanoramaContext } from "@/context/PanoramaContext";

const EXIT_ANIMATION_DURATION = 200;

type PanoramaType = "bathtub" | "sink" | "floor";

type BottomMenuProps = {
  onInfoClick?: () => void;
  panoramaType: PanoramaType;
  backdropClosing?: boolean;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export const BottomMenu = ({
  onInfoClick,
  panoramaType,
  backdropClosing = false,
  onAnimationComplete,
  style
}: BottomMenuProps) => {
  const { panoramas, updatePanorama, setMenuOpen, setPanelVisible } =
    usePanoramaContext();

  const panorama = panoramas[panoramaType];
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setMenuOpen(panoramaType, false);
      onAnimationComplete?.();
    }, EXIT_ANIMATION_DURATION);
  }, [panoramaType, setMenuOpen, onAnimationComplete]);

  useEffect(() => {
    if (backdropClosing) setIsClosing(true);
  }, [backdropClosing]);

  useEffect(() => {
    if (!isClosing) return;
    const timer = setTimeout(() => {
      // ✅ Always tell parent to unmount after exit animation
      onAnimationComplete?.(); // <-- This should tell the parent to unmount/hide the menu
      setIsClosing(false);
    }, EXIT_ANIMATION_DURATION);
    return () => clearTimeout(timer);
  }, [isClosing, onAnimationComplete]);

  const handleInfoClick = useCallback(() => {
    setMenuOpen(panoramaType, false);
    setTimeout(() => {
      setPanelVisible(true);
      onInfoClick?.();
    }, 50); // Much shorter delay
  }, [panoramaType, setMenuOpen, setPanelVisible, onInfoClick]);

  // --- Build lists from menu_preview_images ---
  const modelList = useMemo(() => {
    if (panoramaType === "bathtub" || panoramaType === "sink") {
      return menu_preview_images[panoramaType].models.map((m) => ({
        src: m.previewFile
      }));
    } else if (panoramaType === "floor") {
      return menu_preview_images.floor.models.map((m) => ({
        src: m.previewFile
      }));
    }
    return [];
  }, [panoramaType]);

  const materialList = useMemo(() => {
    if (panoramaType === "bathtub" || panoramaType === "sink") {
      const selectedModelIndex = panorama.modelIndex ?? 0;
      const models = menu_preview_images[panoramaType].models;
      const selectedModel = models[selectedModelIndex];
      return selectedModel?.materials
        ? selectedModel.materials.map((mat) => ({ src: mat.file }))
        : [];
    }
    return [];
  }, [panoramaType, panorama.modelIndex]);

  const colorList = useMemo(() => {
    if (panoramaType === "bathtub" || panoramaType === "sink") {
      const selectedModelIndex = panorama.modelIndex ?? 0;
      const models = menu_preview_images[panoramaType].models;
      const selectedModel = models[selectedModelIndex];
      const selectedMaterialIndex = panorama.materialIndex ?? 0;
      const selectedMaterial =
        selectedModel?.materials?.[selectedMaterialIndex];
      return selectedMaterial?.colors?.map((c) => ({ src: c.file })) ?? [];
    }
    return [];
  }, [panoramaType, panorama.modelIndex, panorama.materialIndex]);

  const destinationList = useMemo(() => {
    return Object.values(DESTINATION_IMAGES).map((img) => ({ src: img }));
  }, []);

  return (
    <div className="relative" style={style}>
      <AnimatePresence>
        {!isClosing && (
          <motion.div
            key="bottom-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            style={{ width: "100%" }}
          >
            <InfoIconWrapper onClick={handleInfoClick} />
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-30">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleClose}
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 rounded-full text-white hover:text-white cursor-pointer"
                      aria-label="Close menu"
                    >
                      <VisibilityOffIcon fontSize="small" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <MenuContainer
              open={!isClosing}
              onClose={() => {}}
              isClosing={isClosing}
              exitDuration={EXIT_ANIMATION_DURATION}
            >
              <CarouselGroup
                materialImages={
                  panoramaType === "floor" ? undefined : materialList
                }
                modelImages={modelList}
                destinationImages={destinationList}
                colorImages={panoramaType === "floor" ? undefined : colorList}
                selectedMaterialIndex={panorama.materialIndex ?? undefined}
                setSelectedMaterialIndex={(index) =>
                  updatePanorama({
                    part: panoramaType,
                    patch: { materialIndex: index, colorIndex: null }
                  })
                }
                selectedModelIndex={panorama.modelIndex ?? undefined}
                onModelSelect={(index) =>
                  updatePanorama({
                    part: panoramaType,
                    patch: {
                      modelIndex: index,
                      materialIndex: 0,
                      colorIndex: null
                    }
                  })
                }
                // selectedDestinationIndex={panorama.destinationIndex ?? 0}
                // onDestinationSelect={(index) =>
                //   updatePanorama({
                //     part: panoramaType,
                //     patch: { destinationIndex: index }
                //   })
                // }
                selectedColorIndex={panorama.colorIndex ?? undefined}
                onColorSelect={(index) =>
                  updatePanorama({
                    part: panoramaType,
                    patch: { colorIndex: index }
                  })
                }
                isLoading={false}
              />
            </MenuContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
