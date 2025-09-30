"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  AddressSection,
  InfoBoxGroup,
  ReviewSection,
  SectionPairGrid
} from "./ui";
import { useTranslations } from "next-intl";
import {
  distributors,
  infoItemsBottom,
  infoItemsTop,
  MOCK_REVIEWS,
  otherInfoItemsLeft,
  otherInfoItemsRight,
  resellers,
  Review,
  showrooms,
  SOCIAL_ICONS
} from "./data/data";

import { PRODUCT_ICONS } from "@/lib";
import { DividerWithIcon } from "@/components/shared/DividerWithIcon";

// Constants
const OVERALL_RATING = 4.5;
const TOTAL_REVIEWS = 135;

// Company Header Component
const CompanyHeader: React.FC<{ title: string }> = ({ title }) => (
  <Badge className="bg-[var(--color-caramel)] text-white font-['Myriad_Pro',sans-serif] text-[10px] font-semibold w-fit rounded-sm px-3 py-1.5">
    {title}
  </Badge>
);

// Social Icons Component
const SocialIcons: React.FC = () => (
  <div className="flex gap-3">
    {SOCIAL_ICONS.map((icon) => (
      <Image
        key={icon.alt}
        src={icon.src}
        alt={icon.alt}
        width={icon.width}
        height={icon.height}
        className={`${
          icon.opacity || "hover:opacity-80 transition-opacity cursor-pointer"
        }`}
      />
    ))}
  </div>
);

// Company Description Component
const CompanyDescription: React.FC<{ description: string }> = ({
  description
}) => (
  <div className="flex flex-col flex-1 min-w-[100px] max-w-[450px] gap-4">
    <p className="text-[#333] font-['Myriad_Pro',sans-serif] text-[10px] leading-relaxed">
      {description}
    </p>
    <SocialIcons />
  </div>
);

// Info Boxes Section Component
const InfoBoxesSection: React.FC = () => (
  <div className="flex flex-col ml-20 gap-5">
    <InfoBoxGroup group={infoItemsTop} />
    <InfoBoxGroup group={infoItemsBottom} />
  </div>
);

// Custom hook for reviews
const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      // Simulate API call
      setReviews(MOCK_REVIEWS);
    };

    fetchReviews();
  }, []);

  return reviews;
};

// Main Component
export const BusinessProductOverview: React.FC = () => {
  const t = useTranslations("businessInfo");
  const reviews = useReviews();

  return (
    <div className="flex flex-col gap-6 p-4">
      <CompanyHeader title={t("aboutCompany")} />

      <div className="flex gap-5 items-start flex-wrap">
        <CompanyDescription description={t("companyDescription")} />
        <InfoBoxesSection />
      </div>

      <DividerWithIcon
        iconSrc={PRODUCT_ICONS.Building_Icon.src}
        width="w-[100%]"
      />

      <SectionPairGrid left={otherInfoItemsLeft} right={otherInfoItemsRight} />

      <DividerWithIcon
        iconSrc={PRODUCT_ICONS.Stars_Icon.src}
        width="w-[100%]"
      />

      <ReviewSection
        reviews={reviews}
        overallRating={OVERALL_RATING}
        totalReviews={TOTAL_REVIEWS}
      />

      <DividerWithIcon
        iconSrc={PRODUCT_ICONS.Location_Icon.src}
        width="w-[100%]"
      />

      <AddressSection
        title={t("showrooms")}
        icon={PRODUCT_ICONS.Reduce_Icon.src}
        data={showrooms}
      />

      <AddressSection
        title={t("resellers")}
        icon={PRODUCT_ICONS.Reduce_Icon.src}
        data={resellers}
      />

      <AddressSection
        title={t("distributors")}
        icon={PRODUCT_ICONS.Reduce_Icon.src}
        data={distributors}
      />
    </div>
  );
};
