import ChairIcon from "@mui/icons-material/Chair";
import InfoIcon from "@mui/icons-material/Info";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";
import Image from "next/image";
import { PRODUCT_ICONS } from "@/lib";

export const getTabIcons = () => [
  <ChairIcon key="chair" sx={{ color: "var(--color-caramel)" }} />,
  <InfoIcon key="info" sx={{ color: "var(--color-caramel)" }} />,
  <Image
    key="inventory"
    src={PRODUCT_ICONS.Inventory_Tab_Icon}
    alt="Inventory Tab Icon"
    width={24}
    height={24}
    style={{ objectFit: "contain", minWidth: 24, minHeight: 24 }}
  />,
  <BusinessCenterIcon key="business" sx={{ color: "var(--color-caramel)" }} />,
  <PersonIcon key="person" sx={{ color: "var(--color-caramel)" }} />
];
