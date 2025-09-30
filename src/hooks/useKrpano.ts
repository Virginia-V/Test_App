/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    __setKrpano?: (inst: any | null) => void;
    __kr_onNewScene?: () => void;
  }
}

type Krpano = {
  get: (p: string) => any;
  set: (p: string, v: any) => void;
  call: (a: string) => void;
};

export function useKrpano() {
  const [krpano, setKrpano] = useState<Krpano | null>(null);
  const [sceneNonce, setSceneNonce] = useState(0); // bump on scene changes

  useEffect(() => {
    window.__setKrpano = (inst: any | null) => setKrpano(inst);
    window.__kr_onNewScene = () => setSceneNonce((n) => n + 1);
    return () => {
      window.__setKrpano = undefined as any;
      window.__kr_onNewScene = undefined as any;
    };
  }, []);

  const isReady = !!krpano;
  const get = useCallback((p: string) => krpano?.get(p), [krpano]);
  const set = useCallback((p: string, v: any) => krpano?.set(p, v), [krpano]);
  const call = useCallback((a: string) => krpano?.call(a), [krpano]);

  // List hotspots of the *current* scene
  const getHotspots = useCallback((): {
    name: string;
    type?: string;
    ath?: number;
    atv?: number;
  }[] => {
    if (!krpano) return [];
    const count = krpano.get("hotspot.count") ?? 0;
    const list = [];
    for (let i = 0; i < count; i++) {
      const name = krpano.get(`hotspot[${i}].name`);
      list.push({
        name,
        type: krpano.get(`hotspot[${name}].type`),
        ath: krpano.get(`hotspot[${name}].ath`),
        atv: krpano.get(`hotspot[${name}].atv`)
      });
    }
    return list;
  }, [krpano]);

  return { krpano, isReady, get, set, call, getHotspots, sceneNonce };
}
