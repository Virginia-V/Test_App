/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { attachHotspotOnclick } from "@/helpers/hotspotOnclick";

function mapNameToType(name?: string): "sink" | "bathtub" | "floor" | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.startsWith("sink")) return "sink";
  if (n.startsWith("bathtub")) return "bathtub";
  if (n.startsWith("floor")) return "floor";
  return null;
}

interface HotspotManagerProps {
  krpanoRef: React.MutableRefObject<any>;
}

export function useHotspotManager(krpanoRef: React.MutableRefObject<any>) {
  const detachersRef = useRef<Array<() => void>>([]);

  const wireTypeHotspots = (krpano: any) => {
    // Clean up existing detachers
    detachersRef.current.forEach((d) => {
      try {
        d();
      } catch {}
    });
    detachersRef.current = [];

    const count = Number(krpano.get("hotspot.count") ?? 0);
    for (let i = 0; i < count; i++) {
      const name = krpano.get(`hotspot[${i}].name`) as string | undefined;
      const t = mapNameToType(name);
      if (!name || !t) continue;

      const detach = attachHotspotOnclick(krpano, name, () => {
        window._krpanoOpenMenu?.(t);
      });
      detachersRef.current.push(detach);
    }
  };

  const setupHotspots = () => {
    if (!krpanoRef.current) return;

    const krpano = krpanoRef.current;
    
    // Wire initial hotspots and on each scene
    const rewire = () => wireTypeHotspots(krpano);
    window.__krpanoRewireTypeHotspots = rewire;
    rewire();

    // append handlers, do not overwrite others
    krpano.call(
      `events.add(onnewscene, js(window.__krpanoRewireTypeHotspots && window.__krpanoRewireTypeHotspots()));`
    );
  };

  const cleanup = () => {
    try {
      detachersRef.current.forEach((d) => d());
      detachersRef.current = [];
    } catch {}
    
    try {
      delete window.__krpanoRewireTypeHotspots;
    } catch {}
  };

  return {
    setupHotspots,
    wireTypeHotspots,
    cleanup
  };
}

export default function HotspotManager({ krpanoRef }: HotspotManagerProps) {
  const { setupHotspots, cleanup } = useHotspotManager(krpanoRef);
  
  return {
    setupHotspots,
    cleanup
  };
}