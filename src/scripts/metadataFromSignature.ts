// src/scripts/metadataFromSignature.ts
import fs from "fs";
import path from "path";

type Nullable<T> = T | null;

interface SceneInput {
  sceneId: string;
  signature: string;
}

interface BathtubMeta {
  categoryId: Nullable<number>;
  modelId: Nullable<number>;
  materialId: Nullable<number>;
  colorId: Nullable<number>;
}

interface SinkMeta {
  categoryId: Nullable<number>;
  modelId: Nullable<number>;
  materialId: Nullable<number>;
}

interface FloorMeta {
  categoryId: Nullable<number>;
  modelId: Nullable<number>;
}

interface Metadata {
  panorama_id: number;
  base_asset_id: number;
  bathtub: BathtubMeta;
  sink: SinkMeta;
  floor: FloorMeta;
}

interface SceneOutput {
  sceneId: string;
  metadata: Metadata;
}

// Strict regexes: capture only digits or 'x' (case-insensitive)
const RE_BATHTUB = /bathtub-?C(\d+|x)_M(\d+|x)_MAT(\d+|x)_COL(\d+|x)/i;
const RE_SINK = /sink-?C(\d+|x)_M(\d+|x)_MAT(\d+|x)/i;
const RE_FLOOR = /floor-?C(\d+|x)_M(\d+|x)_MAT(\d+|x)/i;

function parseHeaderPart(signature: string) {
  const panoMatch = signature.match(/panorama-(\d+)/);
  const baseMatch = signature.match(/base-(\d+)/);
  if (!panoMatch || !baseMatch) {
    throw new Error(`Bad signature (missing panorama/base): ${signature}`);
  }
  return {
    panorama_id: Number(panoMatch[1]),
    base_asset_id: Number(baseMatch[1])
  };
}

function toNullableNumber(v?: string): Nullable<number> {
  if (v == null) return null;
  return v.toLowerCase() === "x" ? null : Number(v);
}

function parseOverlay(
  kind: "bathtub" | "sink" | "floor",
  signature: string
): BathtubMeta | SinkMeta | FloorMeta {
  const m =
    kind === "bathtub"
      ? signature.match(RE_BATHTUB)
      : kind === "sink"
        ? signature.match(RE_SINK)
        : signature.match(RE_FLOOR);

  if (!m) throw new Error(`Bad signature (missing ${kind}): ${signature}`);

  const cat = toNullableNumber(m[1]);
  const model = toNullableNumber(m[2]);
  const mat = toNullableNumber(m[3]);

  if (kind === "bathtub") {
    const color = toNullableNumber(m[4]);
    return { categoryId: cat, modelId: model, materialId: mat, colorId: color };
  }
  if (kind === "sink") {
    // Sanity: if signature contains a numeric MAT for sink, don't allow null
    const numericMat = signature.match(/sink-[^_]*_M[^_]*_MAT(\d+)/i);
    if (numericMat && mat === null) {
      throw new Error(
        `Expected numeric sink MAT but got null in: ${signature}`
      );
    }
    return { categoryId: cat, modelId: model, materialId: mat };
  }
  // floor output intentionally omits materialId (even though MAT appears in signature)
  return { categoryId: cat, modelId: model };
}

function toSlim(scene: SceneInput): SceneOutput {
  const { panorama_id, base_asset_id } = parseHeaderPart(scene.signature);
  const bathtub = parseOverlay("bathtub", scene.signature) as BathtubMeta;
  const sink = parseOverlay("sink", scene.signature) as SinkMeta;
  const floor = parseOverlay("floor", scene.signature) as FloorMeta;

  return {
    sceneId: scene.sceneId,
    metadata: {
      panorama_id,
      base_asset_id,
      bathtub,
      sink,
      floor
    }
  };
}

function main() {
  const publicDir = path.resolve(process.cwd(), "public");
  const inputPath = path.join(publicDir, "all-scenes.json");
  const outputPath = path.join(publicDir, "all-scenes-metadata.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const scenes: SceneInput[] = JSON.parse(raw);
  const result = scenes.map(toSlim);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`✅ Metadata written to ${outputPath}`);
}

main();
