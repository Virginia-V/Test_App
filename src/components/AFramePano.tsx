"use client";

import { useEffect, useRef } from "react";

// Minimal typing for entities that expose three.js object3D
interface AFrameObject3DEntity extends HTMLElement {
  object3D: {
    rotation: {
      x: number; // pitch (deg in A-Frame's Euler toAttribute, but object3D stores radians)
      y: number; // yaw
      z: number; // roll
    };
  };
}

export default function AFramePano({
  src = "/test-pano-wood.png",
  height = "100dvh",
}: {
  src?: string;
  height?: number | string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Import A-Frame on the client; we don't need the module value here
      await import("aframe");
      if (!mounted || !containerRef.current) return;

      // Scene
      const scene = document.createElement("a-scene");
      scene.setAttribute("embedded", "");
      scene.setAttribute("vr-mode-ui", "enabled: true");
      scene.setAttribute(
        "renderer",
        [
          "antialias: true",
          "alpha: false",
          "colorManagement: true",
          "physicallyCorrectLights: true",
          "powerPreference: high-performance",
          "precision: highp"
        ].join("; ")
      );

      // Assets
      const assets = document.createElement("a-assets");
      const img = document.createElement("img");
      img.setAttribute("id", "pano");
      img.setAttribute("src", src);
      img.setAttribute("crossorigin", "anonymous");
      assets.appendChild(img);
      scene.appendChild(assets);

      // Sky
      const sky = document.createElement("a-sky");
      sky.setAttribute("src", "#pano");
      scene.appendChild(sky);

      // Camera (typed through object3D)
      const camera = document.createElement("a-entity") as AFrameObject3DEntity;
      camera.setAttribute("camera", "fov: 75");
      camera.setAttribute(
        "look-controls",
        "enabled: true; touchEnabled: true; magicWindowTrackingEnabled: true; pointerLockEnabled: false"
      );
      scene.appendChild(camera);

      // Mount
      containerRef.current.appendChild(scene);
      sceneRef.current = scene;

      // Click → log yaw/pitch (converted to degrees from radians)
      const onClick = () => {
        const { x, y } = (camera as AFrameObject3DEntity).object3D.rotation; // radians
        const toDeg = (r: number) => (r * 180) / Math.PI;
        console.log(
          "A-Frame click → yaw°:",
          toDeg(y).toFixed(2),
          "pitch°:",
          toDeg(x).toFixed(2)
        );
      };
      scene.addEventListener("click", onClick);

      // GPU max texture size check
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl2") ??
          canvas.getContext("webgl") ??
          (canvas.getContext(
            "experimental-webgl"
          ) as WebGLRenderingContext | null);
        if (gl) {
          const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          if (typeof maxTex === "number" && maxTex < 16384) {
            console.warn(
              `[A-Frame] MAX_TEXTURE_SIZE is ${maxTex}. A 16384-wide texture may downscale or fail on this device. ` +
                `Consider using a cubemap or multi-resolution tiling for best quality.`
            );
          }
        }
      } catch {
        /* ignore */
      }

      return () => {
        scene.removeEventListener("click", onClick);
      };
    })();

    return () => {
      mounted = false;
      if (sceneRef.current && sceneRef.current.parentNode) {
        sceneRef.current.parentNode.removeChild(sceneRef.current);
      }
    };
  }, [src]);

  return <div ref={containerRef} style={{ width: "100%", height }} />;
}
