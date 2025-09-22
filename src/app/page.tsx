import KrpanoSceneSwitcher from "@/hooks/useKrpano";

export default function Page() {
  const scenes = [
    {
      id: "stone1",
      label: "Pano 1",
      scene: "scene_test_pano_stone_variant_1"
    },
    {
      id: "stone2",
      label: "Pano 2",
      scene: "scene_test_pano_stone_variant_2"
    },
    { id: "wood", label: "Pano 3", scene: "scene_test_pano_wood" }
  ];

  return (
    <KrpanoSceneSwitcher
      xml="/kp/tour.xml"
      scenes={scenes}
      initialId="stone1"
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
