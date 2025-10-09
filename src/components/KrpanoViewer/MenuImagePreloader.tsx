import { useRef } from "react";
import { ALL_MENU_IMAGE_URLS } from "@/lib/menu_preview_images";

interface MenuImagePreloaderProps {
  onLoadComplete: () => void;
}

export default function MenuImagePreloader({ onLoadComplete }: MenuImagePreloaderProps) {
  const preloadedRef = useRef(false);

  const preloadMenuImages = (): Promise<void> => {
    return new Promise((resolve) => {
      if (ALL_MENU_IMAGE_URLS.length === 0 || preloadedRef.current) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalImages = ALL_MENU_IMAGE_URLS.length;

      ALL_MENU_IMAGE_URLS.forEach((src) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            preloadedRef.current = true;
            resolve();
          }
        };
        img.src = src;
      });
    });
  };

  const startPreloading = async () => {
    await preloadMenuImages();
    onLoadComplete();
  };

  return {
    startPreloading,
    isPreloaded: () => preloadedRef.current
  };
}

// Hook version for easier usage
export function useMenuImagePreloader(onLoadComplete: () => void) {
  const preloadedRef = useRef(false);

  const preloadMenuImages = (): Promise<void> => {
    return new Promise((resolve) => {
      if (ALL_MENU_IMAGE_URLS.length === 0 || preloadedRef.current) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalImages = ALL_MENU_IMAGE_URLS.length;

      ALL_MENU_IMAGE_URLS.forEach((src) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            preloadedRef.current = true;
            onLoadComplete();
            resolve();
          }
        };
        img.src = src;
      });
    });
  };

  const startPreloading = () => {
    preloadMenuImages();
  };

  const isPreloaded = () => preloadedRef.current;
  
  const resetPreloaded = () => {
    preloadedRef.current = false;
  };

  return {
    startPreloading,
    isPreloaded,
    resetPreloaded
  };
}