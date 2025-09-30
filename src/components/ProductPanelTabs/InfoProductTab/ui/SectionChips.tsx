import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Section } from "../data";

type SectionChipsProps = {
  section: Section;
};

const SPECIAL_SECTIONS = ["dimensions", "netWeight"] as const;
type SpecialSection = (typeof SPECIAL_SECTIONS)[number];

const isSpecialSection = (
  sectionLabel: string
): sectionLabel is SpecialSection => {
  return SPECIAL_SECTIONS.includes(sectionLabel as SpecialSection);
};

const getBadgeVariantClass = (sectionLabel: string, index: number): string => {
  if (!isSpecialSection(sectionLabel)) {
    return "bg-gray-300";
  }
  return index % 2 === 0 ? "bg-gray-400" : "bg-gray-200";
};

export const SectionChips: React.FC<SectionChipsProps> = ({ section }) => {
  const t = useTranslations("productInfo");

  if (!section.values?.length) {
    return null;
  }

  const getDisplayValue = (value: string): string => {
    return t.has(value) ? t(value) : value;
  };

  return (
    <div className="flex flex-wrap gap-2 flex-1">
      {section.values.map((value, index) => (
        <Badge
          key={index}
          variant="secondary"
          className={`
            ${getBadgeVariantClass(section.label, index)}
            text-gray-800
            text-[10px]
            px-3 py-1.5 rounded-sm
            font-['Myriad_Pro',sans-serif]
          `}
        >
          {getDisplayValue(value)}
        </Badge>
      ))}
    </div>
  );
};
