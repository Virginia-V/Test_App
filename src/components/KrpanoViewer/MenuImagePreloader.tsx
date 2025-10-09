import { useRef, useCallback } from "react";
import { ALL_MENU_IMAGE_URLS } from "@/lib/menu_preview_images";

interface MenuImagePreloaderProps {
  onLoadComplete: () => void;
}

/**
 * Core image preloading logic - creates Image objects and manages their loading
 */
class ImagePreloader {
  private preloadedRef: React.RefObject<{ value: boolean }>;
  private isLoadingRef: React.RefObject<{ value: boolean }>;

  constructor(
    preloadedRef: React.RefObject<{ value: boolean }>,
    isLoadingRef: React.RefObject<{ value: boolean }>
  ) {
    this.preloadedRef = preloadedRef;
    this.isLoadingRef = isLoadingRef;
  }

  /**
   * Creates a single image preload promise
   * @param src - Image URL to preload
   * @param index - Index for logging purposes
   * @param total - Total number of images for logging
   * @returns Promise that resolves when image loads (or fails)
   */
  private createImagePromise(
    src: string,
    index: number,
    total: number
  ): Promise<void> {
    return new Promise<void>((imageResolve) => {
      const img = new Image();

      const handleImageComplete = () => {
        console.log(`Preloaded menu image ${index + 1}/${total}`);
        imageResolve();
      };

      // Handle successful image load
      img.onload = handleImageComplete;

      // Handle failed image load - still resolve to prevent blocking other images
      img.onerror = () => {
        console.warn(`Failed to preload menu image: ${src}`);
        handleImageComplete(); // Still count as "loaded" to prevent hanging
      };

      // Optimize image loading performance
      img.loading = "eager"; // Load immediately, don't wait for viewport
      img.decoding = "async"; // Decode asynchronously to avoid blocking main thread
      img.src = src; // Start loading
    });
  }

  /**
   * Preloads all menu images in parallel
   * @returns Promise that resolves when all images are loaded (or failed)
   */
  async preloadAllImages(): Promise<void> {
    return new Promise((resolve) => {
      // Early exit conditions - avoid unnecessary work
      if (
        ALL_MENU_IMAGE_URLS.length === 0 || // No images to load
        this.preloadedRef.current?.value || // Already preloaded
        this.isLoadingRef.current?.value // Currently loading
      ) {
        resolve();
        return;
      }

      // Set loading state to prevent duplicate preloading
      if (this.isLoadingRef.current) {
        this.isLoadingRef.current.value = true;
      }
      console.log(
        `🔄 Starting to preload ${ALL_MENU_IMAGE_URLS.length} menu images...`
      );

      // Create promises for all images - they'll load in parallel
      const imagePromises = ALL_MENU_IMAGE_URLS.map((src, index) =>
        this.createImagePromise(src, index, ALL_MENU_IMAGE_URLS.length)
      );

      // Wait for all images to complete (including failures)
      // Promise.allSettled ensures we don't fail if individual images fail
      Promise.allSettled(imagePromises).then(() => {
        // Update state - preloading is complete
        if (this.preloadedRef.current) {
          this.preloadedRef.current.value = true;
        }
        if (this.isLoadingRef.current) {
          this.isLoadingRef.current.value = false;
        }

        console.log(
          `✅ Successfully preloaded all ${ALL_MENU_IMAGE_URLS.length} menu images`
        );
        resolve();
      });
    });
  }
}

/**
 * State management for preloader status
 */
class PreloaderState {
  private preloadedRef: React.RefObject<{ value: boolean }>;
  private isLoadingRef: React.RefObject<{ value: boolean }>;

  constructor(
    preloadedRef: React.RefObject<{ value: boolean }>,
    isLoadingRef: React.RefObject<{ value: boolean }>
  ) {
    this.preloadedRef = preloadedRef;
    this.isLoadingRef = isLoadingRef;
  }

  /**
   * Check if images have been preloaded
   */
  isPreloaded = (): boolean => this.preloadedRef.current?.value ?? false;

  /**
   * Check if preloading is currently in progress
   */
  isLoading = (): boolean => this.isLoadingRef.current?.value ?? false;

  /**
   * Reset preloaded state (only if not currently loading)
   * Used when switching scenes to allow re-preloading if needed
   */
  resetPreloaded = (): void => {
    if (!this.isLoadingRef.current?.value && this.preloadedRef.current) {
      this.preloadedRef.current.value = false;
    }
  };
}

/**
 * Component-based menu image preloader (class-based approach)
 * Provides object-oriented interface for preloading functionality
 */
export default function MenuImagePreloader({
  onLoadComplete
}: MenuImagePreloaderProps) {
  // State refs for tracking preload status - using RefObject with wrapper objects
  const preloadedRef = useRef({ value: false });
  const isLoadingRef = useRef({ value: false });

  // Initialize helper classes
  const imagePreloader = new ImagePreloader(preloadedRef, isLoadingRef);
  const preloaderState = new PreloaderState(preloadedRef, isLoadingRef);

  /**
   * Start the preloading process and call completion callback
   */
  const startPreloading = async () => {
    await imagePreloader.preloadAllImages();
    onLoadComplete();
  };

  return {
    startPreloading,
    isPreloaded: preloaderState.isPreloaded,
    isLoading: preloaderState.isLoading
  };
}

/**
 * React hook version of the menu image preloader
 * Provides the same functionality as the component but in hook form
 * This is the recommended approach for React applications
 */
export function useMenuImagePreloader(onLoadComplete: () => void) {
  // State refs for tracking preload status - using RefObject with wrapper objects
  const preloadedRef = useRef({ value: false });
  const isLoadingRef = useRef({ value: false });

  /**
   * Memoized function to preload all menu images
   * Only recreated if onLoadComplete callback changes
   */
  const preloadMenuImages = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Early exit conditions - avoid unnecessary work
      if (
        ALL_MENU_IMAGE_URLS.length === 0 || // No images to preload
        preloadedRef.current.value || // Already preloaded
        isLoadingRef.current.value // Currently loading
      ) {
        resolve();
        return;
      }

      // Set loading state to prevent concurrent preloading
      isLoadingRef.current.value = true;
      console.log(
        `🔄 Starting to preload ${ALL_MENU_IMAGE_URLS.length} menu images...`
      );

      // Create image loading promises for parallel execution
      const imagePromises = ALL_MENU_IMAGE_URLS.map((src, index) => {
        return new Promise<void>((imageResolve) => {
          const img = new Image();

          const handleImageComplete = () => {
            console.log(
              `Preloaded menu image ${index + 1}/${ALL_MENU_IMAGE_URLS.length}`
            );
            imageResolve();
          };

          // Set up event handlers
          img.onload = handleImageComplete;
          img.onerror = () => {
            console.warn(`Failed to preload menu image: ${src}`);
            handleImageComplete(); // Still resolve to prevent blocking
          };

          // Optimize loading performance
          img.loading = "eager"; // Priority loading
          img.decoding = "async"; // Non-blocking decode
          img.src = src; // Trigger load
        });
      });

      // Wait for all images to complete (success or failure)
      Promise.allSettled(imagePromises).then(() => {
        // Update completion state
        preloadedRef.current.value = true;
        isLoadingRef.current.value = false;

        console.log(
          `✅ Successfully preloaded all ${ALL_MENU_IMAGE_URLS.length} menu images`
        );

        // Notify completion
        onLoadComplete();
        resolve();
      });
    });
  }, [onLoadComplete]);

  /**
   * Public API: Start preloading if not already done or in progress
   */
  const startPreloading = useCallback(() => {
    if (!preloadedRef.current.value && !isLoadingRef.current.value) {
      preloadMenuImages();
    }
  }, [preloadMenuImages]);

  /**
   * Public API: Check if preloading is complete
   */
  const isPreloaded = useCallback(() => preloadedRef.current.value, []);

  /**
   * Public API: Check if preloading is in progress
   */
  const isLoading = useCallback(() => isLoadingRef.current.value, []);

  /**
   * Public API: Reset preloaded state for scene changes
   * Only resets if not currently loading to avoid race conditions
   */
  const resetPreloaded = useCallback(() => {
    if (!isLoadingRef.current.value) {
      preloadedRef.current.value = false;
    }
  }, []);

  // Return hook interface
  return {
    startPreloading,
    isPreloaded,
    isLoading,
    resetPreloaded
  };
}
