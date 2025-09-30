import { PRODUCT_ICONS } from "@/lib";
import { Test } from "@/assets/svg/Test";
import { Reference } from "@/assets/svg/Reference";
import { Category } from "@/assets/svg/Category";

export type Section = {
  label: string;
  values?: string[];
  icon?: string | (() => React.ReactNode);
  amount?: number;
};

export const DIVIDER_ICONS = {
  systemIcon: PRODUCT_ICONS.System_Icon,
  certificateIcon: PRODUCT_ICONS.Certificate_Icon
};

export const highlightLabels = new Set([
  "productRef",
  "category",
  "range",
  "launchDate",
  "unitPrice",
  "packaging",
  "collection",
  "assembly",
  "deliveryTime",
  "publicPrice",
  "deliveryZones",
  "shippingCosts",
  "stock",
  "maintenance",
  "warranty",
  "certifications",
  "returns",
  "label"
]);

export const productData = {
  refProduit: "29037D8JE9DX",
  categorie: "chair",
  gamme: "elegance",
  dateLancement: "2025",
  prixUnitaire: "249.00$",
  dimensions: [
    { size: "L", measure: "2600" },
    { size: "H", measure: "1000" },
    { size: "P", measure: "400" }
  ],
  poidsNet: [
    { type: "gross", measure: "28" },
    { type: "net", measure: "28" }
  ],
  colors: ["blue", "green", "orange", "purple", "yellow", "amber"],
  origine: "france",
  certifications: ["FSC", "OEKO-TEX", "ISO"],
  montage: ["deliveredAssembled", "selfAssembly"],
  label: "safety",
  entretien: "product",
  structure: ["glossy", "chrome"],
  materiaux: ["wood", "plastic", "metal"],
  finitions: ["matte", "glossy", "lacquered", "chrome"],
  utilisation: ["indoor", "outdoor"],
  zonesLivraison: ["europe", "usa", "australia"],
  fraisPort: "included",
  stocks: "available",
  garantie: "36 MOIS",
  retours: ["underConditions", "notAccepted"],
  conditionnement: ["unit"],
  collection: ["FSC"],
  delaisLivraison: "sevenDays",
  prixPublic: "249.00$"
};

export const leftPrimarySections: Section[] = [
  {
    label: "productRef",
    values: [productData.refProduit],
    icon: () => <Reference />
  },
  {
    label: "category",
    values: [productData.categorie],
    // icon: PRODUCT_ICONS.Category_Icon.src
    icon: () => <Category />
  },
  {
    label: "range",
    values: [productData.gamme],
    icon: PRODUCT_ICONS.Range_Icon.src
  },
  {
    label: "launchDate",
    values: [productData.dateLancement],
    icon: PRODUCT_ICONS.Date_Launch_Icon.src
  },
  {
    label: "unitPrice",
    values: [productData.prixUnitaire],
    icon: PRODUCT_ICONS.Unit_Price_Icon.src
  },
  {
    label: "dimensions",
    values: productData.dimensions.flatMap(({ size, measure }) => [
      size,
      measure
    ]),
    icon: PRODUCT_ICONS.Dimensions_Icon.src
  },
  {
    label: "netWeight",
    values: productData.poidsNet.flatMap(({ type, measure }) => [
      type,
      measure
    ]),
    icon: PRODUCT_ICONS.Weight_Icon.src
  },
  {
    label: "availableColors",
    values: productData.colors,
    icon: PRODUCT_ICONS.Color_Icon.src
  },
  {
    label: "origin",
    values: [productData.origine],
    icon: PRODUCT_ICONS.Origine_Icon.src
  }
];

export const leftSecondarySections: Section[] = [
  {
    label: "deliveryZones",
    values: productData.zonesLivraison,
    icon: PRODUCT_ICONS.Delivery_Times_Icon.src
  },
  {
    label: "shippingCosts",
    values: [productData.fraisPort],
    icon: PRODUCT_ICONS.Costs_Icon.src
  },
  {
    label: "stock",
    values: [productData.stocks],
    icon: PRODUCT_ICONS.Stock_Icon.src
  },
  {
    label: "maintenance",
    values: [productData.entretien],
    icon: PRODUCT_ICONS.Interview_Icon.src
  }
];

export const rightPrimarySections: Section[] = [
  {
    label: "packaging",
    values: productData.conditionnement,
    icon: PRODUCT_ICONS.Condition_Icon.src
  },
  {
    label: "collection",
    values: productData.collection,
    icon: PRODUCT_ICONS.Collection_Icon.src
  },
  {
    label: "assembly",
    values: productData.montage,
    icon: PRODUCT_ICONS.Assembly_Icon.src
  },
  {
    label: "deliveryTime",
    values: [productData.delaisLivraison],
    icon: PRODUCT_ICONS.Delivery_Times_Icon.src
  },
  {
    label: "publicPrice",
    values: [productData.prixPublic],
    icon: PRODUCT_ICONS.Public_Price_Icon.src
  },
  {
    label: "structure",
    values: productData.structure,
    icon: PRODUCT_ICONS.Structure_Icon.src
  },
  {
    label: "materials",
    values: productData.materiaux,
    icon: PRODUCT_ICONS.Materials_Icon.src
  },
  {
    label: "finishes",
    values: productData.finitions,
    icon: PRODUCT_ICONS.Finishes_Icon.src
  },
  {
    label: "use",
    values: productData.utilisation,
    icon: PRODUCT_ICONS.Use_Icon.src
  }
];

export const rightSecondarySections: Section[] = [
  {
    label: "warranty",
    values: [productData.garantie],
    icon: PRODUCT_ICONS.Guarantee_Icon.src
  },
  {
    label: "certifications",
    values: productData.certifications,
    icon: PRODUCT_ICONS.Certifications_Icon.src
  },
  {
    label: "returns",
    values: productData.retours,
    icon: PRODUCT_ICONS.Returns_Icon.src
  },
  {
    label: "label",
    values: [productData.label],
    icon: PRODUCT_ICONS.Label_Primary_Icon.src
  }
];

export const pairSections = (
  left: Section[],
  right: Section[]
): { left?: Section; right?: Section }[] => {
  const maxLength = Math.max(left.length, right.length);
  return Array.from({ length: maxLength }, (_, i) => ({
    left: left[i],
    right: right[i]
  }));
};

const leftPrimaryHighlight = leftPrimarySections.filter((s) =>
  highlightLabels.has(s.label)
);
const leftPrimaryNormal = leftPrimarySections.filter(
  (s) => !highlightLabels.has(s.label)
);
const rightPrimaryHighlight = rightPrimarySections.filter((s) =>
  highlightLabels.has(s.label)
);
const rightPrimaryNormal = rightPrimarySections.filter(
  (s) => !highlightLabels.has(s.label)
);

const leftSecondaryHighlight = leftSecondarySections.filter((s) =>
  highlightLabels.has(s.label)
);
const rightSecondaryHighlight = rightSecondarySections.filter((s) =>
  highlightLabels.has(s.label)
);

export const highlightPairsPrimary = pairSections(
  leftPrimaryHighlight,
  rightPrimaryHighlight
);
export const normalPairsPrimary = pairSections(
  leftPrimaryNormal,
  rightPrimaryNormal
);
export const highlightPairsSecondary = pairSections(
  leftSecondaryHighlight,
  rightSecondaryHighlight
);
