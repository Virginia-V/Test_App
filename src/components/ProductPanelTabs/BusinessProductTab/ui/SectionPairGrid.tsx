import React from "react";
import { pairSections, Section, SectionChip } from "./SectionChip";

export const SectionPairGrid: React.FC<{
  left: Section[];
  right: Section[];
}> = ({ left, right }) => {
  const pairs = pairSections(left, right);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-4">
      {pairs.map((pair, idx) => (
        <React.Fragment key={idx}>
          {pair.left && (
            <div className="w-full">
              <SectionChip section={pair.left} isLeft />
            </div>
          )}
          {pair.right && (
            <div className="w-full">
              <SectionChip section={pair.right} isLeft={false} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
