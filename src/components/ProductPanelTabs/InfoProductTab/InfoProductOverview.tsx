import React from "react";
import {
  DIVIDER_ICONS,
  highlightLabels,
  highlightPairsPrimary,
  highlightPairsSecondary,
  normalPairsPrimary
} from "./data";
import { SectionPairGrid } from "./ui";
import { DividerWithIcon } from "@/components/shared/DividerWithIcon";
import { Users } from "@/assets/svg/Users";


export const InfoProductOverview: React.FC = () => {
  return (
    <div className="flex flex-col p-4">
      <div className="grid gap-3">
        <DividerWithIcon
          iconSrc={<Users/>}
          className="mb-8"
        />
        <SectionPairGrid
          pairs={highlightPairsPrimary}
          highlightLabels={highlightLabels}
        />

        <DividerWithIcon
          iconSrc={DIVIDER_ICONS.systemIcon.src}
          className="mb-8 mt-8"
        />

        <SectionPairGrid
          pairs={normalPairsPrimary}
          highlightLabels={highlightLabels}
        />

        <DividerWithIcon
          iconSrc={DIVIDER_ICONS.certificateIcon.src}
          className="mb-8 mt-8"
        />
      </div>

      <div className="grid gap-3">
        <SectionPairGrid
          pairs={highlightPairsSecondary}
          highlightLabels={highlightLabels}
        />
      </div>
    </div>
  );
};
