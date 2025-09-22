import { FLAGS } from "@/lib";

export const getFlagStyle = (country: string): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    flexShrink: 0,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  };

  // Extract country name and normalize
  const normalized = country
    .replace("countries.", "")
    // Handle camelCase by adding underscores before uppercase letters
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/ /g, "_")
    .replace(/-/g, "_");

  // Create mapping key
  let key = `${normalized
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_")}_Flag`;

  // Handle special cases for countries that might have different naming conventions
  const specialMappings: { [key: string]: keyof typeof FLAGS } = {
    Uk_Flag: "United_Kingdom_Flag",
    Gb_Flag: "United_Kingdom_Flag",
    Britain_Flag: "United_Kingdom_Flag",
    Great_Britain_Flag: "United_Kingdom_Flag",
    United_Kingdom_Flag: "United_Kingdom_Flag",
    Us_Flag: "United_States_Flag",
    Usa_Flag: "United_States_Flag",
    America_Flag: "United_States_Flag",
    United_States_Flag: "United_States_Flag"
  };

  // Check if we have a special mapping
  if (specialMappings[key]) {
    key = specialMappings[key]!;
  }

  const flag = FLAGS[key as keyof typeof FLAGS];
  if (!flag) {
    return baseStyles;
  }

  // Handle Next.js imported images - they have a .src property
  const imageUrl = typeof flag === "string" ? flag : flag.src || "";

  // If no valid image URL, return base styles without background
  if (!imageUrl) {
    return baseStyles;
  }

  return {
    ...baseStyles,
    backgroundImage: `url('${imageUrl}')`
  };
};
