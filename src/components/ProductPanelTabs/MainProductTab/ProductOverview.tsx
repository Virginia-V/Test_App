import { cn } from "@/lib/utils";
import {
  ImagePlaceholder,
  ProductImageGallery,
  ProductInfoSection
} from "./ui";

interface ProductOverviewProps {
  panoramaType?: string;
  modelIndex?: number | null;
  categoryId?: number | null | undefined;
  modelId?: number | null | undefined;
  materialId?: number | null | undefined;
  colorId?: number | null | undefined;
}

export const ProductOverview = ({
  panoramaType,
  modelIndex,
  categoryId,
  modelId,
  materialId,
  colorId
}: ProductOverviewProps) => {
  console.log("ProductOverview props:", {
    panoramaType,
    modelIndex,
    categoryId,
    modelId,
    materialId,
    colorId
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
          modelIndex={modelIndex}
          categoryId={categoryId}
          modelId={modelId}
          materialId={materialId}
          colorId={colorId}
        />
      </div>

      <div className="flex flex-col gap-5 md:gap-6 lg:gap-15 flex-1 min-w-0">
        <ProductInfoSection />
        <ProductImageGallery
          panoramaType={panoramaType}
          modelIndex={modelIndex}
        />
      </div>
    </div>
  );
};
