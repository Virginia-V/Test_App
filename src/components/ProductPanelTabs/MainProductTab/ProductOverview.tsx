import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "./ui/ImagePlaceholder";
import { ProductImageGallery } from "./ui/ProductImageGallery";
import { ProductInfoSection } from "./ui";
import { ProductInfoCategoryKey } from "./data/productInfoMap";

interface ProductOverviewProps {
  panoramaType?: string;
  modelIndex?: number | null;
  categoryId?: number | null | undefined;
  modelId?: number | null | undefined;
  materialId?: number | null | undefined;
  colorId?: number | null | undefined;
}

// Helper to map categoryId to key
const getCategoryKey = (
  categoryId?: number | null
): ProductInfoCategoryKey | undefined => {
  if (categoryId === 1) return "bathtub";
  if (categoryId === 2) return "sink";
  if (categoryId === 3) return "floor";
  return undefined;
};

export const ProductOverview: React.FC<ProductOverviewProps> = ({
  panoramaType,
  modelIndex: propModelIndex,
  categoryId: propCategoryId,
  modelId: propModelId,
  materialId: propMaterialId,
  colorId: propColorId,
}) => {
  // State for selected model and its properties
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(
    propModelIndex!
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    propCategoryId!
  );
  const [selectedModelId, setSelectedModelId] = useState<number | null>(
    propModelId!
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    propMaterialId!
  );
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    propColorId!
  );

  // Use selected values or fallback to props
  const effectiveModelIndex = selectedModelIndex ?? propModelIndex;
  const effectiveCategoryId = selectedCategoryId ?? propCategoryId;
  const effectiveModelId = selectedModelId ?? propModelId;
  const effectiveMaterialId = selectedMaterialId ?? propMaterialId;
  const effectiveColorId = selectedColorId ?? propColorId;

  // Map categoryId to categoryKey
  const categoryKey = getCategoryKey(effectiveCategoryId);

  // Handle model selection from gallery
  const handleModelSelect = (selection: {
    modelIndex: number;
    modelId: string;
    categoryId?: string;
    materialId?: string;
    colorId?: string;
  }) => {
    console.log("🎯 ProductOverview - Model selected:", selection);

    // Update all selection state with proper conversion
    setSelectedModelIndex(selection.modelIndex);
    setSelectedCategoryId(
      selection.categoryId ? Number(selection.categoryId) : null
    );
    setSelectedModelId(Number(selection.modelId));
    setSelectedMaterialId(
      selection.materialId ? Number(selection.materialId) : null
    );
    setSelectedColorId(selection.colorId ? Number(selection.colorId) : null);

    console.log("🔄 ProductOverview - State updated to:", {
      categoryId: selection.categoryId ? Number(selection.categoryId) : null,
      modelId: Number(selection.modelId),
      materialId: selection.materialId ? Number(selection.materialId) : null,
      colorId: selection.colorId ? Number(selection.colorId) : null
    });
  };

  console.log("📊 ProductOverview - Current effective values:", {
    effectiveCategoryId,
    effectiveModelId,
    effectiveMaterialId,
    effectiveColorId,
  });

  return (
    <div
      className={cn(
        "flex gap-4 md:gap-6 lg:gap-15",
        "flex-col lg:flex-row",
        "items-stretch lg:items-start",
        "w-full p-4"
      )}
    >
      <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-[400px] lg:min-w-[300px]">
        <ImagePlaceholder
          panoramaType={panoramaType}
          modelIndex={effectiveModelIndex}
          categoryId={effectiveCategoryId}
          modelId={effectiveModelId}
          materialId={effectiveMaterialId}
          colorId={effectiveColorId}
        />
      </div>

      <div className="flex flex-col gap-5 md:gap-6 lg:gap-15 flex-1 min-w-0">
        {/* Pass categoryKey and modelId as props */}
        {categoryKey && effectiveModelId != null && (
          <ProductInfoSection
            categoryKey={categoryKey}
            modelId={effectiveModelId}
          />
        )}
        <ProductImageGallery
          panoramaType={panoramaType}
          modelIndex={effectiveModelIndex}
          categoryId={effectiveCategoryId}
          onModelSelect={handleModelSelect}
        />
      </div>
    </div>
  );
};
