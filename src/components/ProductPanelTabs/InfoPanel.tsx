"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { ProductOverview } from "./MainProductTab";
import { InfoProductOverview } from "./InfoProductTab/InfoProductOverview";
import { InventoryProductOverview } from "./InventoryProductTab/InventoryProductOverview";
import { BusinessProductOverview } from "./BusinessProductTab/BusinessProductOverview";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookServiceForm } from "./BookServiceFormTab";
import { getTabIcons } from "@/helpers";
import { TabsComponent } from "./Tabs";

interface InfoPanelProps {
  visible: boolean;
  onClose: () => void;
  value: number;
  setValue: (val: number) => void;
  panoramaType?: "bathtub" | "sink" | "floor";
  modelIndex?: number | null;
}

const getTabs = ({
  panoramaType,
  modelIndex
}: {
  panoramaType?: string;
  modelIndex?: number | null;
}) =>
  getTabIcons().map((icon, index) => ({
    id: `tab-${index}`,
    icon,
    content:
      index === 0 ? (
        <ProductOverview panoramaType={panoramaType} modelIndex={modelIndex} />
      ) : index === 1 ? (
        <InfoProductOverview />
      ) : index === 2 ? (
        <InventoryProductOverview />
      ) : index === 3 ? (
        <BusinessProductOverview />
      ) : index === 4 ? (
        <BookServiceForm />
      ) : null
  }));

export const InfoPanel: React.FC<InfoPanelProps> = ({
  visible,
  onClose,
  value,
  setValue,
  panoramaType,
  modelIndex
}) => {
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

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[1080px] w-full max-h-[90vh] h-[90vh] sm:h-[80vh] lg:h-[600px] p-0 bg-[#EDECEB] [&>button]:hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Product Information Panel</DialogTitle>
        </VisuallyHidden>

        {/* Custom close button with smaller size and minimal focus ring */}
        <div className="absolute top-2 right-2 z-50">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full shadow-md border border-gray-200 transition-all duration-200 hover:scale-105 focus:outline-none  cursor-pointer"
            aria-label="Close panel"
          >
            <X size={16} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsComponent
            tabs={getTabs({
              panoramaType: stableType,
              modelIndex: stableModelIndex
            })}
            value={value}
            onChange={(_, newValue) => setValue(newValue)}
          />
        </div>

        <DialogFooter className="flex flex-row h-10 gap-0 -mb-3 flex-shrink-0">
          <div className="flex-1 bg-[var(--color-caramel)] -ml-[1px] rounded-bl-lg" />
          <div className="flex-1 bg-[var(--color-wood)] -mr-[1px] rounded-br-lg" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
