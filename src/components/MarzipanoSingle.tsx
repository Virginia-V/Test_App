"use client";

import { useEffect, useRef } from "react";

/** Minimal type surface for Marzipano we actually use */
type MarzipanoSource = unknown;
type MarzipanoGeometry = unknown;
interface MarzipanoView {
  screenToCoordinates(p: { x: number; y: number }): {
    yaw: number;
    pitch: number;
  };
}
interface HotspotContainer {
  createHotspot(el: HTMLElement, coords: { yaw: number; pitch: number }): void;
}
interface MarzipanoScene {
  switchTo(): void;
  hotspotContainer(): HotspotContainer;
}
interface MarzipanoViewer {
  createScene(o: {
    source: MarzipanoSource;
    geometry: MarzipanoGeometry;
    view: MarzipanoView;
  }): MarzipanoScene;
}
interface MarzipanoModule {
  Viewer: new (
    el: HTMLElement,
    opts?: Record<string, unknown>
  ) => MarzipanoViewer;
  ImageUrlSource: { fromString(url: string): MarzipanoSource };
  EquirectGeometry: new (levels: { width: number }[]) => MarzipanoGeometry;
  RectilinearView: {
    new (
      params?: { yaw?: number; pitch?: number; fov?: number },
      limiter?: unknown
    ): MarzipanoView;
    limit: { traditional: (resLimiter: number, maxFovRad: number) => unknown };
  };
}

export default function MarzipanoSingle({
  src = "/test-pano-wood.png",
  approximateWidth = 16384, // put your real image width here
  height = 480
}: {
  src?: string;
  approximateWidth?: number;
  height?: number | string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    let viewer: MarzipanoViewer | null = null;

    (async () => {
      const mod = (await import("marzipano")) as unknown as MarzipanoModule;
      const container = ref.current!;
      viewer = new mod.Viewer(container);

      // Single-image equirect setup
      const source = mod.ImageUrlSource.fromString(src);
      const geometry = new mod.EquirectGeometry([{ width: approximateWidth }]);
      const limiter = mod.RectilinearView.limit.traditional(
        2048,
        (120 * Math.PI) / 180
      );
      const view = new mod.RectilinearView(
        { yaw: 0, pitch: 0, fov: Math.PI / 2 },
        limiter
      );

      const scene = viewer.createScene({ source, geometry, view });
      scene.switchTo();

      // Example: DOM hotspot at center
      const el = document.createElement("div");
      el.textContent = "Hotspot";
      el.style.cssText =
        "padding:6px 10px;background:#0008;color:#fff;border-radius:8px;";
      scene.hotspotContainer().createHotspot(el, { yaw: 0, pitch: 0 });

      // Click → log yaw/pitch (radians)
      const onClick = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const coords = view.screenToCoordinates(pos);
        // Convert to degrees if you want:
        const toDeg = (r: number) => (r * 180) / Math.PI;
        console.log("Marzipano click →", {
          yawDeg: toDeg(coords.yaw).toFixed(2),
          pitchDeg: toDeg(coords.pitch).toFixed(2)
        });
      };
      container.addEventListener("click", onClick);

      // GPU texture limit warning (16K may be too big on many devices)
      try {
        const canvas = document.createElement("canvas");
        const gl =
          (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
          (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
          null;
        if (gl) {
          const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
          if (maxTex < approximateWidth) {
            console.warn(
              `[Marzipano] MAX_TEXTURE_SIZE=${maxTex} < image width (${approximateWidth}). ` +
                `Expect downscale/blur or failure on this device. Prefer multi-resolution tiles.`
            );
          }
        }
      } catch {
        /* ignore */
      }

      // Cleanup
      return () => {
        container.removeEventListener("click", onClick);
      };
    })();

    return () => {
      // nothing else to dispose; marzipano cleans up scenes when container is removed
    };
  }, [src, approximateWidth]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
