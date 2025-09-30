"use client";

import { usePanoramaContext } from "@/context/PanoramaContext";

export default function SceneTestControls() {
  const { panoramas, updatePanorama } = usePanoramaContext();

  const triggerSceneChange = () => {
    // Change bathtub material to trigger a scene change
    const currentMaterial = panoramas.bathtub.materialIndex ?? 0;
    const newMaterial = currentMaterial === 0 ? 1 : 0;
    
    updatePanorama({
      part: "bathtub",
      patch: { materialIndex: newMaterial }
    });
  };

  const changeSink = () => {
    const currentModel = panoramas.sink.modelIndex ?? 0;
    const newModel = currentModel === 0 ? 1 : 0;
    
    updatePanorama({
      part: "sink", 
      patch: { modelIndex: newModel }
    });
  };

  const changeFloor = () => {
    const currentModel = panoramas.floor.modelIndex ?? 0;
    const newModel = currentModel === 0 ? 1 : 0;
    
    updatePanorama({
      part: "floor",
      patch: { modelIndex: newModel }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: 16,
        borderRadius: 8,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <h3 style={{ margin: 0, fontSize: 14 }}>Test Scene Loading</h3>
      <button
        onClick={triggerSceneChange}
        style={{
          padding: "8px 12px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        Change Bathtub Material
      </button>
      <button
        onClick={changeSink}
        style={{
          padding: "8px 12px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        Change Sink Model
      </button>
      <button
        onClick={changeFloor}
        style={{
          padding: "8px 12px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12
        }}
      >
        Change Floor Model
      </button>
    </div>
  );
}