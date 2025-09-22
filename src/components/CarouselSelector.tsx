"use client";
import * as React from "react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

interface CarouselImageItem {
  src: string;
  label?: string;
}

interface CarouselSelectorProps {
  imageList: CarouselImageItem[];
  prevIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  itemClassName?: string;
  selectable?: boolean;
  carouselWidthClass?: string;
  itemWidthClass?: string;
  itemHeightClass?: string;
  itemMarginClass?: string;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  isLoading?: boolean;
  prevButtonClassName?: string;
  nextButtonClassName?: string;
}

export const CarouselSelector = ({
  imageList,
  prevIcon,
  nextIcon,
  itemClassName = "rounded-full",
  selectable = true,
  carouselWidthClass = "w-[288px] max-w-full",
  itemWidthClass = "w-[80px]",
  itemHeightClass = "h-[80px]",
  itemMarginClass = "m-2",
  selectedIndex = null,
  onSelect,
  isLoading = false,
  prevButtonClassName,
  nextButtonClassName
}: CarouselSelectorProps) => {
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(
    selectedIndex
  );

  React.useEffect(() => {
    setSelectedIdx(selectedIndex);
  }, [selectedIndex]);

  if (isLoading) {
    return (
      <div
        className={
          carouselWidthClass + " flex items-center justify-center gap-4"
        }
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className={`${itemWidthClass} ${itemHeightClass} ${itemMarginClass} rounded-full bg-gray-200 aspect-square`}
          />
        ))}
      </div>
    );
  }

  return (
    <Carousel
      className={carouselWidthClass}
      opts={{ containScroll: "trimSnaps" }}
    >
      <CarouselContent>
        {imageList.map((item, index) => (
          <CarouselItem key={index} className="basis-auto">
            <div
              className={`relative flex items-center justify-center overflow-hidden ${itemWidthClass} ${itemHeightClass} ${itemMarginClass} rounded-full cursor-pointer transition-shadow ${itemClassName} ${
                selectable && selectedIdx === index
                  ? "ring-4 ring-[#4b2a14] ring-opacity-100 shadow-[0_0_12px_rgba(0,0,0,0.1)]"
                  : ""
              }`}
              onClick={
                selectable
                  ? () => {
                      setSelectedIdx(index);
                      onSelect?.(index);
                    }
                  : undefined
              }
            >
              <Image
                src={item.src}
                alt={`Image ${index + 1}`}
                className="object-cover"
                quality={100}
                fill
                unoptimized={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
            {item.label && (
              <div className="text-center mt-2">
                <span className="text-black font-['PT Sans'] text-[13px] font-normal leading-[23px] block">
                  {item.label}
                </span>
              </div>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>

      {imageList.length > 1 && (
        <>
          <CarouselPrevious icon={prevIcon} className={prevButtonClassName} />
          <CarouselNext icon={nextIcon} className={nextButtonClassName} />
        </>
      )}
    </Carousel>
  );
};
