/* eslint-disable @typescript-eslint/no-explicit-any */
// import KrpanoViewer from "@/components/KpranoViewer";
// import { BottomMenu } from "@/components/BottomMenu ";
// export default function HomePage() {
//   const xmlUrl = "tours/tour-1-1/tour.xml";
//   const viewerScriptUrl = "tours/tour-1-1/krpano.js";

//   return (
//     <main className="relative h-[100dvh] w-full">
//       <KrpanoViewer
//         xmlUrl={xmlUrl}
//         viewerScriptUrl={viewerScriptUrl}
//         loadsceneFlags="MERGE|KEEPVIEW|KEEPMOVING"
//       />

//       <div
//         className="pointer-events-none fixed left-1/2 bottom-24 -translate-x-1/2 z-[1000] w-full px-4"
//         style={{ maxWidth: 1300 }}
//       >
//         <div className="pointer-events-auto">
//           <BottomMenu panoramaType="sink" style={{ margin: "0 auto" }} />
//           <BottomMenu panoramaType="bathtub" />
//           <BottomMenu panoramaType="floor" style={{ margin: "0 auto" }} />
//         </div>
//       </div>
//     </main>
//   );
// }




// "use client";

// import { useEffect, useState, useCallback } from "react";

// import { PanoramaProvider } from "@/context/PanoramaContext";
// import KrpanoViewer from "@/components/KpranoViewer";
// import { BottomMenu } from "@/components/BottomMenu ";

// type PanoramaType = "sink" | "bathtub" | "floor";

// export default function HomePage() {
//   const xmlUrl = "tours/tour-1-1/tour.xml";
//   const viewerScriptUrl = "tours/tour-1-1/krpano.js";

//   const [openMenu, setOpenMenu] = useState<PanoramaType | null>(null);

//   // Bridge for krpano -> React
//   useEffect(() => {
//     window._krpanoOpenMenu = (type: PanoramaType) => {
//       setOpenMenu(type);
//     };
//     return () => {
//       try {
//         delete window._krpanoOpenMenu;
//       } catch {}
//     };
//   }, []);

//   // common handler to close any menu
//   const handleCloseMenu = useCallback(() => setOpenMenu(null), []);

//   return (
//     <PanoramaProvider>
//       <main className="relative h-[100dvh] w-full">
//         <KrpanoViewer
//           xmlUrl={xmlUrl}
//           viewerScriptUrl={viewerScriptUrl}
//           loadsceneFlags="MERGE|PRELOAD|KEEPVIEW"
//         />

//         {/* Bottom menus container */}
//         <div
//           className="pointer-events-none fixed left-1/2 bottom-24 -translate-x-1/2 z-[1000] w-full px-4"
//           style={{ maxWidth: 1300 }}
//         >
//           <div className="pointer-events-auto flex flex-col items-center gap-6">
//             {openMenu === "sink" && (
//               <BottomMenu
//                 panoramaType="sink"
//                 onAnimationComplete={handleCloseMenu}
//                 style={{ margin: "0 auto" }}
//                 // onInfoClick={() => setPanelVisible(true)}
//               />
//             )}
//             {openMenu === "bathtub" && (
//               <BottomMenu
//                 panoramaType="bathtub"
//                 onAnimationComplete={handleCloseMenu}
//                 // onInfoClick={() => setPanelVisible(true)}
//               />
//             )}
//             {openMenu === "floor" && (
//               <BottomMenu
//                 panoramaType="floor"
//                 onAnimationComplete={handleCloseMenu}
//                 style={{ margin: "0 auto" }}
//                 // onInfoClick={() => setPanelVisible(true)}
//               />
//             )}
//           </div>
//         </div>
//       </main>
//     </PanoramaProvider>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PanoramaProvider,
  usePanoramaContext
} from "@/context/PanoramaContext";
import KrpanoViewer from "@/components/KpranoViewer";
import { BottomMenu } from "@/components/BottomMenu ";
import { InfoPanel } from "@/components/ProductPanelTabs";


type PanoramaType = "sink" | "bathtub" | "floor";

function SceneUI() {
  const {
    panoramas,
    setMenuOpen,
    panelVisible,
    setPanelVisible,
    openMenuType
  } = usePanoramaContext();

  // Tabs state for InfoPanel
  const [infoValue, setInfoValue] = useState(0);

  // Current menu’s model index (null for floor or if missing)
  const selectedModelIndex = useMemo(() => {
    if (!openMenuType) return null;
    const part = panoramas[openMenuType];
    return typeof part.modelIndex === "number" ? part.modelIndex : null;
  }, [openMenuType, panoramas]);

  // Optional bridges for krpano → React
  useEffect(() => {
    (window as any)._krpanoOpenMenu = (type: PanoramaType) => {
      if (type === "sink" || type === "bathtub" || type === "floor") {
        // This auto-opens the InfoPanel because setMenuOpen(...) sets panelVisible(true)
        setMenuOpen(type, true);
      }
    };
    (window as any)._krpanoOpenPanel = () => setPanelVisible(true);
    (window as any)._krpanoClosePanel = () => setPanelVisible(false);
    return () => {
      try {
        delete (window as any)._krpanoOpenMenu;
        delete (window as any)._krpanoOpenPanel;
        delete (window as any)._krpanoClosePanel;
      } catch {}
    };
  }, [setMenuOpen, setPanelVisible]);

  return (
    <>
      {/* Bottom menus */}
      <div
        className="pointer-events-none fixed left-1/2 bottom-24 -translate-x-1/2 z-[1000] w-full px-4"
        style={{ maxWidth: 1300 }}
      >
        <div className="pointer-events-auto flex flex-col items-center gap-6">
          {panoramas.sink.menuOpen && <BottomMenu panoramaType="sink" />}
          {panoramas.bathtub.menuOpen && <BottomMenu panoramaType="bathtub" />}
          {panoramas.floor.menuOpen && <BottomMenu panoramaType="floor" />}
        </div>
      </div>

      {/* InfoPanel opens when setMenuOpen(type, true) is called (panelVisible=true) */}
      {/* <InfoPanel
        visible={panelVisible}
        onClose={() => {
          setPanelVisible(false);
          setInfoValue(0);
        }}
        value={infoValue}
        setValue={setInfoValue}
        panoramaType={openMenuType ?? undefined}
        modelIndex={selectedModelIndex}
      /> */}
    </>
  );
}

export default function HomePage() {
  const xmlUrl = "tours/tour-1-1/tour.xml";
  const viewerScriptUrl = "tours/tour-1-1/krpano.js";

  return (
    <PanoramaProvider>
      <main className="relative h-[100dvh] w-full">
        <KrpanoViewer
          xmlUrl={xmlUrl}
          viewerScriptUrl={viewerScriptUrl}
          loadsceneFlags="MERGE|PRELOAD|KEEPVIEW"
        />
        <SceneUI />
      </main>
    </PanoramaProvider>
  );
}
