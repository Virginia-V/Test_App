/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    embedpano?: (opts: any) => void;
    removepano?: (id: string) => void;
    krpanoPlayer?: any;
  }
}

interface KrpanoScriptProps {
  xmlUrl: string;
  viewerScriptUrl?: string;
  containerId: string;
  onReady: (krpano: any) => void;
}

export function useKrpanoScript({
  xmlUrl,
  viewerScriptUrl,
  containerId,
  onReady
}: KrpanoScriptProps) {
  const ensureScript = (): Promise<void> =>
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

  const initialize = async () => {
    try {
      await ensureScript();

      window.embedpano?.({
        target: containerId,
        id: "krpanoPlayer",
        xml: xmlUrl,
        html5: "only",
        onready: (krpano: any) => {
          window.krpanoPlayer = krpano;

          // Force fullscreen target to html/body so overlays are visible
          try {
            krpano.set("display.fullscreen", "body");
          } catch {}

          onReady(krpano);
        }
      });
    } catch (err) {
      console.error("[krpano] failed to initialize:", err);
    }
  };

  const cleanup = () => {
    try {
      window.removepano?.("krpanoPlayer");
    } catch {}
  };

  return {
    initialize,
    cleanup
  };
}

export default function KrpanoScript(props: KrpanoScriptProps) {
  const { initialize, cleanup } = useKrpanoScript(props);
  
  return {
    initialize,
    cleanup
  };
}