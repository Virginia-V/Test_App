import React from "react";

export interface PreloadResult {
  loadedImages: HTMLImageElement[];
  failedUrls: string[];
}

// Add a cache Map to store loaded images in memory
const imageCache = new Map<string, HTMLImageElement>();

export const preloadImages = (imageUrls: string[]): Promise<PreloadResult> => {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalImages = imageUrls.length;
    const loadedImages: HTMLImageElement[] = [];
    const failedUrls: string[] = [];

    if (totalImages === 0) {
      resolve({ loadedImages, failedUrls });
      return;
    }

    imageUrls.forEach((url, index) => {
      // Check if image is already cached in memory
      if (imageCache.has(url)) {
        loadedImages[index] = imageCache.get(url)!;
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve({ loadedImages, failedUrls });
        }
        return;
      }

      const img = new Image();

      // Enable cross-origin if needed and set cache-friendly attributes
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Store in both results and cache
        loadedImages[index] = img;
        imageCache.set(url, img);
        loadedCount++;

        if (loadedCount === totalImages) {
          resolve({ loadedImages, failedUrls });
        }
      };

      img.onerror = () => {
        failedUrls.push(url);
        loadedCount++;

        if (loadedCount === totalImages) {
          resolve({ loadedImages, failedUrls });
        }
      };

      img.src = url;
    });
  });
};

export const useImagePreloader = (imageUrls: string[]) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadedImages, setLoadedImages] = React.useState<HTMLImageElement[]>(
    []
  );
  const [failedUrls, setFailedUrls] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);

  // Memoize the URLs array to prevent infinite loops
  const memoizedUrls = React.useMemo(
    () => imageUrls,
    [imageUrls]
  );

  React.useEffect(() => {
    if (memoizedUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    // Check if all images are already cached
    const allCached = memoizedUrls.every((url) => imageCache.has(url));

    if (allCached) {
      const cachedImages = memoizedUrls.map((url) => imageCache.get(url)!);
      setLoadedImages(cachedImages);
      setProgress(100);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setLoadedImages([]);
    setFailedUrls([]);

    let loadedCount = 0;
    const totalImages = memoizedUrls.length;
    const images: HTMLImageElement[] = new Array(totalImages);
    const failed: string[] = [];

    const updateProgress = () => {
      setProgress((loadedCount / totalImages) * 100);
    };

    const checkCompletion = () => {
      if (loadedCount === totalImages) {
        setLoadedImages([...images]);
        setFailedUrls([...failed]);
        setIsLoading(false);
      }
    };

    memoizedUrls.forEach((url, index) => {
      // Check memory cache first
      if (imageCache.has(url)) {
        images[index] = imageCache.get(url)!;
        loadedCount++;
        updateProgress();
        checkCompletion();
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        images[index] = img;
        imageCache.set(url, img); // Cache in memory
        loadedCount++;
        updateProgress();
        checkCompletion();
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${url}`);
        failed.push(url);
        loadedCount++;
        updateProgress();
        checkCompletion();
      };

      img.src = url;
    });

    return () => {
      // Cleanup if needed
    };
  }, [memoizedUrls]);

  return { isLoading, loadedImages, failedUrls, progress };
};

// Export function to clear cache if needed
export const clearImageCache = () => {
  imageCache.clear();
};

// Export function to check cache size
export const getImageCacheSize = () => {
  return imageCache.size;
};
