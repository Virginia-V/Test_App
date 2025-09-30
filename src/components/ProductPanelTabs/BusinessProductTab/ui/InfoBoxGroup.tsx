import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { InfoItem } from "./SectionChip";

// Types
interface InfoBoxGroupProps {
  group: InfoItem[];
}

interface InfoBoxProps {
  item: InfoItem;
  getDisplayValue: (value: string) => string;
  getTranslatedLabel: (label: string) => string;
}

// Constants
const BUSINESS_VALUES_PREFIX = "businessValues.";
const BOX_WIDTH = "w-[120px]";
const ICON_SIZE = 24;
const DENOMINATION_LABEL = "denomination";

const COLORS = {
  denomination: {
    bg: "bg-black",
    hover: "hover:bg-black"
  },
  default: {
    bg: "bg-[var(--color-caramel)]",
    hover: "hover:bg-[var(--color-caramel)]"
  }
} as const;

// Custom hook for translation logic
const useTranslationHelper = () => {
  const tBusinessInfo = useTranslations("businessInfo");
  const tBusinessValues = useTranslations("businessValues");

  const getDisplayValue = (value: string): string => {
    // Check direct business info translation
    if (tBusinessInfo.has(value)) {
      return tBusinessInfo(value);
    }

    // Check direct business values translation
    if (tBusinessValues.has(value)) {
      return tBusinessValues(value);
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

  const getTranslatedLabel = (label: string): string => {
    return tBusinessInfo(label);
  };

  return {
    getDisplayValue,
    getTranslatedLabel
  };
};

// Helper function to get color classes
const getColorClasses = (label: string): string => {
  const colors =
    label === DENOMINATION_LABEL ? COLORS.denomination : COLORS.default;
  return `${colors.bg} ${colors.hover}`;
};

// Value Box Component
const ValueBox: React.FC<{
  value: string;
  getDisplayValue: (value: string) => string;
}> = ({ value, getDisplayValue }) => (
  <Badge
    variant="outline"
    className={`${BOX_WIDTH} bg-white text-black text-[10px] flex items-end justify-center leading-none pb-2 border border-gray-200 pt-4 rounded-sm min-h-[35px] hover:bg-white`}
  >
    {getDisplayValue(value)}
  </Badge>
);

// Label Badge Component
const LabelBadge: React.FC<{
  label: string;
  icon: string;
  getTranslatedLabel: (label: string) => string;
}> = ({ label, icon, getTranslatedLabel }) => {
  const translatedLabel = getTranslatedLabel(label);
  const colorClasses = getColorClasses(label);

  return (
    <div className="absolute -top-2 left-0 z-10">
      <Badge
        className={`text-white text-[10px] font-semibold px-[15px] py-2 rounded-sm ${BOX_WIDTH} text-center ${colorClasses}`}
      >
        {translatedLabel}
      </Badge>
      <Image
        src={icon}
        alt={`${translatedLabel} icon`}
        width={ICON_SIZE}
        height={ICON_SIZE}
        className="absolute -top-3 -left-2 rounded-full bg-white p-0.5 shadow-sm border border-black z-10"
      />
    </div>
  );
};

// Individual Info Box Component
const InfoBox: React.FC<InfoBoxProps> = ({
  item,
  getDisplayValue,
  getTranslatedLabel
}) => {
  const { label, value, icon } = item;

  return (
    <div className="relative w-fit font-['Myriad_Pro',sans-serif] text-[10px] uppercase select-none rounded-md pt-4 mb-3">
      <ValueBox value={value} getDisplayValue={getDisplayValue} />

      <LabelBadge
        label={label}
        icon={icon}
        getTranslatedLabel={getTranslatedLabel}
      />
    </div>
  );
};

// Main Component
export const InfoBoxGroup: React.FC<InfoBoxGroupProps> = ({ group }) => {
  const { getDisplayValue, getTranslatedLabel } = useTranslationHelper();

  if (!group?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {group.map((item) => (
        <InfoBox
          key={item.label}
          item={item}
          getDisplayValue={getDisplayValue}
          getTranslatedLabel={getTranslatedLabel}
        />
      ))}
    </div>
  );
};
