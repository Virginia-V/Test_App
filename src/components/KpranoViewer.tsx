/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
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

export function KrpanoViewer({
  xmlUrl,
  viewerScriptUrl,
  containerId = "krpano-container",
  loadsceneFlags = "MERGE|PRELOAD|KEEPVIEW"
}: Props) {
  const { currentSceneId } = usePanoramaContext();
  const krpanoRef = useRef<any | null>(null);

  console.log(currentSceneId);

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
    }
  });

  const setupKrpanoEvents = () => {
    if (!krpanoRef.current) return;

    const krpano = krpanoRef.current;

    // lifecycle handlers — ONLY pano readiness + blend
    window.__kr_onnewpano = () => {
      progressActions.startLoader();
      progressActions.setTilesLoaded(false);
      // Reset and start preloading menu images
      menuImagePreloader.resetPreloaded();
      menuImagePreloader.startPreloading();
    };

    window.__kr_onviewloaded = () => {
      progressActions.setTilesLoaded(true);
    };

    window.__kr_onloadcomplete = () => {
      progressActions.setTilesLoaded(true);
    };

    window.__kr_onblendstart = () => {
      progressActions.setBlended(false);
    };

    window.__kr_onblendcomplete = () => {
      progressActions.setBlended(true);
    };

    window.__kr_onloaderror = () => {
      progressActions.handleLoadError();
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

  // Handle scene changes
  useEffect(() => {
    if (currentSceneId && krpanoRef.current?.call) {
      const flags = (loadsceneFlags || "MERGE|PRELOAD|KEEPVIEW").replace(
        /\s+/g,
        ""
      );
      // proactively start loader; events will confirm exact finish time
      progressActions.startLoader();
      // Reset and start preloading menu images for new scene
      menuImagePreloader.resetPreloaded();
      menuImagePreloader.startPreloading();

      krpanoRef.current.call(
        `loadscene(${currentSceneId}, null, ${flags}, SLIDEBLEND(0.5, 0, 0.75, linear))`
      );
      console.log("[krpano] loaded scene with flags:", currentSceneId, flags);
    }
  }, [currentSceneId, loadsceneFlags]);

  return (
    <div
      id={containerId}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      {progressState.loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.15)",
            zIndex: 10000,
            pointerEvents: "none"
          }}
        >
          <ProgressRing percent={progressState.percent} />
        </div>
      )}
    </div>
  );
}
