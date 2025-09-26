import KrpanoSceneSwitcher from "@/hooks";

export default function Page() {
  return (
    <KrpanoSceneSwitcher
      xml="/tours/tour-1-1/tour.xml"
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
