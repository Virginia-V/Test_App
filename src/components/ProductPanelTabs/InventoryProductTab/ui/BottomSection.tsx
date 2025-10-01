import React, { useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { inventoryItems } from "../data";
import { useTranslations } from "next-intl";

interface FilterOption {
  value: string;
  label: string;
}

interface InventoryItemProps {
  item: {
    label: string;
    amount?: number;
  };
  isSelected: boolean;
  onSelect: (label: string) => void;
  t: (key: string) => string;
}

interface FilterButtonProps {
  t: (key: string) => string;
  onFilterSelect: (value: string) => void;
  selectedFilters: string[];
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
}

interface ActiveFiltersProps {
  filters: string[];
  onRemoveFilter: (filter: string) => void;
  onClearAll: () => void;
  t: (key: string) => string;
}

const filterOptions: FilterOption[] = [
  { value: "category", label: "Category" },
  { value: "price", label: "Price" },
  { value: "availability", label: "Availability" },
  { value: "brand", label: "Brand" },
  { value: "color", label: "Color" }
];

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  isSelected,
  onSelect,
  t
}) => {
  const baseClasses = [
    "text-xs px-2 py-1.5 rounded-sm font-['Myriad_Pro',sans-serif] shadow cursor-pointer",
    "transition-all duration-100 ease-in-out hover:scale-105 hover:shadow-md",
    "flex items-center justify-center gap-1 h-auto"
  ];

  const variantClasses = isSelected
    ? "bg-[#5EAC24] hover:bg-[#5EAC24] shadow text-white"
    : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200";

  return (
    <Badge
      variant="secondary"
      onClick={() => onSelect(item.label)}
      className={cn(baseClasses, variantClasses)}
    >
      <span className="font-bold">
        {t(item.label)} ({item.amount})
      </span>
    </Badge>
  );
};

const FilterButton: React.FC<FilterButtonProps> = ({
  t,
  onFilterSelect,
  selectedFilters
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="bg-gray-100 hover:bg-gray-200 border-gray-200 text-black px-3 py-1.5 rounded-sm shadow-sm transition-colors duration-200 cursor-pointer"
      >
        <span className="font-bold text-[13px]">{t("filterBy")}</span>
        <ArrowDropDownIcon className="ml-1 h-4 w-4" />
        <FilterListIcon className="ml-1 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="rounded-sm shadow-lg">
      {filterOptions.map((option) => (
        <DropdownMenuItem
          key={option.value}
          onClick={() => onFilterSelect(option.value)}
          disabled={selectedFilters.includes(option.value)}
          className={cn(
            "text-sm cursor-pointer hover:bg-gray-100",
            selectedFilters.includes(option.value)
              ? "text-gray-400 cursor-not-allowed"
              : "text-black"
          )}
        >
          {t(`filters.${option.value}`)}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const SearchField: React.FC<SearchFieldProps> = ({ value, onChange, t }) => (
  <div className="relative w-[180px]">
    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
    <Input
      type="text"
      placeholder={t("search")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-9 py-1.5 bg-gray-100 border-gray-200 rounded-sm text-sm focus:border-gray-400 hover:border-gray-300"
    />
  </div>
);

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  t
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Badge
          key={filter}
          variant="secondary"
          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-sm"
        >
          {t(`filters.${filter}`)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFilter(filter)}
            className="ml-1 h-auto p-0 hover:bg-transparent cursor-pointer"
          >
            <ClearIcon fontSize="small" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-auto p-1 text-gray-600 hover:bg-gray-200 cursor-pointer"
      >
        <ClearIcon fontSize="small" />
      </Button>
    </div>
  );
};

export const BottomSection: React.FC = () => {
  const t = useTranslations("inventoryProduct");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string | null>(
    inventoryItems[0]?.label ?? null
  );

  const handleFilterSelect = (filterValue: string) => {
    if (!selectedFilters.includes(filterValue)) {
      setSelectedFilters((prev) => [...prev, filterValue]);
    }
  };

  const handleFilterRemove = (filterValue: string) => {
    setSelectedFilters((prev) =>
      prev.filter((filter) => filter !== filterValue)
    );
  };

  const handleClearAllFilters = () => {
    setSelectedFilters([]);
  };

  const handleItemClick = (itemLabel: string) => {
    setSelectedItem((prev) => (prev === itemLabel ? null : itemLabel));
  };

  return (
    <div className="mt-2 mb-2">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-5 p-2 gap-4">
        {/* Inventory Items */}
        <div className="flex items-center flex-wrap gap-3">
          {inventoryItems.map((item, index) => (
            <InventoryItem
              key={index}
              item={item}
              isSelected={selectedItem === item.label}
              onSelect={handleItemClick}
              t={t}
            />
          ))}
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
          <FilterButton
            t={t}
            onFilterSelect={handleFilterSelect}
            selectedFilters={selectedFilters}
          />
          <SearchField value={searchQuery} onChange={setSearchQuery} t={t} />
        </div>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="px-4 pb-2">
          <ActiveFilters
            filters={selectedFilters}
            onRemoveFilter={handleFilterRemove}
            onClearAll={handleClearAllFilters}
            t={t}
          />
        </div>
      )}

      <Separator className="w-full border-[var(--color-divider)] border-b-2 mt-4" />
    </div>
  );
};
