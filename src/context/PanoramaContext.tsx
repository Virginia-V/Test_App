"use client";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  buildRenderPayloadFromState,
  getInitialPanoramaState,

  getPanoramaFilePath
} from "@/helpers";
import { menu_preview_images } from "@/lib/menu_preview_images";

// ==========================================
// TYPES & INTERFACES
// ==========================================

/**
 * Supported panorama/product types in the application
 */
export type PanoramaType = "bathtub" | "sink" | "floor";

/**
 * State for each panorama type containing current selections and UI state
 */
export interface PanoramaState {
  modelIndex: number; // Currently selected model (0-based index)
  materialIndex: number; // Currently selected material (0-based index)
  colorIndex: number | null; // Currently selected color (null if no colors available)
  menuOpen: boolean; // Whether the bottom menu is currently open for this panorama type
  destinationIndex: number | null; // Currently selected destination (null if not applicable)
}

/**
 * Configuration for hotspots in the 3D panorama scene
 */
export interface HotspotConfig {
  id: PanoramaType; // Unique identifier matching PanoramaType
  name: string; // Display name for the hotspot
  hotspotPosition: [number, number, number]; // 3D position [x, y, z] in the scene
  scale: number; // Scale factor for the hotspot rendering
  isFloorSphere?: boolean; // Whether this represents the floor sphere (special behavior)
  hotspots: {
    yaw: number; // Horizontal rotation angle
    pitch: number; // Vertical rotation angle
  }[];
}

/**
 * Complete context interface providing panorama state, UI controls, and utility functions
 */
export interface PanoramaContextType {
  // ========== DATA STATE ==========
  panoramas: Record<PanoramaType, PanoramaState>; // Current state for each panorama type
  hotspotConfigs: HotspotConfig[]; // Static configuration for all hotspots
  panoramaFilePath: string | null; // Current panorama image file path from server

  // ========== LOADING & ERROR STATES ==========
  isLoading: boolean; // Whether panorama is currently being fetched/loaded
  hasError: boolean; // Whether there was an error loading panorama
  error: Error | null; // Detailed error information if any

  // ========== UI STATE ==========
  showHotspots: boolean; // Whether hotspots are visible in the 3D scene
  panelVisible: boolean; // Whether the info panel modal is open
  infoValue: number; // Current tab index in the info panel
  imagesLoaded: boolean; // Whether panorama images have finished loading
  loadingProgress: number; // Loading progress percentage (0-100)
  selectedCategory: PanoramaType | null; // Currently selected/active category

  // ========== COMPUTED VALUES ==========
  openMenuType: PanoramaType | undefined; // Which panorama type has its menu currently open
  selectedModelIndex: number | null; // Model index for the currently open menu type

  // ========== ACTIONS ==========
  updatePanorama: (type: PanoramaType, updates: Partial<PanoramaState>) => void;
  setMenuOpen: (type: PanoramaType, open: boolean) => void;
  setSelectedCategory: (category: PanoramaType | null) => void;
  setShowHotspots: (show: boolean) => void;
  setPanelVisible: (visible: boolean) => void;
  setInfoValue: (value: number) => void;
  setImagesLoaded: (loaded: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setMenuImagesPreloaded: (preloaded: boolean) => void;
  menuImagesPreloaded: boolean;

  // ========== UTILITY FUNCTIONS ==========
  getSelectedMaterialColors: (
    type: PanoramaType,
    modelIndex: number | null | undefined,
    materialIndex: number | null | undefined
  ) => Array<{ file: string; colorId: string }>;
  materialHasColors: (
    type: PanoramaType,
    modelIndex: number | null | undefined,
    materialIndex: number | null | undefined
  ) => boolean;
  getHotspotConfig: (type: PanoramaType) => HotspotConfig | undefined;
}

// ==========================================
// STATIC CONFIGURATION
// ==========================================

/**
 * Static configuration for all hotspots in the panorama scene
 * Defines 3D positions, scales, and interaction areas for each panorama type
 */
const hotspotConfigs: HotspotConfig[] = [
  {
    id: "floor",
    name: "Floor",
    hotspotPosition: [0, 0, 0],
    scale: 1,
    isFloorSphere: true,
    hotspots: []
  },
  {
    id: "bathtub",
    name: "Bathtub",
    hotspotPosition: [-20, 20, -10],
    scale: 1,
    hotspots: [
      {
        yaw: 45.0,
        pitch: -32.2
      }
    ]
  },
  {
    id: "sink",
    name: "Sink",
    hotspotPosition: [0, 40, 0],
    scale: 1,
    hotspots: [
      {
        yaw: -151.83,
        pitch: Math.PI - (1900.79 * Math.PI) / 180
      }
    ]
  }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Gets available color variants for a specific material in a model
 * Returns empty array for floor type as it doesn't support colors
 */
function getSelectedMaterialColors(
  type: PanoramaType,
  modelIndex: number | null | undefined,
  materialIndex: number | null | undefined
): Array<{ file: string; colorId: string }> {
  if (type === "floor") return [];
  const models = menu_preview_images[type].models;
  const mIdx = modelIndex ?? 0;
  const matIdx = materialIndex ?? 0;
  const model = models[mIdx];
  const mat = model?.materials?.[matIdx];
  const colors = mat?.colors ?? [];
  return colors.map((c) => ({ file: c.file, colorId: c.colorId }));
}

/**
 * Determines if a specific material has color variants available
 * Used to conditionally show/hide color selection UI
 */
function materialHasColors(
  type: PanoramaType,
  modelIndex: number | null | undefined,
  materialIndex: number | null | undefined
): boolean {
  return getSelectedMaterialColors(type, modelIndex, materialIndex).length > 0;
}

// ==========================================
// CONTEXT SETUP
// ==========================================

/**
 * React context for panorama state management
 */
const PanoramaContext = createContext<PanoramaContextType | undefined>(
  undefined
);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

/**
 * PanoramaProvider manages all panorama-related state and provides it to child components
 * Handles panorama selection, loading states, UI interactions, and server communication
 */
export const PanoramaProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  // ========== PANORAMA STATE ==========
  // Initialize with default state from helper function
  const initial = getInitialPanoramaState();
  const [panoramas, setPanoramas] = useState<
    Record<PanoramaType, PanoramaState>
  >(initial.panoramas);

  // ========== UI STATE ==========
  const [showHotspots, setShowHotspots] = useState(true); // Whether 3D hotspots are visible
  const [panelVisible, setPanelVisible] = useState(false); // Whether info panel modal is open
  const [infoValue, setInfoValue] = useState(0); // Active tab in info panel (0-4)
  const [imagesLoaded, setImagesLoaded] = useState(false); // Whether panorama images finished loading
  const [loadingProgress, _setLoadingProgress] = useState(0); // Raw progress state (0-100)
  const [selectedCategory, setSelectedCategory] = useState<PanoramaType | null>(
    null
  ); // Currently active category
  const [menuImagesPreloaded, setMenuImagesPreloaded] = useState(false);

  /**
   * Monotonic progress setter that only allows progress to increase
   * Prevents progress bar from jumping backwards during loading
   */
  const setLoadingProgress = (progress: number) => {
    _setLoadingProgress((prev) => {
      if (progress <= 0) {
        // Reset menu preload state on new panorama
        setMenuImagesPreloaded(false);
        return 0;
      }
      const next = Math.min(100, Math.round(progress));
      return next > prev ? next : prev;
    });
  };

  // ========== PANORAMA UPDATE LOGIC ==========

  /**
   * Updates panorama selection state and triggers new panorama loading when needed
   * Immediately marks images as not loaded for smooth loading overlay transition
   */
  const updatePanorama = (
    type: PanoramaType,
    updates: Partial<PanoramaState>
  ) => {
    const prevForType = panoramas[type];

    // Keys that trigger panorama re-rendering when changed
    const relevantKeys: Array<keyof PanoramaState> = [
      "modelIndex",
      "materialIndex",
      "colorIndex",
      "destinationIndex"
    ];

    // Check if any relevant properties actually changed
    const changed = relevantKeys.some(
      (k) => updates[k] !== undefined && updates[k] !== prevForType[k]
    );

    // Update the state
    setPanoramas((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...updates
      }
    }));

    // If visual changes occurred, reset loading states for smooth transition
    if (changed) {
      setImagesLoaded(false); // Show loading overlay
      _setLoadingProgress(0); // Reset progress to start
    }
  };

  /**
   * Opens or closes the bottom menu for a specific panorama type
   * Also updates the selected category when opening a menu
   */
  const setMenuOpen = (type: PanoramaType, open: boolean) => {
    setPanoramas((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        menuOpen: open
      }
    }));

    // Update selected category when opening/closing menus
    if (open) {
      setSelectedCategory(type);
    } else {
      // Only clear selected category if this was the selected one
      setSelectedCategory((current) => (current === type ? null : current));
    }
  };

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Gets hotspot configuration by panorama type
   */
  const getHotspotConfig = (type: PanoramaType): HotspotConfig | undefined =>
    hotspotConfigs.find((config) => config.id === type);

  // ========== REACT QUERY SETUP ==========

  /**
   * Creates a stable, deterministic cache key based on all panorama state
   * This ensures consistent caching behavior across sessions and prevents unnecessary cache misses
   */
  const queryKey = useMemo(() => {
    const stateHash = Object.entries(panoramas)
      .map(
        ([type, state]) =>
          `${type}:${state.modelIndex}-${state.materialIndex}-${state.colorIndex}-${state.destinationIndex}`
      )
      .sort() // Ensure consistent ordering
      .join("|");
    return ["panorama-file-path", stateHash];
  }, [panoramas]);

  /**
   * React Query configuration for fetching panorama file paths
   * Optimized for aggressive caching and minimal server requests
   */
  const panoramaQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const payload = buildRenderPayloadFromState({
        panoramaId: 1,
        panoramas
      });
      console.log("Fetching panorama file path for payload:", payload);
      return await getPanoramaFilePath(payload);
    },
    enabled: true, // Always enabled to react to state changes

    // ========== AGGRESSIVE CACHING ==========
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - data stays fresh for a full day
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep in memory/storage for a week

    // ========== PREVENT UNNECESSARY REFETCHES ==========
    refetchOnMount: false, // Use cached data on component mount
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    refetchOnReconnect: false, // Don't refetch when network reconnects
    refetchInterval: false, // No background refetching

    // ========== INTELLIGENT RETRY LOGIC ==========
    retry: (failureCount, error: unknown) => {
      // Don't retry client errors (4xx status codes)
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) return false;
      }
      // Retry server errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s

    // ========== PERFORMANCE OPTIMIZATIONS ==========
    notifyOnChangeProps: ["data", "isLoading", "error"], // Only re-render on relevant changes
    placeholderData: (previousData) => previousData // Show previous data while fetching new
  });

  // ========== DERIVED STATE FROM REACT QUERY ==========

  const isQueryLoading = panoramaQuery.isLoading || panoramaQuery.isFetching;
  const currentFilePath = panoramaQuery.data ?? null;
  const hasError = !!panoramaQuery.error;
  const error = panoramaQuery.error as Error | null;

  // ========== COMPUTED VALUES ==========

  /**
   * Determines which panorama type currently has its menu open
   * Used throughout the app to show the correct bottom menu
   */
  const openMenuType = useMemo(
    () =>
      hotspotConfigs.find((cfg) => panoramas[cfg.id].menuOpen)?.id as
        | PanoramaType
        | undefined,
    [panoramas]
  );

  /**
   * Gets the model index for the currently open menu
   * Used by InfoPanel to show the correct product information
   * Floor type returns null as it doesn't have traditional model selection
   */
  const selectedModelIndex = useMemo(() => {
    if (!openMenuType || openMenuType === "floor") return null;
    return panoramas[openMenuType].modelIndex ?? 0;
  }, [openMenuType, panoramas]);

  // ========== CONTEXT VALUE ASSEMBLY ==========

  /**
   * Complete context value providing all panorama state and functions
   * This object is passed to all consuming components
   */
  const contextValue: PanoramaContextType = {
    // ========== DATA STATE ==========
    panoramas, // Current selections for each panorama type
    hotspotConfigs, // Static 3D hotspot configurations
    panoramaFilePath: currentFilePath, // Current panorama image path from server

    // ========== LOADING & ERROR STATES ==========
    isLoading: isQueryLoading, // Whether actively fetching from server
    hasError, // Whether there was a fetch error
    error, // Detailed error information

    // ========== UI STATE ==========
    showHotspots, // 3D hotspot visibility toggle
    panelVisible, // Info panel modal open state
    infoValue, // Active tab in info panel
    imagesLoaded, // Whether panorama images finished loading
    loadingProgress, // Current loading percentage (0-100)
    selectedCategory, // Currently selected/active category

    // ========== COMPUTED VALUES ==========
    openMenuType, // Which panorama type has menu open
    selectedModelIndex, // Model index for open menu type

    // ========== ACTIONS ==========
    updatePanorama, // Update panorama selections
    setMenuOpen, // Control menu visibility
    setSelectedCategory, // Set selected category
    setShowHotspots, // Toggle 3D hotspots
    setPanelVisible, // Control info panel
    setInfoValue, // Set active info panel tab
    setImagesLoaded, // Mark images as loaded
    setLoadingProgress, // Update loading progress
    setMenuImagesPreloaded, // Set menu images preloaded state
    menuImagesPreloaded, // Whether menu images have been preloaded

    // ========== UTILITY FUNCTIONS ==========
    getSelectedMaterialColors, // Get color options for material
    materialHasColors, // Check if material has colors
    getHotspotConfig // Get hotspot config by type

  };

  return (
    <PanoramaContext.Provider value={contextValue}>
      {children}
    </PanoramaContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

/**
 * Hook to access panorama context
 * Must be used within a PanoramaProvider component tree
 *
 * @returns PanoramaContextType - Complete panorama state and functions
 * @throws Error if used outside PanoramaProvider
 */
export const usePanorama = () => {
  const context = useContext(PanoramaContext);
  if (context === undefined) {
    throw new Error("usePanorama must be used within a PanoramaProvider");
  }
  return context;
};
