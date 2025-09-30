import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { INVENTORY_CHAIR_IMAGES, PRODUCT_ICONS } from "@/lib";

interface ImageCardProps {
  image: string;
  index: number;
  productCode: string;
}

interface ActionButtonProps {
  icon: string;
  alt: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, alt, onClick }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="h-9 w-9 p-0 opacity-80 hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm hover:bg-white/30"
  >
    <div className="relative w-6 h-6">
      <Image
        src={icon}
        alt={alt}
        fill
        sizes="24px"
        className="object-contain"
      />
    </div>
  </Button>
);

const ImageCard: React.FC<ImageCardProps> = ({ image, index, productCode }) => {
  const handleStarClick = () => {
    // Handle star/favorite functionality
    console.log(`Starred item ${productCode}`);
  };

  const handleShareClick = () => {
    // Handle share functionality
    console.log(`Shared item ${productCode}`);
  };

  return (
    <div className="flex flex-col items-center">
      <Card className="relative w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={image}
              alt={`Inventory Item ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover rounded-sm"
              priority={index < 3}
            />
          </div>

          <div className="absolute bottom-1.5 left-1.5 flex gap-1">
            <ActionButton
              icon={PRODUCT_ICONS.Star_Btn_Icon.src}
              alt="Star"
              onClick={handleStarClick}
            />
            <ActionButton
              icon={PRODUCT_ICONS.Share_Btn_Icon.src}
              alt="Share"
              onClick={handleShareClick}
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-black mt-1.5 text-center font-medium">
        {productCode}
      </p>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-[300px]">
    <Loader2 className="h-8 w-8 animate-spin text-[#8F4B27]" />
  </div>
);

export const ImagesSection: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const images = Object.values(INVENTORY_CHAIR_IMAGES);

  return (
    <div className="p-3 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <ImageCard
            key={index}
            image={image.src}
            index={index}
            productCode="A238095PO"
          />
        ))}
      </div>
    </div>
  );
};
