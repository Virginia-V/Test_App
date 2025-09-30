import fs from "fs";
import path from "path";
import fetch from "node-fetch";

type BathtubMeta = {
  categoryId: string | null;
  modelId: string | null;
  materialId: string | null;
  colorId: string | null;
};
type SinkMeta = {
  categoryId: string | null;
  modelId: string | null;
  materialId: string | null;
};
type FloorMeta = {
  categoryId: string | null;
  modelId: string | null;
};
type SceneMetadata = {
  sceneId: string;
  title: string;
  signature: string;
  tilesPath: string;
  previewPath: string;
  thumbnailPath: string;
  metadata: {
    panorama_id: string;
    base_asset_id: string;
    bathtub: BathtubMeta;
    sink: SinkMeta;
    floor: FloorMeta;
  };
};

type RawBathtubMeta = {
  category: string | null;
  model: string | null;
  material: string | null;
  color: string | null;
};
type RawSinkMeta = {
  category: string | null;
  model: string | null;
  material: string | null;
};
type RawFloorMeta = {
  category: string | null;
  model: string | null;
};
type RawMetadata = {
  panorama_id: string;
  base_asset_id: string;
  bathtub: RawBathtubMeta;
  sink: RawSinkMeta;
  floor: RawFloorMeta;
};

function remapMetadata(meta: RawMetadata) {
  return {
    ...meta,
    bathtub: meta.bathtub && {
      categoryId: meta.bathtub.category,
      modelId: meta.bathtub.model,
      materialId: meta.bathtub.material,
      colorId: meta.bathtub.color
    },
    sink: meta.sink && {
      categoryId: meta.sink.category,
      modelId: meta.sink.model,
      materialId: meta.sink.material
    },
    floor: meta.floor && {
      categoryId: meta.floor.category,
      modelId: meta.floor.model
    }
  };
}

async function fetchSceneMetadata(
  sceneId: string
): Promise<SceneMetadata | null> {
  const url = `https://pub-f8c8c146ca47443e8eab15da50a51ecf.r2.dev/tours/tour-1-1/${sceneId}/scene.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch ${sceneId}: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as Record<string, unknown>;
    return {
      ...(data as Omit<SceneMetadata, "metadata">),
      metadata: remapMetadata((data as { metadata: RawMetadata }).metadata)
    };
  } catch (e) {
    console.warn(`Error fetching ${sceneId}:`, e);
    return null;
  }
}

// Helper to parse overlay chunks like "bathtub-C1_M1_MAT1_COLx"
function parseOverlay(
  chunk: string,
  keys: string[]
): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  const catMatch = chunk.match(/C(\d+|x)/);
  const modelMatch = chunk.match(/M(\d+|x)/);
  const matMatch = chunk.match(/MAT(\d+|x)/);
  const colMatch = chunk.match(/COL(\d+|x)/);

  if (keys[0])
    result[keys[0]] = catMatch
      ? catMatch[1] === "x"
        ? null
        : catMatch[1]
      : null;
  if (keys[1])
    result[keys[1]] = modelMatch
      ? modelMatch[1] === "x"
        ? null
        : modelMatch[1]
      : null;
  if (keys[2])
    result[keys[2]] = matMatch
      ? matMatch[1] === "x"
        ? null
        : matMatch[1]
      : null;
  if (keys[3])
    result[keys[3]] = colMatch
      ? colMatch[1] === "x"
        ? null
        : colMatch[1]
      : null;

  return result;
}

function parseSignature(signature: string) {
  // Example: panorama-1_base-1_bathtub-C1_M1_MAT1_COLx_sink-C2_M4_MAT10_floor-C3_M9_MATx.png
  const [panorama, base, bathtubChunk, sinkChunk, floorChunk] = signature
    .replace(".png", "")
    .split("_");

  const panorama_id = panorama.split("-")[1];
  const base_asset_id = base.split("-")[1];

  const bathtub = parseOverlay(bathtubChunk.replace("bathtub-", ""), [
    "categoryId",
    "modelId",
    "materialId",
    "colorId"
  ]);
  const sink = parseOverlay(sinkChunk.replace("sink-", ""), [
    "categoryId",
    "modelId",
    "materialId"
  ]);
  const floor = parseOverlay(floorChunk.replace("floor-", ""), [
    "categoryId",
    "modelId"
  ]);

  return {
    panorama_id,
    base_asset_id,
    bathtub,
    sink,
    floor
  };
}

async function main() {
  const sceneIds = Array.from({ length: 324 }, (_, i) => `scene${i}`);
  const results = await Promise.all(sceneIds.map(fetchSceneMetadata));
  const scenes = results.filter(Boolean);

  const outputPath = path.join(process.cwd(), "public", "all-scenes.json");
  fs.writeFileSync(outputPath, JSON.stringify(scenes, null, 2), "utf-8");
  console.log(`Wrote ${scenes.length} scenes to ${outputPath}`);
}

main();
