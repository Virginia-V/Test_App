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

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { variants } from "@/constants";

import { menu_preview_images } from "@/lib/menu_preview_images";
import { DESTINATION_IMAGES } from "@/lib/destination-images";
import { usePanoramaContext } from "@/context/PanoramaContext";

// const EXIT_ANIMATION_DURATION = 200;

// type BottomMenuProps = {
//   onInfoClick?: () => void;
//   panoramaType: PanoramaType;
//   backdropClosing?: boolean;
//   onAnimationComplete?: () => void;
//   style?: React.CSSProperties; // <-- Add this line
// };

// export const BottomMenu = ({
//   onInfoClick,
//   panoramaType,
//   backdropClosing = false,
//   onAnimationComplete,
//   style // <-- Add this line
// }: BottomMenuProps) => {
//   // const t = useTranslations();
//   const {
//     panoramas,
//     updatePanorama,
//     setPanelVisible,
//     setMenuOpen,
//     materialHasColors,
//     menuImagesPreloaded // This is the key state
//   } = usePanorama();

//   const panorama = panoramas[panoramaType];
//   const [isClosing, setIsClosing] = useState(false);
//   const [imagesLoaded, setImagesLoaded] = useState(menuImagesPreloaded); // Initialize with preloaded state

//   const previousTypeRef = useRef<PanoramaType>(panoramaType);
//   const didInitRef = useRef(menuImagesPreloaded); // Initialize with preloaded state

//   // Initialize loading state based on preloaded status
//   useEffect(() => {
//     if (menuImagesPreloaded) {
//       console.log(
//         "[BottomMenu] Menu images already preloaded - showing images immediately"
//       );
//       setImagesLoaded(true);
//       didInitRef.current = true;
//     }
//   }, [menuImagesPreloaded]);

//   // Reset image loading when category changes
//   useEffect(() => {
//     if (previousTypeRef.current !== panoramaType) {
//       console.log(
//         `[BottomMenu] Category changed from ${previousTypeRef.current} to ${panoramaType}`
//       );

//       // If menu images are preloaded, immediately set as loaded
//       if (menuImagesPreloaded) {
//         console.log("[BottomMenu] Using preloaded images for new category");
//         setImagesLoaded(true);
//         didInitRef.current = true;
//       } else {
//         console.log(
//           "[BottomMenu] Menu images not preloaded - will show loading state"
//         );
//         setImagesLoaded(false);
//         didInitRef.current = false;
//       }

//       previousTypeRef.current = panoramaType;
//     }
//   }, [panoramaType, menuImagesPreloaded]);

//   // --- Use menu_preview_images for model/material/color lists ---
//   const modelList = useMemo(() => {
//     if (panoramaType === "bathtub" || panoramaType === "sink") {
//       return menu_preview_images[panoramaType].models.map((model) => ({
//         src: model.previewFile
//       }));
//     } else if (panoramaType === "floor") {
//       return menu_preview_images.floor.models.map((model) => ({
//         src: model.previewFile
//       }));
//     }
//     return [];
//   }, [panoramaType]);

//   const materialList = useMemo(() => {
//     if (panoramaType === "bathtub" || panoramaType === "sink") {
//       const selectedModelIndex = panorama.modelIndex ?? 0;
//       const models = menu_preview_images[panoramaType].models;
//       const selectedModel = models[selectedModelIndex];
//       return selectedModel?.materials
//         ? selectedModel.materials.map((mat) => ({ src: mat.file }))
//         : [];
//     }
//     return [];
//   }, [panoramaType, panorama.modelIndex]);

//   const colorList = useMemo(() => {
//     if (panoramaType === "bathtub" || panoramaType === "sink") {
//       const selectedModelIndex = panorama.modelIndex ?? 0;
//       const models = menu_preview_images[panoramaType].models;
//       const selectedModel = models[selectedModelIndex];
//       const selectedMaterialIndex = panorama.materialIndex ?? 0;
//       const selectedMaterial =
//         selectedModel?.materials?.[selectedMaterialIndex];
//       return selectedMaterial?.colors?.map((c) => ({ src: c.file })) ?? [];
//     }
//     return [];
//   }, [panoramaType, panorama.modelIndex, panorama.materialIndex]);

//   const destinationList = useMemo(() => {
//     return Object.values(DESTINATION_IMAGES).map((img) => ({
//       src: img
//     }));
//   }, []);

//   const handleClose = useCallback(() => {
//     setMenuOpen(panoramaType, false);
//   }, [panoramaType, setMenuOpen]);

//   useEffect(() => {
//     if (backdropClosing) setIsClosing(true);
//   }, [backdropClosing]);

//   useEffect(() => {
//     if (!isClosing) return;
//     const timer = setTimeout(() => {
//       if (backdropClosing && onAnimationComplete) {
//         onAnimationComplete();
//       } else {
//         handleClose();
//       }
//       setIsClosing(false);
//     }, EXIT_ANIMATION_DURATION);
//     return () => clearTimeout(timer);
//   }, [isClosing, backdropClosing, onAnimationComplete, handleClose]);

//   const handleMenuClose = useCallback((reason?: string) => {
//     // Only allow closing from the close button, not from swipe or backdrop
//     // All other close attempts are ignored
//   }, []);

//   const handleInfoClick = useCallback(() => {
//     setMenuOpen(panoramaType, false);
//     setTimeout(() => {
//       setPanelVisible(true);
//       onInfoClick?.();
//     }, EXIT_ANIMATION_DURATION);
//   }, [panoramaType, setMenuOpen, setPanelVisible, onInfoClick]);

//   // Collect all unique image sources
//   const allImageSrcs = useMemo(() => {
//     const sources = new Set<string>();

//     modelList?.forEach((item) => sources.add(item.src));
//     materialList?.forEach((item) => sources.add(item.src));
//     colorList?.forEach((item) => sources.add(item.src));
//     destinationList?.forEach((item) => sources.add(item.src));

//     return Array.from(sources);
//   }, [modelList, materialList, colorList, destinationList]);

//   // Only do individual loading if images are NOT preloaded
//   useEffect(() => {
//     // If images are already preloaded, skip individual loading entirely
//     if (menuImagesPreloaded) {
//       if (!imagesLoaded) {
//         console.log("[BottomMenu] Switching to preloaded images");
//         setImagesLoaded(true);
//         didInitRef.current = true;
//       }
//       return; // Exit early - no individual loading needed
//     }

//     // Only do individual loading if preloading didn't happen
//     console.log(
//       `[BottomMenu] Preloading not complete - loading ${allImageSrcs.length} images individually`
//     );

//     let loadedCount = 0;

//     if (allImageSrcs.length === 0) {
//       setImagesLoaded(true);
//       didInitRef.current = true;
//       return;
//     }

//     // Reset loading state for individual loading
//     setImagesLoaded(false);
//     didInitRef.current = false;

//     allImageSrcs.forEach((src) => {
//       const img = new window.Image();
//       img.src = src;
//       img.onload = img.onerror = () => {
//         loadedCount += 1;
//         if (loadedCount === allImageSrcs.length) {
//           console.log("[BottomMenu] Individual loading complete");
//           setImagesLoaded(true);
//           didInitRef.current = true;
//         }
//       };
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     panoramaType,
//     allImageSrcs,
//     menuImagesPreloaded // Key dependency
//   ]);

//   return (
//     <div className="relative" style={style}>
//       <AnimatePresence>
//         {panorama.menuOpen && !isClosing && (
//           <motion.div
//             key="bottom-menu"
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             variants={variants}
//             style={{ width: "100%" }}
//           >
//             {/* <InfoIconWrapper onClick={handleInfoClick} /> */}
//             {/* Close Button */}
//             <div className="absolute top-4 right-4 z-30">
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button
//                       onClick={handleClose}
//                       variant="ghost"
//                       size="icon"
//                       className="bg-black/50 hover:bg-black/70 rounded-full text-white hover:text-white cursor-pointer"
//                       aria-label="Close menu"
//                     >
//                       <VisibilityOffIcon fontSize="small" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>closeMenu</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             </div>
//             <MenuContainer
//               open={panorama.menuOpen && !isClosing}
//               onClose={handleMenuClose}
//               isClosing={isClosing}
//               exitDuration={EXIT_ANIMATION_DURATION}
//             >
//               <CarouselGroup
//                 materialImages={
//                   panoramaType === "floor" ? undefined : materialList
//                 }
//                 modelImages={modelList}
//                 destinationImages={destinationList}
//                 colorImages={panoramaType === "floor" ? undefined : colorList}
//                 selectedMaterialIndex={panorama.materialIndex ?? undefined}
//                 setSelectedMaterialIndex={(index) => {
//                   if (
//                     panoramaType !== "floor" &&
//                     materialHasColors(panoramaType, panorama.modelIndex, index)
//                   ) {
//                     updatePanorama(panoramaType, {
//                       materialIndex: index,
//                       colorIndex: 0
//                     });
//                   } else {
//                     updatePanorama(panoramaType, {
//                       materialIndex: index,
//                       colorIndex: null
//                     });
//                   }
//                 }}
//                 selectedModelIndex={panorama.modelIndex ?? undefined}
//                 onModelSelect={(index) => {
//                   const firstMaterialIdx = 0;
//                   const hasColorsAfter =
//                     panoramaType !== "floor" &&
//                     materialHasColors(panoramaType, index, firstMaterialIdx);

//                   updatePanorama(panoramaType, {
//                     modelIndex: index,
//                     materialIndex: firstMaterialIdx,
//                     colorIndex: hasColorsAfter ? 0 : null
//                   });
//                 }}
//                 selectedDestinationIndex={panorama.destinationIndex ?? 0}
//                 onDestinationSelect={(index) =>
//                   updatePanorama(panoramaType, { destinationIndex: index })
//                 }
//                 selectedColorIndex={
//                   panorama.colorIndex ??
//                   (materialHasColors(
//                     panoramaType,
//                     panorama.modelIndex,
//                     panorama.materialIndex ?? 0
//                   )
//                     ? 0
//                     : undefined)
//                 }
//                 onColorSelect={(index) =>
//                   updatePanorama(panoramaType, { colorIndex: index })
//                 }
//                 isLoading={!imagesLoaded}
//               />
//             </MenuContainer>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

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

  // const handleClose = useCallback(() => {
  //   setIsClosing(true);
  // }, []);

  // in BottomMenu.tsx
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // after exit animation, actually close in the provider
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
    }, EXIT_ANIMATION_DURATION);
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
