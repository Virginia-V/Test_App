import React from "react";
import { Separator } from "@/components/ui/separator";
import { Section } from "../data/data";
import { SectionRow } from "./SectionRow";
import { useMediaQuery } from "@mui/material";

type SectionPairGridProps = {
  pairs: { left?: Section; right?: Section }[];
  highlightLabels: Set<string>;
};

const SectionColumn: React.FC<{
  section?: Section;
  isLeft: boolean;
  highlightLabels: Set<string>;
}> = ({ section, isLeft, highlightLabels }) => (
  <div>
    {section && (
      <SectionRow
        section={section}
        isLeft={isLeft}
        highlightLabels={highlightLabels}
      />
    )}
  </div>
);

const PairSeparator: React.FC<{ isMdUp: boolean }> = ({ isMdUp }) => (
  <div className="w-full">
    {isMdUp ? (
      <div className="grid grid-cols-2 gap-4">
        <Separator className="border-[var(--color-divider)] border-b-2" />
        <Separator className="border-[var(--color-divider)] border-b-2" />
      </div>
    ) : (
      <Separator className="border-[var(--color-divider)] border-b-2 my-4" />
    )}
  </div>
);

export const SectionPairGrid: React.FC<SectionPairGridProps> = ({
  pairs,
  highlightLabels
}) => {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const isLastPair = (index: number) => index === pairs.length - 1;

  return (
    <div className="space-y-4">
      {pairs.map((pair, index) => (
        <React.Fragment key={index}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionColumn
              section={pair.left}
              isLeft={true}
              highlightLabels={highlightLabels}
            />
            <SectionColumn
              section={pair.right}
              isLeft={false}
              highlightLabels={highlightLabels}
            />
          </div>

          {!isLastPair(index) && <PairSeparator isMdUp={isMdUp} />}
        </React.Fragment>
      ))}
    </div>
  );
};
