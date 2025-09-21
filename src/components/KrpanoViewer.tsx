"use client";

import { useEffect, useRef } from "react";

interface KrpanoEmbedOptions {
  target: HTMLElement | string;
  xml?: string;
  html5?: "auto" | "prefer" | "only" | "fallback";
  mobilescale?: number;
  passQueryParameters?: boolean;
  onready?: (krpanoInterface: unknown) => void;
}

declare global {
  interface Window {
    embedpano?: (opts: KrpanoEmbedOptions) => void;
    removepano?: (id?: string) => void;
  }
}

export default function KrpanoViewer({
  xml = "/kp/tour.xml",
  style = { width: "100%", height: "100vh" }
}: {
  xml?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Grab the element once so it's never null in the closure.
    const el = ref.current;
    if (!el) return;

    const script = document.createElement("script");
    script.src = "/kp/krpano.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.embedpano === "function") {
        window.embedpano({
          target: el, // <-- HTMLElement, not null
          xml,
          html5: "only",
          mobilescale: 1.0,
          passQueryParameters: true
        });
      } else {
        console.error("krpano embedpano() not found.");
      }
    };

    script.onerror = () => {
      console.error("Failed to load /krpano/krpano.js");
    };

    document.body.appendChild(script);

    return () => {
      try {
        window.removepano?.("krpanoSWFObject");
      } finally {
        // document.body.contains(script) && document.body.removeChild(script);
      }
    };
  }, [xml]);

  return <div ref={ref} style={style} />;
}
