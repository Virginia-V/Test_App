/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import {
  PanoramaProvider,
  usePanoramaContext
} from "@/context/PanoramaContext";
import { BottomMenu } from "@/components/BottomMenu ";
import { InfoPanel } from "@/components/ProductPanelTabs";
import { KrpanoViewer } from "@/components/KpranoViewer";
import { FullScreenButton } from "@/components/FullScreenButton";

// ============================================================================
// TYPES
// ============================================================================

type PanoramaType = "sink" | "bathtub" | "floor";

// ============================================================================
// CONFIGURATION DATA (kept in same file as requested)
// ============================================================================

const TOUR_CONFIG = {
  xmlUrl: "tours/tour-1-1/tour.xml",
  viewerScriptUrl: "tours/tour-1-1/krpano.js",
  loadsceneFlags: "MERGE|PRELOAD|KEEPVIEW"
} as const;

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function useSelectedModelIndex() {
  const { openMenuType, panoramas } = usePanoramaContext();

  return useMemo(() => {
    if (!openMenuType) return null;
    const part = panoramas[openMenuType];
    return typeof part.modelIndex === "number" ? part.modelIndex : null;
  }, [openMenuType, panoramas]);
}

function useInfoPanelPreloader() {
  const [infoPanelPreloaded, setInfoPanelPreloaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInfoPanelPreloaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return infoPanelPreloaded;
}

function useKrpanoGlobalBridge() {
  const { setMenuOpen, setPanelVisible } = usePanoramaContext();

  useEffect(() => {
    // Set up global bridge functions for krpano → React communication
    (window as any)._krpanoOpenMenu = (type: PanoramaType) => {
      if (type === "sink" || type === "bathtub" || type === "floor") {
        // Only open the menu, not the InfoPanel
        setMenuOpen(type, true);
      }
    };

    (window as any)._krpanoOpenPanel = () => setPanelVisible(true);
    (window as any)._krpanoClosePanel = () => setPanelVisible(false);

    // Cleanup on unmount
    return () => {
      try {
        delete (window as any)._krpanoOpenMenu;
        delete (window as any)._krpanoOpenPanel;
        delete (window as any)._krpanoClosePanel;
      } catch {}
    };
  }, [setMenuOpen, setPanelVisible]);
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function BottomMenuContainer() {
  const { panoramas, setPanelVisible } = usePanoramaContext();

  const menuConfigs = [
    { type: "sink" as const, isOpen: panoramas.sink.menuOpen },
    { type: "bathtub" as const, isOpen: panoramas.bathtub.menuOpen },
    { type: "floor" as const, isOpen: panoramas.floor.menuOpen }
  ];

  return (
    <div
      className="pointer-events-none fixed left-1/2 bottom-5 -translate-x-1/2 z-[1000] w-full px-4"
      style={{ maxWidth: 1300 }}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-6">
        {menuConfigs.map(
          ({ type, isOpen }) =>
            isOpen && (
              <BottomMenu
                key={type}
                panoramaType={type}
                onInfoClick={() => setPanelVisible(true)}
                backdropClosing={false}
              />
            )
        )}
      </div>
    </div>
  );
}

function InfoPanelContainer({
  fullScreenHandle,
  mainRef
}: {
  fullScreenHandle: any;
  mainRef: React.RefObject<HTMLElement | null>;
}) {
  const { panelVisible, setPanelVisible, openMenuType } = usePanoramaContext();
  const selectedModelIndex = useSelectedModelIndex();
  const infoPanelPreloaded = useInfoPanelPreloader();
  const [infoValue, setInfoValue] = useState(0);

  if (!infoPanelPreloaded) return null;

  // Determine the correct portal container based on fullscreen state
  const portalContainer = fullScreenHandle.active ? mainRef.current : undefined; // undefined uses document.body

  return (
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
      portalContainer={portalContainer}
      isFullscreen={fullScreenHandle.active}
    />
  );
}

function SceneUI({
  fullScreenHandle,
  mainRef
}: {
  fullScreenHandle: any;
  mainRef: React.RefObject<HTMLElement | null>;
}) {
  const { selection } = usePanoramaContext();

  // Set up global bridge functions
  useKrpanoGlobalBridge();

  console.log(selection);

  return (
    <>
      <FullScreenButton
        handle={fullScreenHandle}
        position={{ top: 16, right: 16 }}
      />
      <BottomMenuContainer />
      <InfoPanelContainer
        fullScreenHandle={fullScreenHandle}
        mainRef={mainRef}
      />
    </>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const handle = useFullScreenHandle();
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <PanoramaProvider>
      <FullScreen handle={handle}>
        <main ref={mainRef} className="relative h-[100dvh] w-full">
          <KrpanoViewer
            xmlUrl={TOUR_CONFIG.xmlUrl}
            viewerScriptUrl={TOUR_CONFIG.viewerScriptUrl}
            loadsceneFlags={TOUR_CONFIG.loadsceneFlags}
          />
          <SceneUI fullScreenHandle={handle} mainRef={mainRef} />
        </main>
      </FullScreen>
    </PanoramaProvider>
  );
}
