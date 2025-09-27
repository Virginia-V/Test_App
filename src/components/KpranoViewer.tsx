/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import { useEffect } from "react";

// declare global {
//   interface Window {
//     embedpano?: (opts: any) => void;
//     removepano?: (id: string) => void;
//   }
// }

// type Props = {
//   xmlUrl: string; // e.g. /api/krpano/tours/tour-1-1/tour.xml
//   viewerScriptUrl?: string; // e.g. /api/krpano/tours/tour-1-1/krpano.js
//   containerId?: string; // optional if you want multiple instances
// };

// export default function KrpanoViewer({
//   xmlUrl,
//   viewerScriptUrl,
//   containerId = "krpano-container"
// }: Props) {
//   useEffect(() => {
//     let destroyed = false;

//     const ensureScript = () =>
//       new Promise<void>((res, rej) => {
//         if (window.embedpano) return res();
//         const s = document.createElement("script");
//         s.src = viewerScriptUrl!;
//         s.async = true;
//         s.onload = () => res();
//         s.onerror = rej;
//         document.head.appendChild(s);
//       });

//     (async () => {
//       await ensureScript();
//       if (destroyed) return;

//       // window.embedpano?.({
//       //   target: containerId,
//       //   id: "krpanoPlayer", // use a fixed id unless you need multiple viewers
//       //   xml: xmlUrl,
//       //   html5: "only",
//       //   bgcolor: "#000000"
//       // });

//       window.embedpano?.({
//         target: containerId,
//         id: "krpanoPlayer",
//         xml: xmlUrl,
//         html5: "only",
//         bgcolor: "#000000",
//         vars: {
//           "display.dprlimit": 1.0,
//           "network.downloadqueues": 10
//         }
//       });
//     })();

//     return () => {
//       destroyed = true;
//       try {
//         window.removepano?.("krpanoPlayer");
//       } catch {
//         /* noop */
//       }
//     };
//   }, [xmlUrl, viewerScriptUrl, containerId]);

//   return <div id={containerId} style={{ width: "100%", height: "100vh" }} />;
// }




"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    embedpano?: (opts: any) => void;
    removepano?: (id: string) => void;
  }
}

type Props = {
  xmlUrl: string;                       // e.g. /tours/tour-1-1/tour.xml
  viewerScriptUrl?: string;             // e.g. /tours/tour-1-1/krpano.js
  containerId?: string;
};

export default function KrpanoViewer({
  xmlUrl,
  viewerScriptUrl = "/tours/tour-1-1/krpano.js",  // <-- your public path
  containerId = "krpano-container",
}: Props) {
  useEffect(() => {
    let destroyed = false;

    const ensureScript = () =>
      new Promise<void>((res, rej) => {
        if (window.embedpano) return res();
        const s = document.createElement("script");
        s.src = viewerScriptUrl;
        s.async = true;
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
      });

    (async () => {
      await ensureScript();
      if (destroyed) return;

      window.embedpano?.({
        target: containerId,
        id: "krpanoPlayer",
        xml: xmlUrl,
        html5: "only",
        bgcolor: "#000000",
        // keep the perf helpers
        vars: {
          "display.dprlimit": 1.0,
          "network.downloadqueues": 10,
        },
      });
    })();

    return () => {
      destroyed = true;
      window.removepano?.("krpanoPlayer");
    };
  }, [xmlUrl, viewerScriptUrl, containerId]);

  return <div id={containerId} style={{ width: "100%", height: "100vh" }} />;
}
