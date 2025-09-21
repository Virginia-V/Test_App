"use client";

import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import type { ViewerConfig } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import type { MarkersPluginConfig } from "@photo-sphere-viewer/markers-plugin";
import type {
  EquirectangularTilesPanorama,
  EquirectangularTilesAdapter as TilesAdapterType
} from "@photo-sphere-viewer/equirectangular-tiles-adapter";

import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

function isWebGLSupported(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/** Safely extract the adapter class from a dynamic import (no `any`) */
function pickTilesAdapter(mod: unknown): typeof TilesAdapterType {
  if (typeof mod === "object" && mod !== null) {
    const rec = mod as Record<string, unknown>;
    const named = rec["EquirectangularTilesAdapter"];
    if (typeof named === "function") return named as typeof TilesAdapterType;
    const def = rec["default"];
    if (typeof def === "function") return def as typeof TilesAdapterType;
  }
  throw new Error("Tiles adapter import resolved to undefined.");
}

/** Minimal shape of the internal Three.js renderer we need */
type ThreeRendererLike = { setPixelRatio: (v: number) => void };
type ViewerWithThree = { renderer?: { renderer?: ThreeRendererLike } };

/** Type-safe getter for the internal Three renderer */
function getThreeRenderer(viewer: Viewer): ThreeRendererLike | null {
  const maybe = (viewer as unknown as ViewerWithThree).renderer?.renderer;
  return typeof maybe?.setPixelRatio === "function" ? maybe : null;
}

/** Compute a target pixel ratio for light supersampling based on screen size */
function computeSupersamplePR(): number {
  const dpr = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width * dpr;
  const screenHeight = window.screen.height * dpr;
  const screenArea = screenWidth * screenHeight;
  
  // Base multiplier for supersampling
  let multiplier = 2;
  
  // Adjust multiplier based on screen size
  if (screenArea > 8294400) { // 4K+ screens (3840x2160)
    multiplier = 3; // Higher quality for large screens
  } else if (screenArea > 2073600) { // 1440p+ screens (2560x1440)
    multiplier = 2.5;
  } else if (screenArea > 921600) { // 1080p+ screens (1920x1080)
    multiplier = 2;
  } else {
    multiplier = 1.5; // Lower multiplier for smaller screens
  }
  
  // Calculate target pixel ratio
  const targetRatio = dpr * multiplier;
  
  // Cap based on device capabilities to avoid performance issues
  // Higher cap for powerful devices (assumed if high DPR)
  const maxRatio = dpr >= 2 ? 8 : 6;
  
  return Math.min(targetRatio, maxRatio);
}

type Props = {
  tilesBasePath?: string; // "/tiles"
  tileExt?: "png" | "webp" | "jpg";
  yaw?: number;
  pitch?: number;
  height?: number | string;
  fisheye?: number; // 0..2 (0 = off)
  tileSize?: number; // tile size in pixels (default: 1024)
};

export default function PanoramaViewer({
  tilesBasePath = "/tiles_wood",
  tileExt = "png",
  yaw = 0,
  pitch = 0,
  height = "100dvh",
  fisheye = 0,
  tileSize = 1024
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setLoading(true);
    setError(null);

    if (!isWebGLSupported()) {
      setError("WebGL not supported/enabled.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const mod = await import(
          "@photo-sphere-viewer/equirectangular-tiles-adapter"
        );
        const TilesAdapter = pickTilesAdapter(mod);

        // Single-level high-resolution configuration optimized for quality
        const pano: EquirectangularTilesPanorama = {
          width: 16384, // 16K width for high detail
          cols: 16, // 16 columns
          rows: 8,  // 8 rows
          tileUrl: (col: number, row: number) =>
            `${tilesBasePath}/row-${row + 1}-column-${col + 1}.${tileExt}`
        };

        const config: ViewerConfig = {
          container: el,
          adapter: [
            TilesAdapter as unknown as typeof TilesAdapterType,
            {
              // Adapter configuration for better quality
              antialias: true, // Smoother tile transitions
              baseBlur: false, // Disable blur for sharper base level
              showErrorTile: true // Show error tiles for debugging
            }
          ],
          panorama: pano,

          // Optimized settings for reduced distortion
          defaultZoomLvl: 40, // Start zoomed in to reduce center distortion
          fisheye, // 0 = no fisheye effect for less distortion

          rendererParameters: {
            antialias: true, // Smoother edges
            precision: "highp", // Better shader precision for quality
            alpha: true,
            preserveDrawingBuffer: false,
            depth: false,
            stencil: false, // Disable stencil for better performance
            powerPreference: "high-performance",
            premultipliedAlpha: true,
            failIfMajorPerformanceCaveat: false
          },

          // Constrain FOV to reduce distortions - key for center quality
          minFov: 35, // Prevent too much zoom-out (reduces center stretching)
          maxFov: 75, // Reasonable max zoom to maintain quality
          
          // Enable smooth transitions
          loadingTxt: "Loading panorama...",
          
          navbar: ["zoom", "move", "fullscreen"],
          plugins: [[MarkersPlugin, { markers: [] } as MarkersPluginConfig]]
        };

        const viewer = new Viewer(config);
        viewerRef.current = viewer;

        // --- Light supersampling (set pixel ratio above DPR) ---
        const applySupersampling = () => {
          const three = getThreeRenderer(viewer);
          if (three) {
            three.setPixelRatio(computeSupersamplePR());
          }
        };

        // Apply ASAP and also after 'ready' (in case renderer is late)
        applySupersampling();
        viewer.addEventListener("ready", () => {
          applySupersampling();
          if (yaw || pitch) viewer.rotate({ yaw, pitch });
          setLoading(false);
        });

        // Keep it sharp on resize/orientation changes
        const onResize = () => applySupersampling();
        window.addEventListener("resize", onResize);

        viewer.addEventListener("panorama-error", (e: unknown) => {
          console.error("panorama-error", e);
          setError("Failed to load panorama tiles. Check filenames/paths/case.");
          setLoading(false);
        });

        // cleanup
        return () => {
          window.removeEventListener("resize", onResize);
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);

        console.error("Init error:", msg);
        setError(msg || "Failed to initialize the panorama viewer.");
        setLoading(false);
      }
    })();

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [tilesBasePath, tileExt, yaw, pitch, fisheye, tileSize]);

  return (
    <div
      style={{
        width: "100%",
        height,
        position: "relative",
        background: "#000",
        overflow: "hidden"
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {loading && !error && <div style={overlayStyle}>Loading panorama…</div>}
      {error && (
        <div style={{ ...overlayStyle, color: "#ff3b30" }}>{error}</div>
      )}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "#aaa",
  fontSize: 16
};
