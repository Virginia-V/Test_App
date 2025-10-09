/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";

interface LoadingProgressState {
  loading: boolean;
  percent: number;
  tilesLoaded: boolean;
  blended: boolean;
  menuImagesLoaded: boolean;
}

interface LoadingProgressActions {
  startLoader: () => void;
  stopLoaderImmediate: () => void;
  setTilesLoaded: (loaded: boolean) => void;
  setBlended: (blended: boolean) => void;
  setMenuImagesLoaded: (loaded: boolean) => void;
  maybeStop: () => void;
  handleLoadError: () => void;
}

export function useLoadingProgressManager(krpanoRef: React.MutableRefObject<any>): [LoadingProgressState, LoadingProgressActions] {
  // Basic state
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);
  
  // State tracking refs
  const tilesLoadedRef = useRef(false);
  const blendedRef = useRef(true);
  const menuImagesLoadedRef = useRef(false);
  const finishingRef = useRef(false);
  
  // Timer and animation refs
  const progressTimerRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const targetPctRef = useRef(0);
  const forcedFinishRef = useRef(false);

  useEffect(() => {
    percentRef.current = percent;
  }, [percent]);

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
    if (
      !tilesLoadedRef.current ||
      !blendedRef.current ||
      !menuImagesLoadedRef.current
    )
      return;
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
    menuImagesLoadedRef.current = false;
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

      // when all conditions pass, allow 100
      if (
        tilesLoadedRef.current &&
        blendedRef.current &&
        menuImagesLoadedRef.current
      ) {
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

      // gate at 99 until all ready
      if (
        !(
          tilesLoadedRef.current &&
          blendedRef.current &&
          menuImagesLoadedRef.current
        )
      ) {
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

    // safety: if events mis-order, force finish shortly after all gates are true
    const armSafety = () => {
      if (safetyTimeoutRef.current)
        window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = window.setTimeout(() => {
        maybeStop();
      }, 350);
    };

    // light periodic checker just to arm the safety when all pass
    progressTimerRef.current = window.setInterval(() => {
      if (
        tilesLoadedRef.current &&
        blendedRef.current &&
        menuImagesLoadedRef.current
      )
        armSafety();
    }, 80);
  };

  const setTilesLoaded = (loaded: boolean) => {
    tilesLoadedRef.current = loaded;
    if (loaded) maybeStop();
  };

  const setBlended = (blended: boolean) => {
    blendedRef.current = blended;
    if (blended) maybeStop();
  };

  const setMenuImagesLoaded = (loaded: boolean) => {
    menuImagesLoadedRef.current = loaded;
    if (loaded) maybeStop();
  };

  const handleLoadError = () => {
    // fail-safe: end loader
    setPercent(100);
    percentRef.current = 100;
    stopLoaderImmediate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const state: LoadingProgressState = {
    loading,
    percent,
    tilesLoaded: tilesLoadedRef.current,
    blended: blendedRef.current,
    menuImagesLoaded: menuImagesLoadedRef.current
  };

  const actions: LoadingProgressActions = {
    startLoader,
    stopLoaderImmediate,
    setTilesLoaded,
    setBlended,
    setMenuImagesLoaded,
    maybeStop,
    handleLoadError
  };

  return [state, actions];
}