/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePanoramaContext } from "@/context/PanoramaContext";
import {
  ProgressRing,
  useHotspotManager,
  useKrpanoScript,
  useLoadingProgressManager,
  useMenuImagePreloader
} from "./KrpanoViewer";

declare global {
  interface Window {
    _krpanoOpenMenu?: (type: "sink" | "bathtub" | "floor") => void;

    __kr_onnewpano?: () => void;
    __kr_onviewloaded?: () => void;
    __kr_onloadcomplete?: () => void;
    __kr_onblendstart?: () => void;
    __kr_onblendcomplete?: () => void;
    __kr_onloaderror?: () => void;

    __krpanoRewireTypeHotspots?: () => void;
  }
}

type Props = {
  xmlUrl: string;
  viewerScriptUrl?: string;
  containerId?: string;
  /** e.g. "MERGE|PRELOAD|KEEPVIEW" */
  loadsceneFlags?: string;
};

/**
 * Scene cache data structure
 */
interface SceneCacheData {
  sceneId: string;
  xmlUrl: string;
  loadedAt: number;
  loadTime: number;
  success: boolean;
  viewState?: {
    hlookat: number;
    vlookat: number;
    fov: number;
  };
}

/**
 * Scene loading function for React Query
 * This doesn't actually load the scene, but tracks loading attempts
 */
const loadSceneData = async (
  sceneId: string,
  xmlUrl: string,
  krpanoRef: React.RefObject<any>,
  loadsceneFlags: string
): Promise<SceneCacheData> => {
  return new Promise((resolve, reject) => {
    if (!krpanoRef.current?.call) {
      reject(new Error("Krpano not ready"));
      return;
    }

    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      reject(new Error(`Scene load timeout: ${sceneId}`));
    }, 30000); // 30 second timeout

    // Create unique callback names to avoid conflicts
    const callbackId = `${sceneId}_${Date.now()}`;
    const successCallback = `__scene_success_${callbackId}`;
    const errorCallback = `__scene_error_${callbackId}`;

    // Success handler
    (window as any)[successCallback] = () => {
      clearTimeout(timeoutId);
      const loadTime = Date.now() - startTime;

      try {
        // Capture current view state
        const viewState = {
          hlookat: parseFloat(krpanoRef.current?.get("view.hlookat") || "0"),
          vlookat: parseFloat(krpanoRef.current?.get("view.vlookat") || "0"),
          fov: parseFloat(krpanoRef.current?.get("view.fov") || "90")
        };

        const cacheData: SceneCacheData = {
          sceneId,
          xmlUrl,
          loadedAt: Date.now(),
          loadTime,
          success: true,
          viewState
        };

        // Cleanup callbacks
        delete (window as any)[successCallback];
        delete (window as any)[errorCallback];

        console.log(`✅ Scene cached: ${sceneId} (${loadTime}ms)`);
        resolve(cacheData);
      } catch (error) {
        delete (window as any)[successCallback];
        delete (window as any)[errorCallback];
        reject(error);
      }
    };

    // Error handler
    (window as any)[errorCallback] = () => {
      clearTimeout(timeoutId);
      delete (window as any)[successCallback];
      delete (window as any)[errorCallback];
      reject(new Error(`Scene load failed: ${sceneId}`));
    };

    try {
      // Load scene with success/error callbacks
      const flags = loadsceneFlags.replace(/\s+/g, "");
      krpanoRef.current.call(
        `loadscene(${sceneId}, null, ${flags}, SLIDEBLEND(0.5, 0, 0.75, linear), js(${successCallback}()), js(${errorCallback}()))`
      );
    } catch (error) {
      clearTimeout(timeoutId);
      delete (window as any)[successCallback];
      delete (window as any)[errorCallback];
      reject(error);
    }
  });
};

/**
 * Hook for scene caching with React Query
 */
const useSceneCache = (
  sceneId: string | null | undefined,
  xmlUrl: string,
  loadsceneFlags: string,
  krpanoRef: React.RefObject<any>
) => {
  const queryClient = useQueryClient();

  // Main scene query - DISABLED because we handle loading manually
  const sceneQuery = useQuery({
    queryKey: ["krpano-scene", sceneId, xmlUrl],
    queryFn: () => loadSceneData(sceneId!, xmlUrl, krpanoRef, loadsceneFlags),
    enabled: false, // Disable automatic query execution
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 1,
    retryDelay: 2000
  });

  // Utility functions
  const isSceneCached = (targetSceneId: string): boolean => {
    const cachedData = queryClient.getQueryData<SceneCacheData>([
      "krpano-scene",
      targetSceneId,
      xmlUrl
    ]);
    return cachedData?.success ?? false;
  };

  const getCachedScene = (
    targetSceneId: string
  ): SceneCacheData | undefined => {
    return queryClient.getQueryData(["krpano-scene", targetSceneId, xmlUrl]);
  };

  // Manual cache setter
  const setCacheData = (targetSceneId: string, data: SceneCacheData) => {
    queryClient.setQueryData(["krpano-scene", targetSceneId, xmlUrl], data);
  };

  const invalidateScene = (targetSceneId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["krpano-scene", targetSceneId, xmlUrl]
    });
  };

  const getCacheStats = () => {
    const allQueries = queryClient.getQueriesData<SceneCacheData>({
      queryKey: ["krpano-scene"]
    });

    // Use the key to extract scene information and provide more detailed stats
    const scenes = allQueries
      .map(([key, data]) => {
        // Extract sceneId from the query key: ["krpano-scene", sceneId, xmlUrl]
        const sceneIdFromKey = key[1] as string;
        const xmlUrlFromKey = key[2] as string;

        return {
          sceneId: data?.sceneId || sceneIdFromKey, // Fallback to key if data is missing
          xmlUrl: data?.xmlUrl || xmlUrlFromKey,
          success: data?.success ?? false,
          loadTime: data?.loadTime ?? 0,
          loadedAt: data?.loadedAt ?? 0,
          queryKey: key, // Include the full query key for debugging
          hasData: !!data // Track if we have actual data or just the key
        };
      })
      .filter((scene) => scene.sceneId);

    // Group scenes by XML URL for better organization
    const scenesByXml = scenes.reduce(
      (acc, scene) => {
        if (!acc[scene.xmlUrl]) {
          acc[scene.xmlUrl] = [];
        }
        acc[scene.xmlUrl].push(scene);
        return acc;
      },
      {} as Record<string, typeof scenes>
    );

    // Calculate additional statistics
    const avgLoadTime =
      scenes.length > 0
        ? scenes.reduce((sum, s) => sum + s.loadTime, 0) / scenes.length
        : 0;

    const recentScenes = scenes
      .filter((s) => s.loadedAt > 0)
      .sort((a, b) => b.loadedAt - a.loadedAt)
      .slice(0, 5); // Last 5 loaded scenes

    return {
      total: scenes.length,
      successful: scenes.filter((s) => s.success).length,
      failed: scenes.filter((s) => !s.success).length,
      withoutData: scenes.filter((s) => !s.hasData).length, // Queries without data
      avgLoadTime: Math.round(avgLoadTime),
      scenesByXml,
      recentScenes: recentScenes.map((s) => ({
        sceneId: s.sceneId,
        loadTime: s.loadTime,
        loadedAt: new Date(s.loadedAt).toLocaleTimeString()
      })),
      scenes
    };
  };

  // New utility function to get scenes for a specific XML URL
  const getScenesForXml = (targetXmlUrl: string) => {
    const allQueries = queryClient.getQueriesData<SceneCacheData>({
      queryKey: ["krpano-scene"]
    });

    return allQueries
      .filter(([key, _]) => key[2] === targetXmlUrl) // Use key to filter by XML URL
      .map(([key, data]) => ({
        sceneId: key[1] as string,
        data,
        isCached: !!data?.success
      }));
  };

  // New utility function to clear all scenes for a specific XML URL
  const clearScenesForXml = (targetXmlUrl: string) => {
    queryClient.removeQueries({
      queryKey: ["krpano-scene"],
      predicate: (query) => {
        // Use the query key to match XML URL
        return query.queryKey[2] === targetXmlUrl;
      }
    });
    console.log(`🗑️ Cleared all scenes for XML: ${targetXmlUrl}`);
  };

  return {
    sceneQuery,
    isSceneCached,
    getCachedScene,
    setCacheData, // Add this
    invalidateScene,
    getCacheStats,
    getScenesForXml,
    clearScenesForXml,
    isLoading: false, // Always false since query is disabled
    error: sceneQuery.error,
    data: sceneQuery.data
  };
};

export function KrpanoViewer({
  xmlUrl,
  viewerScriptUrl,
  containerId = "krpano-container",
  loadsceneFlags = "MERGE|PRELOAD|KEEPVIEW"
}: Props) {
  const { currentSceneId } = usePanoramaContext();
  const krpanoRef = useRef<any | null>(null);
  const isInitialLoadRef = useRef(true);
  const sceneLoadStartRef = useRef<number>(0);
  const queryClient = useQueryClient(); // Move this to component level

  console.log(currentSceneId);

  // Initialize scene caching - currentSceneId can be null, which is handled by the enabled condition
  const sceneCache = useSceneCache(
    currentSceneId,
    xmlUrl,
    loadsceneFlags,
    krpanoRef
  );

  // Initialize loading progress manager
  const [progressState, progressActions] = useLoadingProgressManager(krpanoRef);

  // Initialize menu image preloader
  const menuImagePreloader = useMenuImagePreloader(() => {
    progressActions.setMenuImagesLoaded(true);
  });

  // Initialize hotspot manager
  const hotspotManager = useHotspotManager(krpanoRef);

  // Initialize krpano script
  const krpanoScript = useKrpanoScript({
    xmlUrl,
    viewerScriptUrl,
    containerId,
    onReady: (krpano: any) => {
      krpanoRef.current = krpano;
      setupKrpanoEvents();
      hotspotManager.setupHotspots();

      // Start loader for initial load
      if (isInitialLoadRef.current) {
        progressActions.startLoader();
        menuImagePreloader.startPreloading();
        // DON'T set isInitialLoadRef.current = false here
        // Set it after first scene completes loading
      }
    }
  });

  const setupKrpanoEvents = () => {
    if (!krpanoRef.current) return;

    const krpano = krpanoRef.current;
    // Remove the useQueryClient call from here

    // Enhanced lifecycle handlers with caching awareness
    window.__kr_onnewpano = () => {
      sceneLoadStartRef.current = Date.now();

      // Check if scene is cached - add null check
      const isCached =
        currentSceneId && sceneCache.isSceneCached(currentSceneId);

      if (isCached && currentSceneId) {
        console.log(`📦 Loading cached scene: ${currentSceneId}`);
        const cachedScene = sceneCache.getCachedScene(currentSceneId);

        // For cached scenes: accelerated progress and instant view state restoration
        progressActions.startLoader();

        // Instantly restore cached view state (no delay)
        if (cachedScene?.viewState) {
          krpano.call(`view.hlookat = ${cachedScene.viewState.hlookat}`);
          krpano.call(`view.vlookat = ${cachedScene.viewState.vlookat}`);
          krpano.call(`view.fov = ${cachedScene.viewState.fov}`);
        }

        // Accelerate progress for cached scenes
        setTimeout(() => {
          progressActions.setTilesLoaded(true);
        }, 50); // Very fast for cached content

        setTimeout(() => {
          progressActions.setBlended(true); // Complete loading quickly
        }, 150); // Minimal delay for smooth animation
      } else if (currentSceneId) {
        console.log(`🔄 Loading new scene: ${currentSceneId}`);
        // Normal loading flow for uncached scenes
        progressActions.startLoader();
        progressActions.setTilesLoaded(false);
      }

      // Only reset and start preloading menu images for scene changes, not initial load
      if (!isInitialLoadRef.current) {
        menuImagePreloader.resetPreloaded();
        menuImagePreloader.startPreloading();
      }
    };

    window.__kr_onviewloaded = () => {
      // Only update progress if scene is not cached (to avoid overriding fast cache loading)
      if (!currentSceneId || !sceneCache.isSceneCached(currentSceneId)) {
        progressActions.setTilesLoaded(true);
      }
    };

    window.__kr_onloadcomplete = () => {
      // Only update progress if scene is not cached
      if (!currentSceneId || !sceneCache.isSceneCached(currentSceneId)) {
        progressActions.setTilesLoaded(true);
      }
    };

    window.__kr_onblendstart = () => {
      // Only update progress if scene is not cached
      if (!currentSceneId || !sceneCache.isSceneCached(currentSceneId)) {
        progressActions.setBlended(false);
      }
    };

    window.__kr_onblendcomplete = () => {
      // Always complete, but cached scenes already completed earlier
      progressActions.setBlended(true);

      // Cache ALL scenes, including the initial one
      if (currentSceneId && !sceneCache.isSceneCached(currentSceneId)) {
        const loadTime = Date.now() - sceneLoadStartRef.current;

        const viewState = {
          hlookat: parseFloat(krpano.get("view.hlookat") || "0"),
          vlookat: parseFloat(krpano.get("view.vlookat") || "0"),
          fov: parseFloat(krpano.get("view.fov") || "90")
        };

        const cacheData: SceneCacheData = {
          sceneId: currentSceneId,
          xmlUrl,
          loadedAt: Date.now(),
          loadTime,
          success: true,
          viewState
        };

        sceneCache.setCacheData(currentSceneId, cacheData);

        console.log(
          `✅ Scene cached: ${currentSceneId} (${loadTime}ms) - ${isInitialLoadRef.current ? "Initial" : "Subsequent"} load`
        );
      }

      // Mark initial load as complete AFTER caching
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    };

    window.__kr_onloaderror = () => {
      progressActions.handleLoadError();

      // Invalidate cache for failed scene - add null check
      if (currentSceneId) {
        sceneCache.invalidateScene(currentSceneId);
      }
    };

    // Register event handlers with krpano
    krpano.call(
      `events.add(onnewscene, js(window.__krpanoRewireTypeHotspots && window.__krpanoRewireTypeHotspots()));`
    );
    krpano.call(
      `events.add(onnewpano, js(window.__kr_onnewpano && window.__kr_onnewpano()));`
    );
    krpano.call(
      `events.add(onviewloaded, js(window.__kr_onviewloaded && window.__kr_onviewloaded()));`
    );
    krpano.call(
      `events.add(onloadcomplete, js(window.__kr_onloadcomplete && window.__kr_onloadcomplete()));`
    );
    krpano.call(
      `events.add(onblendstart, js(window.__kr_onblendstart && window.__kr_onblendstart()));`
    );
    krpano.call(
      `events.add(onblendcomplete, js(window.__kr_onblendcomplete && window.__kr_onblendcomplete()));`
    );
    krpano.call(
      `events.add(onloaderror, js(window.__kr_onloaderror && window.__kr_onloaderror()));`
    );
  };

  const cleanupGlobalHandlers = () => {
    try {
      delete window.__kr_onnewpano;
      delete window.__kr_onviewloaded;
      delete window.__kr_onloadcomplete;
      delete window.__kr_onblendstart;
      delete window.__kr_onblendcomplete;
      delete window.__kr_onloaderror;
      delete window.__krpanoRewireTypeHotspots;
    } catch {}
  };

  // Initialize krpano on mount
  useEffect(() => {
    let destroyed = false;

    const initializeKrpano = async () => {
      if (destroyed) return;

      // Start loader immediately for first scene
      progressActions.startLoader();

      await krpanoScript.initialize();
    };

    initializeKrpano();

    return () => {
      destroyed = true;
      hotspotManager.cleanup();
      krpanoScript.cleanup();
      cleanupGlobalHandlers();
    };
  }, [xmlUrl, viewerScriptUrl, containerId]);

  // Handle scene changes with caching
  useEffect(() => {
    if (currentSceneId && krpanoRef.current?.call) {
      const flags = (loadsceneFlags || "MERGE|PRELOAD|KEEPVIEW").replace(
        /\s+/g,
        ""
      );

      // Check cache status
      const isCached = sceneCache.isSceneCached(currentSceneId);
      const cachedScene = sceneCache.getCachedScene(currentSceneId);

      if (isCached && cachedScene) {
        console.log(
          `📦 Using cached scene: ${currentSceneId} (previously loaded in ${cachedScene.loadTime}ms)`
        );
      } else {
        console.log(`🔄 Loading uncached scene: ${currentSceneId}`);
      }

      // proactively start loader; events will confirm exact finish time
      progressActions.startLoader();

      // Only reset and start preloading for scene changes, not initial load
      if (!isInitialLoadRef.current && !menuImagePreloader.isPreloaded()) {
        menuImagePreloader.resetPreloaded();
        menuImagePreloader.startPreloading();
      }

      // Load scene - React Query will handle the caching
      krpanoRef.current.call(
        `loadscene(${currentSceneId}, null, ${flags}, SLIDEBLEND(0.5, 0, 0.75, linear))`
      );
      console.log("[krpano] loaded scene with flags:", currentSceneId, flags);
    }
  }, [currentSceneId, loadsceneFlags]);

  // Debug: Log cache stats (remove in production)
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = sceneCache.getCacheStats();
      if (stats.total > 0) {
        console.log(`📊 Scene Cache Stats:`, {
          total: stats.total,
          successful: stats.successful,
          failed: stats.failed,
          withoutData: stats.withoutData,
          avgLoadTime: `${stats.avgLoadTime}ms`,
          xmlUrls: Object.keys(stats.scenesByXml),
          recentScenes: stats.recentScenes,
          // Show scenes grouped by XML URL
          breakdown: Object.entries(stats.scenesByXml).map(
            ([xmlUrl, scenes]) => ({
              xmlUrl: xmlUrl.split("/").pop(), // Show just filename for brevity
              sceneCount: scenes.length,
              successfulScenes: scenes.filter((s) => s.success).length
            })
          )
        });

        // Also log scenes for current XML URL
        const currentXmlScenes = sceneCache.getScenesForXml(xmlUrl);
        if (currentXmlScenes.length > 0) {
          console.log(
            `📋 Current XML scenes:`,
            currentXmlScenes.map(
              (s) => `${s.sceneId} (${s.isCached ? "cached" : "not cached"})`
            )
          );
        }
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [xmlUrl]);

  return (
    <div
      id={containerId}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      {(progressState.loading || sceneCache.isLoading) && (
        <div className="absolute inset-0 grid place-items-center bg-black/15 z-[10000] pointer-events-none">
          <ProgressRing percent={progressState.percent} />
        </div>
      )}
    </div>
  );
}
