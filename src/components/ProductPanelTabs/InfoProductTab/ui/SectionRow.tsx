import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Section } from "../data";
import { SectionChips } from "./SectionChips";

type SectionRowProps = {
  section: Section;
  isLeft: boolean;
  highlightLabels: Set<string>;
};

const getBadgeWidthClass = (label: string) =>
  label === "availableColors" ? "w-[150px] mr-2" : "w-[140px] mr-[18px]";

export const SectionRow: React.FC<SectionRowProps> = ({
  section,
  highlightLabels
}) => {
  const t = useTranslations("productInfo");
  const chipColor = highlightLabels.has(section.label)
    ? "var(--color-caramel)"
    : "var(--color-wood)";

  const renderIcon = () => {
    if (!section.icon) return null;

    if (typeof section.icon === "function") {
      // For React component icons like Test
      return (
        <div className="absolute -top-2 -left-2 w-[25px] h-[25px] rounded-full bg-white p-[2px] shadow-sm z-10 border border-black flex items-center justify-center">
          {section.icon()}
        </div>
      );
    } else {
      // For string URLs
      return (
        <Image
          src={section.icon}
          alt={`${t(section.label)} icon`}
          width={25}
          height={25}
          className="absolute -top-2 -left-2 rounded-full bg-white p-[2px] shadow-sm z-10 border border-black object-contain"
        />
      );
    }
  };

  return (
    <div className="flex flex-row items-start flex-nowrap">
      <div className="relative">
        {renderIcon()}
        <Badge
          className={cn(
            "text-white font-['Myriad_Pro',sans-serif] text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0 px-3 py-1.5 rounded-sm",
            getBadgeWidthClass(section.label)
          )}
          style={{ backgroundColor: chipColor }}
        >
          {t(section.label)}
        </Badge>
      </div>
      <SectionChips section={section} />
    </div>
  );
};
