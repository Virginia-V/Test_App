import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "@/assets";
import { usePanoramaContext } from "@/context/PanoramaContext";
import {
  CategoryType,
  getCategoryModelImages,
  getEffectiveCategoryType
} from "@/helpers";
import { CarouselSelector } from "@/components/CarouselSelector";

type ProductImageGalleryProps = {
  panoramaType?: string;
  modelIndex?: number | null;
  categoryId?: number | null | undefined;
  onModelSelect?: (selection: {
    modelIndex: number;
    modelId: string;
    categoryId?: string;
    materialId?: string;
    colorId?: string;
  }) => void;
};

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  panoramaType,
  modelIndex,
  categoryId,
  onModelSelect
}) => {
  const { panoramas } = usePanoramaContext();

  // Use utility function to derive type
  const derivedType = useMemo<CategoryType>(
    () => getEffectiveCategoryType(panoramaType, panoramas),
    [panoramaType, panoramas]
  );

  // Keep ALL properties from getCategoryModelImages - don't filter them out
  const imageListWithIds = useMemo(() => {
    const images = getCategoryModelImages(derivedType);

    // 📊 Log detailed data for each image
    console.log("=== IMAGE LIST WITH IDS ===");
    images.forEach((image, index) => {
      console.log(`Image ${index}:`, {
        modelIndex: index,
        modelId: image.modelId,
        categoryId: image.categoryId,
        materialId: image.materialId,
        colorId: image.colorId,
        src: image.src,
        label: image.label
      });
    });
    console.log("========================");

    return images;
  }, [derivedType]);

  // Create a version for CarouselSelector (which only needs src and label)
  const imageListForCarousel = useMemo(() => {
    return imageListWithIds.map(({ src, label }) => ({ src, label }));
  }, [imageListWithIds]);

  // Handle selection with all IDs - ADD DEBUGGING
  const handleSelect = (index: number) => {
    console.log(
      "🚨 ProductImageGallery handleSelect called with index:",
      index
    );
    console.log("📞 onModelSelect function exists:", !!onModelSelect);

    const selectedImage = imageListWithIds[index];
    console.log("🔍 Selected image data:", selectedImage);

    if (selectedImage && onModelSelect) {
      const selectionData = {
        modelIndex: index,
        modelId: selectedImage.modelId,
        categoryId: selectedImage.categoryId,
        materialId: selectedImage.materialId,
        colorId: selectedImage.colorId
      };

      // 🎯 Log selection data when user clicks
      console.log("🎯 SELECTED IMAGE DATA:", selectionData);

      onModelSelect(selectionData);
    } else {
      console.log("❌ Selection failed:", {
        hasSelectedImage: !!selectedImage,
        hasOnModelSelect: !!onModelSelect,
        selectedImage
      });
    }
  };

  // 📋 Summary logging
  console.log("📊 Gallery Summary:", {
    derivedType,
    totalImages: imageListWithIds.length,
    currentModelIndex: modelIndex,
    currentCategoryId: categoryId,
    hasOnModelSelect: !!onModelSelect
  });

  return (
    <div className="ml-4 lg:ml-4 flex justify-center lg:justify-start">
      <CarouselSelector
        imageList={imageListForCarousel}
        prevIcon={<ArrowLeft />}
        nextIcon={<ArrowRight />}
        itemClassName="rounded-md"
        selectable={true}
        selectedIndex={modelIndex}
        onSelect={handleSelect} // This should work the same as in CarouselGroup
        carouselWidthClass="w-[498px]"
        itemWidthClass="w-[150px]"
        itemHeightClass="h-[150px]"
        itemMarginClass="m-2"
      />
    </div>
  );
};
