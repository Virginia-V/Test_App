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
};

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  panoramaType
}) => {
  const { panoramas } = usePanoramaContext();

  // Use utility function to derive type
  const derivedType = useMemo<CategoryType>(
    () => getEffectiveCategoryType(panoramaType, panoramas),
    [panoramaType, panoramas]
  );

  // Use utility function to get image list
  const imageList = useMemo(() => {
    const images = getCategoryModelImages(derivedType);
    return images.map(({ src, label }) => ({ src, label }));
  }, [derivedType]);

  return (
    <div className="ml-4 lg:ml-4 flex justify-center lg:justify-start">
      <CarouselSelector
        imageList={imageList}
        prevIcon={<ArrowLeft />}
        nextIcon={<ArrowRight />}
        itemClassName="rounded-md"
        selectable={false}
        carouselWidthClass="w-[498px]"
        itemWidthClass="w-[150px]"
        itemHeightClass="h-[150px]"
        itemMarginClass="m-2"
      />
    </div>
  );
};
