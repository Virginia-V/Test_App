/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { usePanoramaContext } from "@/context/PanoramaContext";

import { ProductOverview } from "./MainProductTab";
import { InfoProductOverview } from "./InfoProductTab/InfoProductOverview";
import { InventoryProductOverview } from "./InventoryProductTab/InventoryProductOverview";
import { BusinessProductOverview } from "./BusinessProductTab/BusinessProductOverview";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookServiceForm } from "./BookServiceFormTab";
import { getTabIcons } from "@/helpers";
import { TabsComponent } from "./Tabs";
import { cn } from "@/lib/utils";

interface InfoPanelProps {
  visible: boolean;
  onClose: () => void;
  value: number;
  setValue: (val: number) => void;
  panoramaType?: "bathtub" | "sink" | "floor";
  modelIndex?: number | null;
  portalContainer?: HTMLElement | null;
  isFullscreen?: boolean;
}

const getTabs = ({
  panoramaType,
  modelIndex,
  selectionDetails,
}: {
  panoramaType?: string;
  modelIndex?: number | null;
  selectionDetails: any;
}) => {
  return getTabIcons().map((icon, index) => ({
    id: `tab-${index}`,
    icon,
    content: (() => {
      switch (index) {
        case 0:
          return (
            <ProductOverview
              panoramaType={panoramaType}
              modelIndex={modelIndex}
              categoryId={selectionDetails?.categoryId}
              modelId={selectionDetails?.modelId}
              materialId={selectionDetails?.materialId}
              colorId={selectionDetails?.colorId}
            />
          );
        case 1:
          return <InfoProductOverview />;
        case 2:
          return <InventoryProductOverview />;
        case 3:
          return <BusinessProductOverview />;
        case 4:
          return <BookServiceForm />;
        default:
          return null;
      }
    })()
  }));
};

export const InfoPanel: React.FC<InfoPanelProps> = ({
  visible,
  onClose,
  value,
  setValue,
  panoramaType,
  modelIndex,
  portalContainer,
  isFullscreen = false
}) => {
  const { getCurrentSelectionDetails } = usePanoramaContext();

  // Preserve the last known type/modelIndex so InfoPanel keeps showing the correct content
  // even after the BottomMenu closes (which toggles menuOpen=false).
  const lastTypeRef = useRef<"bathtub" | "sink" | "floor" | undefined>(
    panoramaType
  );
  const lastModelIndexRef = useRef<number | null>(modelIndex ?? null);

  useEffect(() => {
    if (panoramaType) lastTypeRef.current = panoramaType;
  }, [panoramaType]);

  useEffect(() => {
    if (typeof modelIndex === "number") lastModelIndexRef.current = modelIndex;
  }, [modelIndex]);

  const stableType = panoramaType ?? lastTypeRef.current;
  const stableModelIndex =
    typeof modelIndex === "number" ? modelIndex : lastModelIndexRef.current;

  // Get the current selection details for the active panorama type
  const allSelectionDetails = getCurrentSelectionDetails();
  const currentSelectionDetails = stableType
    ? allSelectionDetails[stableType]
    : null;

  console.log("InfoPanel - Current selection details:", {
    stableType,
    currentSelectionDetails,
    allSelectionDetails,
    portalContainer,
    isFullscreen,
    visible
  });

  if (!visible) return null;

  const dialogContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        isFullscreen ? "z-[99999]" : ""
      )}
      style={isFullscreen ? { zIndex: 99999 } : undefined}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog Content */}
      <div
        className={cn(
          "relative bg-[#EDECEB] rounded-lg shadow-xl",
          "sm:max-w-[95vw] lg:max-w-[1080px] w-full max-h-[90vh] h-[90vh] sm:h-[80vh] lg:h-[600px]",
          "flex flex-col p-0"
        )}
      >
        <VisuallyHidden>
          <div>Product Information Panel</div>
        </VisuallyHidden>

        {/* Custom close button */}
        <div className="absolute top-2 right-2 z-50">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full shadow-md border border-gray-200 transition-all duration-200 hover:scale-105 focus:outline-none cursor-pointer"
            aria-label="Close panel"
          >
            <X size={16} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsComponent
            tabs={getTabs({
              panoramaType: stableType,
              modelIndex: stableModelIndex,
              selectionDetails: currentSelectionDetails,
            })}
            value={value}
            onChange={(_, newValue) => setValue(newValue)}
          />
        </div>

        <div className="flex flex-row h-10 gap-0 -mb-3 flex-shrink-0">
          <div className="flex-1 bg-[var(--color-caramel)] -ml-[1px] rounded-bl-lg" />
          <div className="flex-1 bg-[var(--color-wood)] -mr-[1px] rounded-br-lg" />
        </div>
      </div>
    </div>
  );

  // Use createPortal to render in the correct container
  const targetContainer = portalContainer || document.body;

  return createPortal(dialogContent, targetContainer);
};
