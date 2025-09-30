import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

// Types
export interface Section {
  label: string;
  values: string[];
  icon: string;
}

export interface InfoItem {
  label: string;
  value: string;
  icon: string;
}

export interface AddressEntry {
  company?: string;
  country: string;
  street: string;
  city: string;
  phone: string;
}

interface SectionChipProps {
  section: Section;
  isLeft?: boolean;
}

// Constants
const BUSINESS_VALUES_PREFIX = "businessValues.";
const ICON_SIZE = 24;

// Utility functions
export const pairSections = (
  left: Section[],
  right: Section[]
): Array<{ left?: Section; right?: Section }> => {
  const maxLength = Math.max(left.length, right.length);

  return Array.from({ length: maxLength }, (_, index) => ({
    left: left[index],
    right: right[index]
  }));
};

// Component for the icon with badge
const IconBadge: React.FC<{
  icon: string;
  label: string;
  translatedLabel: string;
}> = ({ icon, translatedLabel }) => (
  <div className="relative inline-flex items-center mr-4 flex-shrink-0">
    <Image
      src={icon}
      alt={`${translatedLabel} icon`}
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="absolute -top-3 -left-2 rounded-full bg-white p-0.5 shadow-sm z-10 border border-black"
    />
    <Badge className="w-[140px] bg-[var(--color-caramel)] text-white font-['Myriad_Pro',sans-serif] text-[11px] font-semibold rounded-sm whitespace-nowrap overflow-hidden text-ellipsis py-1 px-2">
      {translatedLabel}
    </Badge>
  </div>
);

// Component for value badges
const ValueBadges: React.FC<{
  values: string[];
  getDisplayValue: (value: string) => string;
}> = ({ values, getDisplayValue }) => (
  <div className="flex flex-wrap gap-1 flex-1">
    {values.map((value, index) => (
      <Badge
        key={`value-${index}`}
        variant="secondary"
        className="bg-gray-300 text-gray-700 font-['Myriad_Pro',sans-serif] text-[11px] rounded-sm py-1 px-3"
      >
        {getDisplayValue(value)}
      </Badge>
    ))}
  </div>
);

// Custom hook for translation logic
const useTranslationHelper = () => {
  const tBusinessInfo = useTranslations("businessInfo");
  const tBusinessValues = useTranslations("businessValues");

  const getDisplayValue = (value: string): string => {
    // Check direct business values translation
    if (tBusinessValues.has(value)) {
      return tBusinessValues(value);
    }

    // Check direct business info translation
    if (tBusinessInfo.has(value)) {
      return tBusinessInfo(value);
    }

    // Check prefixed business values
    if (value.startsWith(BUSINESS_VALUES_PREFIX)) {
      const key = value.replace(BUSINESS_VALUES_PREFIX, "");
      if (tBusinessValues.has(key)) {
        return tBusinessValues(key);
      }
    }

    // Return original value if no translation found
    return value;
  };

  return {
    tBusinessInfo,
    getDisplayValue
  };
};

// Main Component
export const SectionChip: React.FC<SectionChipProps> = ({ section }) => {
  const { tBusinessInfo, getDisplayValue } = useTranslationHelper();

  const translatedLabel = tBusinessInfo(section.label);

  return (
    <div className="flex flex-row items-start flex-nowrap mb-4">
      <IconBadge
        icon={section.icon}
        label={section.label}
        translatedLabel={translatedLabel}
      />

      <ValueBadges values={section.values} getDisplayValue={getDisplayValue} />
    </div>
  );
};
