"use client";

import { useEffect, useRef } from "react";

/** 1) Type the krpano JS interface you actually use */
interface KrpanoInterface {
  call: (cmd: string) => void;
  get?: (path: string) => unknown;
  set?: (path: string, value: unknown) => void;
}

/** 2) Global typings */
declare global {
  interface KrpanoEmbedOptions {
    target: HTMLElement | string;
    xml?: string;
    html5?: "auto" | "prefer" | "only" | "fallback";
    mobilescale?: number;
    passQueryParameters?: boolean;
    onready?: (krpanoInterface: KrpanoInterface) => void;
    id?: string;
    [key: string]: unknown;
  }
  interface Window {
    embedpano?: (opts: KrpanoEmbedOptions) => void;
    removepano?: (id?: string) => void;
    __krpanoLoader?: Promise<void>;
  }
}
export {};

const KR_SCRIPT_SRC = "/tours/tour-1-1/krpano.js";

/** 3) Script loader (cached so we fetch only once) */
function loadKrpanoScript(src: string = KR_SCRIPT_SRC): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve(); // SSR no-op

  // If we already have a loader promise, reuse it
  if (window.__krpanoLoader) return window.__krpanoLoader;

  // If script tag already present and embedpano exists, resolve immediately
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`
  );
  if (existing && typeof window.embedpano === "function") {
    window.__krpanoLoader = Promise.resolve();
    return window.__krpanoLoader;
  }

  window.__krpanoLoader = new Promise<void>((resolve, reject) => {
    // If tag exists but embedpano not ready, hook onload
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script); // Use document.head for faster loading
    }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
  });

  return window.__krpanoLoader;
}

function useKrpano(xmlPath: string) {
  const panoId = useRef(
    `krpano-${Math.random().toString(36).slice(2)}`
  ).current;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const krRef = useRef<KrpanoInterface | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!containerRef.current) return;

      // 1) Ensure krpano script is loaded
      try {
        await loadKrpanoScript();
      } catch (e) {
        console.error(e);
        return;
      }
      if (cancelled) return;

      if (typeof window.embedpano !== "function") {
        console.error("krpano.js loaded but window.embedpano is missing.");
        return;
      }

      // 2) Clean any previous instance and embed - tour loads first scene automatically
      window.removepano?.(panoId);
      window.embedpano({
        id: panoId,
        target: containerRef.current,
        xml: xmlPath,
        html5: "only",
        passQueryParameters: false,
        mobilescale: 1.0,
        onready: (k) => {
          if (!cancelled) {
            krRef.current = k;
          }
        }
      });
    })();

    return () => {
      cancelled = true;
      try {
        window.removepano?.(panoId);
      } finally {
        krRef.current = null;
      }
    };
  }, [xmlPath, panoId]);

  const api = {
    loadScene: (sceneName: string, blendSeconds = 0) => {
      const k = krRef.current;
      if (!k) return;
      k.call(
        `loadscene(${sceneName}, null, MERGE|KEEPVIEW|KEEPFOV, BLEND(${blendSeconds}));`
      );
    },
    get: () => krRef.current
  };

  return { containerRef, api } as const;
}

export default function KrpanoSceneSwitcher({
  xml,
  style = { width: "100%", height: "100vh" }
}: {
  xml?: string;
  style?: React.CSSProperties;
}) {
  const { containerRef } = useKrpano(xml!);

  return (
    <div style={style} className="relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
