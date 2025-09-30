import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { Circle } from "@/assets";
import { useTranslations } from "next-intl";

// --- Styles ---
const headingStyle = "text-black font-sans font-semibold leading-normal";
const chipBase =
  "font-sans text-[11px] md:text-[13px] font-semibold px-2 py-2 rounded-lg text-white";
const iconButtonStyle =
  "rounded p-1 bg-[#666666] flex items-center justify-center";

// --- Components ---
const ActionIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div className={iconButtonStyle}>{icon}</div>
);

const InfoBadge = ({ label, bgColor }: { label: string; bgColor: string }) => (
  <Badge className={cn(chipBase, bgColor)}>{label}</Badge>
);

// --- Main ---
export const ProductInfoSection = () => {
  // const { t } = useTranslation();
  const t = useTranslations("product");

  return (
    <div className="relative flex items-center gap-2 mt-2 md:mt-5 ml-2 md:ml-5 pr-4">
      {/* Left content */}
      <div className="relative z-10 max-w-full lg:max-w-[480px] flex-1 min-w-0">
        {/* Title + Action Icons */}
        <div className="flex items-center justify-between mb-2 gap-2">
          <h2
            className={cn(
              headingStyle,
              "text-lg md:text-xl lg:text-[25px] flex-1 min-w-0"
            )}
          >
            {/* Chaise LINA Bois & Lin */}
            {t("title")}
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ActionIcon
              icon={
                <ShareOutlinedIcon fontSize="small" sx={{ color: "#FFF" }} />
              }
            />
            <ActionIcon
              icon={<StarOutlineIcon fontSize="small" sx={{ color: "#FFF" }} />}
            />
          </div>
        </div>

        {/* Reference */}
        <span
          className={cn(
            headingStyle,
            "text-sm md:text-base lg:text-[18px] mb-2 block"
          )}
        >
          CH-2045-LN
        </span>

        {/* Short Description */}
        <p className="text-black font-pt-sans text-[10px] md:text-[11px] font-normal leading-[14px] md:leading-[16px] relative z-10 mb-4 md:mb-[25px] block">
          {t("shortDescription")}
        </p>

        {/* Action Badges */}
        <div className="flex gap-2 md:gap-4 lg:gap-6 flex-wrap">
          <InfoBadge
            label={t("downloadCatalogue")}
            bgColor="bg-[var(--color-caramel)]"
          />
          <InfoBadge
            label={t("visitWebsite")}
            bgColor="bg-[var(--color-wood)]"
          />
        </div>
      </div>

      {/* Decorative Circle - Hidden on small screens */}
      <div
        className="absolute top-0 right-0 z-1 pointer-events-none select-none hidden lg:block"
        style={{ width: 222, height: 222, right: 45 }}
      >
        <Circle />
      </div>
    </div>
  );
};
