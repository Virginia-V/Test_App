import React from "react";
import { BottomSection, ImagesSection, TopSection } from "./ui";

export const InventoryProductOverview: React.FC = () => {
  return (
    <div className="p-5">
      <TopSection />
      <BottomSection />
      <ImagesSection />
    </div>
  );
};
