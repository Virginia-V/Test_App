// "use client";

// import { useEffect, useRef } from "react";
// import { Viewer } from "@photo-sphere-viewer/core";
// import { CubemapAdapter } from "@photo-sphere-viewer/cubemap-adapter";
// import "@photo-sphere-viewer/core/index.css";

// export default function CubePano() {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const viewer = new Viewer({
//       container: containerRef.current,
//       adapter: CubemapAdapter,
//       panorama: {
//         left: "/panos/test-pano-wood/test-pano-wood_r.jpg",
//         front: "/panos/test-pano-wood/test-pano-wood_b.jpg",
//         right: "/panos/test-pano-wood/test-pano-wood_l.jpg",
//         back: "/panos/test-pano-wood/test-pano-wood_f.jpg",
//         top: "/panos/test-pano-wood/test-pano-wood_u.jpg",
//         bottom: "/panos/test-pano-wood/test-pano-wood_d.jpg"
//       },
//       navbar: ["zoom", "move", "fullscreen"],

//       moveInertia: true,
//       minFov: 20,
//       maxFov: 100,
//       zoomSpeed: 0.2,
//       moveSpeed: 1.0,
//       defaultZoomLvl: 50
//     });

//     return () => {
//       viewer.destroy();
//     };
//   }, []);

//   return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
// }

"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { CubemapAdapter } from "@photo-sphere-viewer/cubemap-adapter";
import type {
  WebGLRenderer,
  Scene,
  Object3D,
  Mesh,
  Material,
  Texture
} from "three";
import "@photo-sphere-viewer/core/index.css";

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

/** Hidden internals exposed by PSV's renderer wrapper */
type RendererExtras = {
  renderer: WebGLRenderer; // three.js WebGLRenderer
  scene: Scene; // three.js Scene used by PSV
};

function getRendererExtras(v: Viewer): RendererExtras {
  // `viewer.renderer` exists; we assert it also carries the hidden fields.
  const wrapper = v.renderer as unknown as RendererExtras;
  return wrapper;
}

function isMesh(obj: Object3D): obj is Mesh {
  return (obj as Mesh).isMesh === true;
}

type WithMaps = { map?: Texture; envMap?: Texture };

function setAnisotropyOnMaterial(mat: Material, anisotropy: number) {
  const m = mat as Material & WithMaps;
  if (m.map) {
    m.map.anisotropy = anisotropy;
    m.map.needsUpdate = true;
  }
  if (m.envMap) {
    m.envMap.anisotropy = anisotropy;
    m.needsUpdate = true;
  }
}

function setAnisotropy(
  matOrArray: Material | Material[] | undefined,
  anisotropy: number
) {
  if (!matOrArray) return;
  if (Array.isArray(matOrArray)) {
    matOrArray.forEach((m) => setAnisotropyOnMaterial(m, anisotropy));
  } else {
    setAnisotropyOnMaterial(matOrArray, anisotropy);
  }
}

export default function CubePano() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      adapter: CubemapAdapter,
      panorama: {
        left: "/panos/test-pano-wood/test-pano-wood_r.jpg",
        front: "/panos/test-pano-wood/test-pano-wood_b.jpg", // swapped
        right: "/panos/test-pano-wood/test-pano-wood_l.jpg",
        back: "/panos/test-pano-wood/test-pano-wood_f.jpg", // swapped
        top: "/panos/test-pano-wood/test-pano-wood_u.jpg",
        bottom: "/panos/test-pano-wood/test-pano-wood_d.jpg"
      },
      rendererParameters: {
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        precision: "highp"
      },
      navbar: ["zoom", "move", "fullscreen"],
      moveInertia: true,
      minFov: 20,
      maxFov: 100,
      zoomSpeed: 0.2,
      moveSpeed: 1.0,
      defaultZoomLvl: 50
    });

    const applyQualityTweaks = () => {
      const { renderer: gl, scene } = getRendererExtras(viewer);

      // HiDPI rendering (cap for perf)
      gl.setPixelRatio(computeSupersamplePR());

      // Max anisotropy
      const maxAniso = gl.capabilities.getMaxAnisotropy();

      // Upgrade texture filtering on all mesh materials
      scene.traverse((obj: Object3D) => {
        if (!isMesh(obj)) return;
        setAnisotropy(obj.material, maxAniso);
      });
    };

    viewer.addEventListener("ready", applyQualityTweaks);

    // Re-apply on resize (debounced)
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyQualityTweaks);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      viewer.destroy();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
