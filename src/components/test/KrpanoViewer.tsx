"use client";

import { useEffect, useRef } from "react";
import { PanoramaType } from "@/context/PanoramaContext";
import { BottomMenu } from "../BottomMenu ";
import { cn } from "@/lib/utils";

interface KrpanoEmbedOptions {
  target: HTMLElement | string;
  xml?: string;
  html5?: "auto" | "prefer" | "only" | "fallback";
  mobilescale?: number;
  passQueryParameters?: boolean;
  onready?: (krpanoInterface: unknown) => void;
}

// declare global {
//   interface Window {
//     embedpano?: (opts: KrpanoEmbedOptions) => void;
//     removepano?: (id?: string) => void;
//   }
// }

export default function KrpanoViewer({
  xml = "/tours/tour-1-1/tour.xml",
  style = { width: "100%", height: "100vh" },
  panoramaType = "bathtub",
  ...bottomMenuProps
}: {
  xml?: string;
  style?: React.CSSProperties;
  panoramaType?: PanoramaType;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const script = document.createElement("script");
    script.src = "/tours/tour-1-1/krpano.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.embedpano === "function") {
        window.embedpano({
          target: el,
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
      console.error("Failed to load /tours/tour-1-1/krpano.js");
    };

    document.body.appendChild(script);

    return () => {
      try {
        window.removepano?.("krpanoSWFObject");
      } catch {}
      // optional: remove script if you want
      // if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [xml]);

  return (
    <div
      style={{
        ...style,
        position: "relative", // establish stacking context
        overflow: "hidden"
      }}
    >
      {/* krpano target */}
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 0 // keep pano below overlay
        }}
      />

      {/* Bottom menu positioned like in the reference implementation */}
      <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-20")}>
        <BottomMenu
          panoramaType={panoramaType}
          onInfoClick={() => {}}
          backdropClosing={false}
          onAnimationComplete={() => {}}
          {...bottomMenuProps}
        />
      </div>
    </div>
  );
}
