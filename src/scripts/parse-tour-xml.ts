import fs from "fs";
import { XMLParser } from "fast-xml-parser";

const xml = fs.readFileSync("public/tours/tour-1-1/tour.xml", "utf-8");
const parser = new XMLParser({ ignoreAttributes: false });
const json = parser.parse(xml);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scenes = (json.krpano.scene || []).map((scene: any, i: number) => ({
  id: `scene${i}`,
  label: scene["@_title"] || scene["@_name"] || `Scene ${i + 1}`,
  scene: scene["@_name"]
}));

// Write the full array to a file
fs.writeFileSync("scenes.json", JSON.stringify(scenes, null, 2), "utf-8");
console.log("✅ Scenes array written to scenes.json");
