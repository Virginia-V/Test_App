import { MenuArrowLeft, MenuArrowRight } from "@/assets";
import { CarouselSelector } from "@/components/CarouselSelector";


type CarouselGroupProps = {
  materialImages?: Array<{ src: string }>;
  modelImages?: Array<{ src: string }>;
  destinationImages?: Array<{ src: string }>;
  colorImages?: Array<{ src: string }>; // <-- NEW
  selectedMaterialIndex?: number;
  setSelectedMaterialIndex: (index: number) => void;
  selectedModelIndex?: number;
  onModelSelect: (index: number) => void;
  selectedDestinationIndex?: number;
  onDestinationSelect?: (index: number) => void;
  selectedColorIndex?: number; // <-- NEW
  onColorSelect?: (index: number) => void; // <-- NEW
  isLoading?: boolean;
};

export const CarouselGroup = ({
  materialImages,
  modelImages,
  destinationImages,
  colorImages,
  selectedMaterialIndex,
  setSelectedMaterialIndex,
  selectedModelIndex,
  onModelSelect,
  selectedDestinationIndex,
  onDestinationSelect,
  selectedColorIndex = 0,
  onColorSelect,
  isLoading = false
}: CarouselGroupProps) => {
  // Count visible selectors for responsive layout
  const visibleSelectors = [
    materialImages && materialImages.length > 0,
    modelImages && modelImages.length > 0,
    destinationImages && destinationImages.length > 0
  ].filter(Boolean).length;

  // Adjust gap based on number of selectors - increased spacing
  const getGapClass = () => {
    switch (visibleSelectors) {
      case 1:
        return "justify-center";
      case 2:
        return "gap-y-10 lg:gap-x-28 justify-center";
      default:
        return "gap-y-8 lg:gap-x-28";
    }
  };

  return (
    <div
      className={`
        flex flex-col lg:flex-row
        items-center lg:items-start
        ${getGapClass()}
        px-2 sm:px-10
      `}
    >
      {materialImages && materialImages.length > 0 && (
        <div className="flex-shrink-0">
          <CarouselSelector
            imageList={materialImages}
            selectedIndex={selectedMaterialIndex}
            onSelect={setSelectedMaterialIndex}
            isLoading={isLoading}
          />

          <div className="flex justify-center">
            {colorImages && colorImages.length > 0 && onColorSelect ? (
              <CarouselSelector
                imageList={colorImages}
                selectedIndex={selectedColorIndex}
                onSelect={onColorSelect}
                isLoading={isLoading}
                itemWidthClass="w-[64px]"
                itemHeightClass="h-[64px]"
                itemMarginClass="m-2"
                carouselWidthClass="w-[240px] max-w-full"
                prevIcon={<MenuArrowLeft width={48} height={18} />}
                nextIcon={<MenuArrowRight width={48} height={18} />}
                prevButtonClassName="-left-7"
                nextButtonClassName="-right-9"
              />
            ) : null}
          </div>
        </div>
      )}

      {modelImages && modelImages.length > 0 && (
        <div className="flex-shrink-0">
          <CarouselSelector
            imageList={modelImages}
            selectedIndex={selectedModelIndex}
            onSelect={onModelSelect}
            isLoading={isLoading}
          />
        </div>
      )}

      {destinationImages && destinationImages.length > 0 && (
        <div className="flex-shrink-0">
          <CarouselSelector
            imageList={destinationImages}
            selectedIndex={selectedDestinationIndex}
            onSelect={onDestinationSelect}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
