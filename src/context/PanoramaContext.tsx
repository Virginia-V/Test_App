"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback
} from "react";

import {
  findSceneIdFromMetadata,
  type Selection as SceneSelection,
  type SceneRow,
  Nullable
} from "@/lib/sceneMatcher";
import { menu_preview_images } from "@/lib/menu_preview_images";

/* ----------------------------- Types & State ----------------------------- */

type PartState = {
  modelIndex?: number | null;
  materialIndex?: number | null;
  colorIndex?: number | null; // null = explicit "no color", undefined = wildcard
  menuOpen?: boolean; // bottom menu visibility for this part
};

export type PanoramaState = {
  bathtub: PartState;
  sink: PartState;
  floor: PartState;
};

type UpdatePart =
  | { part: "bathtub" | "sink" | "floor"; patch: Partial<PartState> }
  | { part: "reset" };

type PanoramaContextValue = {
  panoramas: PanoramaState;
  updatePanorama: (u: UpdatePart) => void;
  currentSceneId: string | null;
  selection: SceneSelection; // Add this

  // UI panel/menu controls
  panelVisible: boolean;
  setPanelVisible: (visible: boolean) => void;
  setMenuOpen: (part: "bathtub" | "sink" | "floor", open: boolean) => void;
  openMenuType: "bathtub" | "sink" | "floor" | null;

  // Add helper to get current selection details
  getCurrentSelectionDetails: () => {
    bathtub: {
      panoramaType: "bathtub";
      categoryId: Nullable<number>; // Changed from number | undefined
      modelId: Nullable<number>; // Changed from number | undefined and removed optional
      materialId: Nullable<number>; // Changed from number | undefined and removed optional
      colorId: Nullable<number>; // Changed from number | null | undefined and removed optional
    };
    sink: {
      panoramaType: "sink";
      categoryId: Nullable<number>; // Changed from number | undefined
      modelId: Nullable<number>; // Changed from number | undefined and removed optional
      materialId: Nullable<number>; // Changed from number | undefined and removed optional
    };
    floor: {
      panoramaType: "floor";
      categoryId: Nullable<number>; // Changed from number | undefined
      modelId: Nullable<number>; // Changed from number | undefined and removed optional
    };
  };
};

/* ------------------------------- Context -------------------------------- */

const PanoramaContext = createContext<PanoramaContextValue | undefined>(
  undefined
);

export const usePanoramaContext = () => {
  const ctx = useContext(PanoramaContext);
  if (!ctx) {
    throw new Error(
      "usePanoramaContext must be used within a PanoramaProvider"
    );
  }
  return ctx;
};

/* ----------------------------- Helpers ---------------------------------- */

/**
 * Map real IDs from menu_preview_images to indices (for UI state).
 */
function findIndicesByIds(
  type: "bathtub" | "sink" | "floor",
  modelId?: string | number,
  materialId?: string | number,
  colorId?: string | number | null
): { modelIndex?: number; materialIndex?: number; colorIndex?: number | null } {
  const models = menu_preview_images[type].models;

  const modelIndex = modelId
    ? models.findIndex((m) => m.modelId === String(modelId))
    : undefined;

  const materialIndex =
    modelIndex != null && modelIndex >= 0 && materialId
      ? models[modelIndex].materials?.findIndex(
          (mat) => mat.materialId === String(materialId)
        )
      : undefined;

  const colorIndex =
    materialIndex != null &&
    materialIndex >= 0 &&
    models[modelIndex!]?.materials?.[materialIndex]?.colors
      ? colorId === null
        ? null // explicit "no color"
        : models[modelIndex!]?.materials?.[materialIndex]?.colors?.findIndex(
            (c) => c.colorId === String(colorId)
          )
      : undefined;

  return { modelIndex, materialIndex, colorIndex };
}

/* ------------------------------ Provider -------------------------------- */

// Initial state (matches required IDs: Bathtub C1M1Mat1, Sink C2M4Mat10, Floor C3M7)
const initialState: PanoramaState = {
  bathtub: { ...findIndicesByIds("bathtub", 2, 4, null), menuOpen: false },
  sink: { ...findIndicesByIds("sink", 5, 13), menuOpen: false },
  floor: { ...findIndicesByIds("floor", 9), menuOpen: false }
};

export function PanoramaProvider({ children }: PropsWithChildren) {
  const [panoramas, setPanoramas] = useState<PanoramaState>(initialState);
  const [allScenes, setAllScenes] = useState<SceneRow[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

  // global info/details panel
  const [panelVisible, setPanelVisible] = useState<boolean>(false);

  // Load all scene metadata
  useEffect(() => {
    fetch("/all-scenes-metadata.json")
      .then((res) => res.json())
      .then((data: SceneRow[]) => setAllScenes(data))
      .catch((err) => {
        console.error("Failed to load all-scenes-metadata.json", err);
        setAllScenes([]);
      });
  }, []);

  const updatePanorama = (u: UpdatePart) => {
    if (u.part === "reset") {
      setPanoramas(initialState);
      setPanelVisible(false);
      return;
    }
    setPanoramas((prev) => ({
      ...prev,
      [u.part]: { ...prev[u.part], ...u.patch }
    }));
  };

  /* --------------------------- Menu open/close ---------------------------- */

  const [openMenuType, setOpenMenuType] = useState<
    "bathtub" | "sink" | "floor" | null
  >(null);

  const setMenuOpen = useCallback(
    (type: "bathtub" | "sink" | "floor", open: boolean) => {
      if (open) {
        // When opening a menu, close all other menus first
        setPanoramas((prev) => ({
          ...prev,
          bathtub: { ...prev.bathtub, menuOpen: type === "bathtub" },
          sink: { ...prev.sink, menuOpen: type === "sink" },
          floor: { ...prev.floor, menuOpen: type === "floor" }
        }));
        setOpenMenuType(type);
      } else {
        // When closing, only close the specific menu
        setPanoramas((prev) => ({
          ...prev,
          [type]: { ...prev[type], menuOpen: false }
        }));
        if (openMenuType === type) {
          setOpenMenuType(null);
        }
      }
    },
    [openMenuType]
  );

  /* --------------------- Selection → SceneId side-effect -------------------- */

  const selection: SceneSelection = useMemo(() => {
    const models = menu_preview_images;

    const bathtubModel =
      panoramas.bathtub.modelIndex != null
        ? models.bathtub.models[panoramas.bathtub.modelIndex]
        : undefined;
    const bathtubMaterial =
      bathtubModel?.materials?.[panoramas.bathtub.materialIndex ?? -1];
    const bathtubColor =
      bathtubMaterial?.colors?.[panoramas.bathtub.colorIndex ?? -1];

    const sinkModel =
      panoramas.sink.modelIndex != null
        ? models.sink.models[panoramas.sink.modelIndex]
        : undefined;
    const sinkMaterial =
      sinkModel?.materials?.[panoramas.sink.materialIndex ?? -1];

    const floorModel =
      panoramas.floor.modelIndex != null
        ? models.floor.models[panoramas.floor.modelIndex]
        : undefined;

    return {
      bathtub: {
        category_id: Number(models.bathtub.categoryId),
        model_id: bathtubModel ? Number(bathtubModel.modelId) : undefined,
        material_id: bathtubMaterial
          ? Number(bathtubMaterial.materialId)
          : undefined,
        color_id:
          panoramas.bathtub.colorIndex === null
            ? null
            : bathtubColor
              ? Number(bathtubColor.colorId)
              : undefined
      },
      sink: {
        category_id: Number(models.sink.categoryId),
        model_id: sinkModel ? Number(sinkModel.modelId) : undefined,
        material_id: sinkMaterial ? Number(sinkMaterial.materialId) : undefined,
        color_id: undefined // no colors yet
      },
      floor: {
        category_id: Number(models.floor.categoryId),
        model_id: floorModel ? Number(floorModel.modelId) : undefined
      }
    };
  }, [panoramas]);

  useEffect(() => {
    if (!allScenes.length) return;
    const sceneId = findSceneIdFromMetadata(selection, allScenes);
    setCurrentSceneId(sceneId);
    console.log("[SceneMatcher] selection →", selection);
    console.log("[SceneMatcher] sceneId →", sceneId);
  }, [selection, allScenes]);

  // Add this helper function
  const getCurrentSelectionDetails = useCallback(() => {
    return {
      bathtub: {
        panoramaType: "bathtub" as const,
        categoryId: selection.bathtub.category_id,
        modelId: selection.bathtub.model_id,
        materialId: selection.bathtub.material_id,
        colorId: selection.bathtub.color_id
      },
      sink: {
        panoramaType: "sink" as const,
        categoryId: selection.sink.category_id,
        modelId: selection.sink.model_id,
        materialId: selection.sink.material_id
      },
      floor: {
        panoramaType: "floor" as const,
        categoryId: selection.floor.category_id,
        modelId: selection.floor.model_id
      }
    };
  }, [selection]);

  const value = useMemo<PanoramaContextValue>(
    () => ({
      panoramas,
      updatePanorama,
      currentSceneId,
      selection, // Add this
      panelVisible,
      setPanelVisible,
      setMenuOpen,
      openMenuType,
      getCurrentSelectionDetails // Add this
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      panoramas,
      currentSceneId,
      selection,
      panelVisible,
      getCurrentSelectionDetails
    ]
  );

  // Add this debug code temporarily
  useEffect(() => {
    console.log("=== DEBUG: Available models ===");
    console.log(
      "Bathtub models:",
      menu_preview_images.bathtub.models.map((m) => ({
        modelId: m.modelId,
        materials: m.materials?.map((mat) => ({
          materialId: mat.materialId,
          colors: mat.colors?.map((c) => c.colorId)
        }))
      }))
    );
    console.log(
      "Sink models:",
      menu_preview_images.sink.models.map((m) => ({
        modelId: m.modelId,
        materials: m.materials?.map((mat) => mat.materialId)
      }))
    );
    console.log(
      "Floor models:",
      menu_preview_images.floor.models.map((m) => ({
        modelId: m.modelId
      }))
    );
  }, []);

  return (
    <PanoramaContext.Provider value={value}>
      {children}
    </PanoramaContext.Provider>
  );
}
