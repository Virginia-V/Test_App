import { PRODUCT_ICONS } from "@/lib";
import { Section } from "../../InfoProductTab/data";

export const categories: Section[] = [
  {
    label: "furniture",
    amount: 56,
    icon: PRODUCT_ICONS.Furniture_Icon.src
  },
  {
    label: "bathroom",
    amount: 12,
    icon: PRODUCT_ICONS.Bathroom_Icon.src
  },
  {
    label: "kitchen",
    amount: 6,
    icon: PRODUCT_ICONS.Kitchen_Icon.src
  },
  {
    label: "lighting",
    amount: 65,
    icon: PRODUCT_ICONS.Lighting_Icon.src
  },
  {
    label: "outdoor",
    amount: 15,
    icon: PRODUCT_ICONS.Outdoor_Icon.src
  },
  {
    label: "office",
    amount: 35,
    icon: PRODUCT_ICONS.Office_Icon.src
  }
];

export const inventoryItems: Section[] = [
  {
    label: "chairs",
    amount: 35
  },
  {
    label: "sofasAndArmchairs",
    amount: 56
  },
  {
    label: "storage",
    amount: 12
  }
];
