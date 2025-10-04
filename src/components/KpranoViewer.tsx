/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePanoramaContext } from "@/context/PanoramaContext";
import { attachHotspotOnclick } from "@/helpers/hotspotOnclick";

declare global {
  interface Window {
    embedpano?: (opts: any) => void;
    removepano?: (id: string) => void;
    krpanoPlayer?: any;
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

function mapNameToType(name?: string): "sink" | "bathtub" | "floor" | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.startsWith("sink")) return "sink";
  if (n.startsWith("bathtub")) return "bathtub";
  if (n.startsWith("floor")) return "floor";
  return null;
}

type Props = {
  xmlUrl: string;
  viewerScriptUrl?: string;
  containerId?: string;
  /** e.g. "MERGE|PRELOAD|KEEPVIEW" */
  loadsceneFlags?: string;
};

export default function KrpanoViewer({
  xmlUrl,
  viewerScriptUrl,
  containerId = "krpano-container",
  loadsceneFlags = "MERGE|PRELOAD|KEEPVIEW"
}: Props) {
  const { currentSceneId } = usePanoramaContext();
  const krpanoRef = useRef<any | null>(null);
  const detachersRef = useRef<Array<() => void>>([]);

  console.log(currentSceneId);

  // loader state
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);
  useEffect(() => {
    percentRef.current = percent;
  }, [percent]);

  // refs for logic
  const progressTimerRef = useRef<number | null>(null);
  const finishingRef = useRef(false); // prevents flips while finishing
  const tilesLoadedRef = useRef(false); // pano tiles ready
  const blendedRef = useRef(true); // transition finished (or none)
  const safetyTimeoutRef = useRef<number | null>(null);

  // RAF/smoothing refs
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const targetPctRef = useRef(0);
  const forcedFinishRef = useRef(false);

  // ring params
  const size = 60;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - percent / 100);

  const clearTimers = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTsRef.current = null;
  };

  const stopLoaderImmediate = () => {
    clearTimers();
    setLoading(false);
  };

  const maybeStop = () => {
    if (finishingRef.current) return;
    if (!tilesLoadedRef.current || !blendedRef.current) return;
    // allow 100% — RAF loop will glide to it
    finishingRef.current = true;
    forcedFinishRef.current = true;
  };

  const startLoader = () => {
    setLoading(true);
    setPercent(0);
    percentRef.current = 0;

    tilesLoadedRef.current = false;
    blendedRef.current = true; // will flip false on blend start
    finishingRef.current = false;
    forcedFinishRef.current = false;
    targetPctRef.current = 0;

    clearTimers();

    // smoothing parameters
    const minUpspeedPerSec = 22; // min visible rate (pct/sec) to avoid "freeze"
    const maxUpspeedPerSec = 120; // cap so it doesn't teleport
    const responsiveness = 0.18; // base chase factor
    const finishResponsiveness = 0.28; // a bit faster when finishing

    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick);

      // delta time in seconds
      const last = lastTsRef.current ?? ts;
      const dt = Math.max(0.001, (ts - last) / 1000);
      lastTsRef.current = ts;

      // read krpano raw progress (0..1) => 0..100
      let krProgress = 0;
      try {
        krProgress =
          Number(krpanoRef.current?.get("progress.progress") ?? 0) * 100;
        if (!Number.isFinite(krProgress)) krProgress = 0;
      } catch {
        // ignore polling errors
      }

      // grow target, never backwards
      targetPctRef.current = Math.max(
        targetPctRef.current,
        Math.min(99, Math.max(0, krProgress))
      );

      // when both conditions pass, allow 100
      if (tilesLoadedRef.current && blendedRef.current) {
        targetPctRef.current = Math.max(targetPctRef.current, 100);
      }

      const r = forcedFinishRef.current ? finishResponsiveness : responsiveness;

      const current = percentRef.current;

      // chase target smoothly
      const desired = current + (targetPctRef.current - current) * r;

      // min/max per-frame step
      const minStep = minUpspeedPerSec * dt;
      const maxStep = maxUpspeedPerSec * dt;

      let next = Math.max(current, desired);

      if (next < targetPctRef.current) {
        next = Math.min(current + Math.max(minStep, 0), targetPctRef.current);
      }

      next = Math.min(current + maxStep, next);

      // gate at 99 until both ready
      if (!(tilesLoadedRef.current && blendedRef.current)) {
        next = Math.min(next, 99);
      }

      if (forcedFinishRef.current && next >= 99.9) {
        next = 100;
      }

      if (next !== current) {
        const rounded = Number(next.toFixed(1));
        percentRef.current = rounded;
        setPercent(rounded);
      }

      // finalize only at 100
      if (next >= 100) {
        rafRef.current && cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        requestAnimationFrame(() => {
          stopLoaderImmediate();
          finishingRef.current = false;
          forcedFinishRef.current = false;
        });
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    // safety: if events mis-order, force finish shortly after both gates are true
    const armSafety = () => {
      if (safetyTimeoutRef.current)
        window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = window.setTimeout(() => {
        maybeStop();
      }, 350);
    };

    // light periodic checker just to arm the safety when both pass
    progressTimerRef.current = window.setInterval(() => {
      if (tilesLoadedRef.current && blendedRef.current) armSafety();
    }, 80);
  };

  useEffect(() => {
    let destroyed = false;

    const ensureScript = () =>
      new Promise<void>((res, rej) => {
        if (window.embedpano) return res();
        if (!viewerScriptUrl)
          return rej(new Error("viewerScriptUrl is required"));
        const s = document.createElement("script");
        s.src = viewerScriptUrl;
        s.async = true;
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
      });

    const wireTypeHotspots = (krpano: any) => {
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

    (async () => {
      try {
        await ensureScript();
        if (destroyed) return;

        window.embedpano?.({
          target: containerId,
          id: "krpanoPlayer",
          xml: xmlUrl,
          html5: "only",
          onready: (krpano: any) => {
            if (destroyed) return;

            krpanoRef.current = krpano;
            window.krpanoPlayer = krpano;

            // lifecycle handlers — ONLY pano readiness + blend
            window.__kr_onnewpano = () => {
              startLoader();
              tilesLoadedRef.current = false;
            };
            window.__kr_onviewloaded = () => {
              tilesLoadedRef.current = true;
              maybeStop();
            };
            window.__kr_onloadcomplete = () => {
              tilesLoadedRef.current = true;
              maybeStop();
            };
            window.__kr_onblendstart = () => {
              blendedRef.current = false;
            };
            window.__kr_onblendcomplete = () => {
              blendedRef.current = true;
              maybeStop();
            };
            window.__kr_onloaderror = () => {
              // fail-safe: end loader
              setPercent(100);
              percentRef.current = 100;
              stopLoaderImmediate();
            };

            // wire initial hotspots and on each scene
            const rewire = () => wireTypeHotspots(krpanoRef.current);
            window.__krpanoRewireTypeHotspots = rewire;
            rewire();

            // append handlers, do not overwrite others
            krpanoRef.current.call(
              `events.add(onnewscene, js(window.__krpanoRewireTypeHotspots && window.__krpanoRewireTypeHotspots()));`
            );
            krpanoRef.current.call(
              `events.add(onnewpano, js(window.__kr_onnewpano && window.__kr_onnewpano()));`
            );
            krpanoRef.current.call(
              `events.add(onviewloaded, js(window.__kr_onviewloaded && window.__kr_onviewloaded()));`
            );
            krpanoRef.current.call(
              `events.add(onloadcomplete, js(window.__kr_onloadcomplete && window.__kr_onloadcomplete()));`
            );
            krpanoRef.current.call(
              `events.add(onblendstart, js(window.__kr_onblendstart && window.__kr_onblendstart()));`
            );
            krpanoRef.current.call(
              `events.add(onblendcomplete, js(window.__kr_onblendcomplete && window.__kr_onblendcomplete()));`
            );
            krpanoRef.current.call(
              `events.add(onloaderror, js(window.__kr_onloaderror && window.__kr_onloaderror()));`
            );
          }
        });
      } catch (err) {
        console.error("[krpano] failed to initialize:", err);
      }
    })();

    return () => {
      destroyed = true;
      try {
        detachersRef.current.forEach((d) => d());
        detachersRef.current = [];
      } catch {}
      try {
        clearTimers();
      } catch {}
      try {
        window.removepano?.("krpanoPlayer");
      } catch {}
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
  }, [xmlUrl, viewerScriptUrl, containerId]);

  // change scene (KEEPVIEW included in flags)
  useEffect(() => {
    if (currentSceneId && krpanoRef.current?.call) {
      const flags = (loadsceneFlags || "MERGE|PRELOAD|KEEPVIEW").replace(
        /\s+/g,
        ""
      );
      // proactively start loader; events will confirm exact finish time
      startLoader();
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
      {loading && (
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
          <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ display: "block" }}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={stroke}
                fill="none"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#5EAC24"
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%"
                }}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#5EAC24",
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                pointerEvents: "none"
              }}
            >
              {Math.round(percent)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
