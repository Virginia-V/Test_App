import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { categories } from "../data/data";
import { useTranslations } from "next-intl";

interface CategoryChipProps {
  category: {
    label: string;
    icon?: string | (() => React.ReactNode); // Updated to accept both string and function
    amount?: number;
  };
  isSelected: boolean;
  onSelect: (label: string) => void;
  t: (key: string) => string;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onSelect,
  t
}) => {
  const baseClasses = [
    "text-xs px-2 py-1.5 rounded-sm font-['Myriad_Pro',sans-serif]",
    "w-full shadow cursor-pointer transition-all duration-100 ease-in-out",
    "hover:scale-105 hover:shadow-md flex items-center justify-center gap-1 sm:gap-2 h-auto",
    "min-w-[100px] max-w-[150px]" // Responsive width constraints
  ];

  const variantClasses = isSelected
    ? "bg-green-500 hover:bg-green-500 shadow text-white"
    : "bg-[#8F4B27] hover:bg-[#8F4B27] text-white";

  const renderIcon = () => {
    if (!category.icon) return null;

    if (typeof category.icon === "function") {
      // For React component icons like Test
      return (
        <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
          {category.icon()}
        </div>
      );
    } else {
      // For string URLs
      return (
        <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
          <AvatarImage
            src={category.icon}
            alt={t(category.label)}
            className="brightness-0 saturate-100 invert"
          />
        </Avatar>
      );
    }
  };

  return (
    <div className="relative inline-block w-full max-w-[160px] text-center">
      <Badge
        variant="secondary"
        onClick={() => onSelect(category.label)}
        className={cn(baseClasses, variantClasses)}
      >
        {renderIcon()}
        <span className="font-bold text-[10px] sm:text-xs leading-tight">
          {t(category.label)}
        </span>
      </Badge>

      <div className="absolute -top-1 sm:-top-3 right-0 sm:-right-1 text-[10px] sm:text-[11px] font-bold bg-gray-300 text-black rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
        {category.amount}
      </div>
    </div>
  );
};

export const TopSection = () => {
  const t = useTranslations("inventoryProduct");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0]?.label || null
  );

  const handleCategorySelect = (categoryLabel: string) => {
    setSelectedCategory((prev) =>
      prev === categoryLabel ? null : categoryLabel
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 justify-items-center mt-5 px-2">
        {categories.map((category, index) => (
          <div key={index} className="flex justify-center w-full">
            <CategoryChip
              category={category}
              isSelected={selectedCategory === category.label}
              onSelect={handleCategorySelect}
              t={t}
            />
          </div>
        ))}
      </div>
      <Separator className="flex-1 border-[var(--color-divider)] border-b-2 mt-4" />
    </div>
  );
};
