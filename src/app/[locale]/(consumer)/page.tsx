/* eslint-disable @typescript-eslint/no-explicit-any */
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
        // Only open the menu, not the InfoPanel
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

  const [infoPanelPreloaded, setInfoPanelPreloaded] = useState(false);

  // Preload InfoPanel after initial render
  useEffect(() => {
    const timer = setTimeout(() => setInfoPanelPreloaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Bottom menus */}
      <div
        className="pointer-events-none fixed left-1/2 bottom-24 -translate-x-1/2 z-[1000] w-full px-4"
        style={{ maxWidth: 1300 }}
      >
        <div className="pointer-events-auto flex flex-col items-center gap-6">
          {panoramas.sink.menuOpen && (
            <BottomMenu
              panoramaType="sink"
              onInfoClick={() => setPanelVisible(true)}
              backdropClosing={false}
            />
          )}
          {panoramas.bathtub.menuOpen && (
            <BottomMenu
              panoramaType="bathtub"
              onInfoClick={() => setPanelVisible(true)}
              backdropClosing={false}
            />
          )}
          {panoramas.floor.menuOpen && (
            <BottomMenu
              panoramaType="floor"
              onInfoClick={() => setPanelVisible(true)}
              backdropClosing={false}
            />
          )}
        </div>
      </div>

      {/* Always render InfoPanel (but hidden initially) to preload it */}
      {infoPanelPreloaded && (
        <InfoPanel
          visible={panelVisible}
          onClose={() => {
            setPanelVisible(false);
            setInfoValue(0);
          }}
          value={infoValue}
          setValue={setInfoValue}
          panoramaType={openMenuType ?? undefined}
          modelIndex={selectedModelIndex}
        />
      )}
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
