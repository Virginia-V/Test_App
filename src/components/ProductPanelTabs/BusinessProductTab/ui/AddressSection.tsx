import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddressEntry } from "./SectionChip";
import { AddressGrid } from "./AddressGrid";

// Types
interface AddressSectionProps {
  title: string;
  icon: string;
  data: AddressEntry[];
}

// Constants
const ICON_SIZE = 24;
const FONT_FAMILY = "font-['Myriad_Pro',sans-serif]";
const DISTRIBUTORS_KEY = "distributors";

// Section Header Component
const SectionHeader: React.FC<{
  title: string;
  icon: string;
}> = ({ title, icon }) => (
  <div className="relative w-fit mb-4">
    <Image
      src={icon}
      alt={`${title} icon`}
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="absolute -top-3 -left-2 rounded-full bg-white p-0.5 shadow-sm z-10 border border-black"
    />
    <Badge
      className={`bg-black px-3 py-1.5 text-white ${FONT_FAMILY} text-[10px] font-semibold rounded-sm hover:bg-black`}
    >
      {title}
    </Badge>
  </div>
);

// Conditional Separator Component
const ConditionalSeparator: React.FC<{
  shouldShow: boolean;
}> = ({ shouldShow }) => {
  if (!shouldShow) return null;

  return (
    <div className="w-full">
      <Separator className="flex-1 border-[var(--color-divider)] border-b-2 mt-4" />
    </div>
  );
};

// Main Component
export const AddressSection: React.FC<AddressSectionProps> = ({
  title,
  icon,
  data
}) => {
  const t = useTranslations("businessInfo");

  const isDistributorsSection = title === t(DISTRIBUTORS_KEY);
  const shouldShowSeparator = !isDistributorsSection;

  // Early return if no data
  if (!data?.length) {
    return null;
  }

  return (
    <>
      <SectionHeader title={title} icon={icon} />

      <AddressGrid data={data} />

      <ConditionalSeparator shouldShow={shouldShowSeparator} />
    </>
  );
};
