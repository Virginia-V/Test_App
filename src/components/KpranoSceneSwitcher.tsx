// "use client";
// import { useEffect, useMemo, useRef, useState } from "react";

// interface KrpanoInterface {
//   call: (cmd: string) => void;
//   get?: (path: string) => unknown;
//   set?: (path: string, value: unknown) => void;
// }

// declare global {
//   interface KrpanoEmbedOptions {
//     target: HTMLElement | string;
//     xml?: string;
//     html5?: "auto" | "prefer" | "only" | "fallback";
//     mobilescale?: number;
//     passQueryParameters?: boolean;
//     onready?: (krpanoInterface: KrpanoInterface) => void;
//     id?: string;
//     basepath?: string;
//     [key: string]: unknown;
//   }
//   interface Window {
//     embedpano?: (opts: KrpanoEmbedOptions) => void;
//     removepano?: (id?: string) => void;
//     __krpanoLoader?: Promise<void>;
//   }
// }

// async function loadKrpanoScriptFromStorage(krpanoKey: string): Promise<void> {
//   if (typeof window === "undefined") return;
//   if (window.__krpanoLoader) return window.__krpanoLoader;
//   if (typeof window.embedpano === "function") {
//     window.__krpanoLoader = Promise.resolve();
//     return window.__krpanoLoader;
//   }
//   window.__krpanoLoader = new Promise<void>((resolve, reject) => {
//     const script = document.createElement("script");
//     script.src = `/api/tours/${encodeURIComponent(krpanoKey)}`;
//     script.async = true;
//     script.onload = () => resolve();
//     script.onerror = (e) => reject(e);
//     document.head.appendChild(script);
//   });
//   return window.__krpanoLoader;
// }

// export default function KrpanoSceneSwitcher({
//   xmlKey = "tour-1-1/tour.xml", // NOTE: pretty key (no leading "tours/")
//   krpanoKey = "tour-1-1/krpano.js",
//   style = { width: "100%", height: "100vh" }
// }: {
//   xmlKey?: string;
//   krpanoKey?: string;
//   style?: React.CSSProperties;
// }) {
//   const panoIdRef = useRef(`krpano-${Math.random().toString(36).slice(2)}`);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const [scenes, setScenes] = useState<string[]>([]);
//   const [idx, setIdx] = useState(0);

//   // Clean base
//   const basepath = useMemo(() => {
//     const prefix = xmlKey.replace(/[^/]+$/u, "");
//     const clean = `/api/tours/${prefix}`;
//     return clean.endsWith("/") ? clean : clean + "/";
//   }, [xmlKey]);

//   // Utility: embed XML from a URL (krpano loads only that single-scene XML)
//   const embed = async (xmlUrl: string) => {
//     await loadKrpanoScriptFromStorage(krpanoKey);
//     if (typeof window.embedpano !== "function" || !containerRef.current) return;
//     window.removepano?.(panoIdRef.current);
//     window.embedpano({
//       id: panoIdRef.current,
//       target: containerRef.current,
//       xml: xmlUrl,
//       html5: "only",
//       passQueryParameters: false,
//       mobilescale: 1.0,
//       basepath
//     });
//   };

//   // 1) Fetch scene list (once)
//   useEffect(() => {
//     (async () => {
//       const res = await fetch(`/api/tours/${xmlKey}?list=1`, {
//         cache: "no-store"
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       if (Array.isArray(data.scenes) && data.scenes.length) {
//         setScenes(data.scenes);
//       }
//     })();
//   }, [xmlKey]);

//   // 2) Load FIRST scene only
//   useEffect(() => {
//     (async () => {
//       // If we have a named first scene, load it, else use single=1 (first)
//       const first = scenes[0];
//       const url = first
//         ? `/api/tours/${xmlKey}?scene=${encodeURIComponent(first)}`
//         : `/api/tours/${xmlKey}?single=1`;
//       await embed(url);
//       setIdx(0);
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [scenes.length]); // run once when list arrives

//   // Expose simple next/prev helpers (call from your UI)
//   const next = async () => {
//     if (!scenes.length) return;
//     const n = (idx + 1) % scenes.length;
//     await embed(`/api/tours/${xmlKey}?scene=${encodeURIComponent(scenes[n])}`);
//     setIdx(n);
//   };
//   const prev = async () => {
//     if (!scenes.length) return;
//     const p = (idx - 1 + scenes.length) % scenes.length;
//     await embed(`/api/tours/${xmlKey}?scene=${encodeURIComponent(scenes[p])}`);
//     setIdx(p);
//   };

//   // Example: temporary overlay controls (remove if you wire your own UI)
//   return (
//     <div style={style} className="relative">
//       <div ref={containerRef} className="w-full h-full" />
//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 text-white px-3 py-2 rounded">
//         <button onClick={prev}>Prev</button>
//         <div>{scenes[idx] ?? "loading..."}</div>
//         <button onClick={next}>Next</button>
//       </div>
//     </div>
//   );
// }
