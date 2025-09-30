// src/lib/sceneMatcher.ts

// Nullable type helper
export type Nullable<T> = T | null | undefined;

// User selection shape for each part
export type Selection = {
  bathtub: {
    category_id: Nullable<number>;
    model_id: Nullable<number>;
    material_id: Nullable<number>;
    color_id?: Nullable<number>;
  };
  sink: {
    category_id: Nullable<number>;
    model_id: Nullable<number>;
    material_id: Nullable<number>;
  };
  floor: { category_id: Nullable<number>; model_id: Nullable<number> };
};

// Mapping from overlay label to selection key
const LABEL_TO_KEY = {
  Bathtub: "bathtub",
  Sink: "sink",
  Floor: "floor"
} as const;

// Parsed overlay values for a part (bathtub, sink, floor)
type OverlayParsed = Partial<{
  cat: number | null;
  model: number | null;
  mat: number | null;
  col: number | null;
}>;

// Parsed overlay for all parts
type ParsedTitle = Partial<Record<"bathtub" | "sink" | "floor", OverlayParsed>>;

/**
 * Parses a chunk like "Bathtub C1 M1 MAT1 COLx" into label and values.
 * Supports COLx → null.
 */
function parseOverlayChunk(
  chunk: string
): { label: string; values: OverlayParsed } | null {
  const trimmed = chunk.trim();
  const labelMatch = trimmed.match(/^[A-Za-z ]+/);
  if (!labelMatch) return null;
  const label = labelMatch[0].trim();

  // Remove label and whitespace, then extract tokens
  const rest = trimmed.slice(label.length).replace(/\s+/g, "");
  const tokenRe = /(C|M|MAT|COL)(\d+|x)/gi;
  const values: OverlayParsed = {};
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(rest)) !== null) {
    const key = m[1].toUpperCase();
    const raw = m[2];
    const isNull = raw.toLowerCase() === "x";
    const num = isNull ? null : Number(raw);
    if (!isNull && Number.isNaN(num)) continue;

    // Map token to OverlayParsed keys
    if (key === "C") values.cat = num as number | null;
    else if (key === "M") values.model = num as number | null;
    else if (key === "MAT") values.mat = num as number | null;
    else if (key === "COL") values.col = num as number | null;
  }
  return { label, values };
}

/**
 * Parses a scene title string into a ParsedTitle object.
 * Example: "Bathtub C1 M1 MAT1 COLx+Sink C2 M4 MAT10+Floor C3 M7"
 */
export function parseSceneTitle(title: string): ParsedTitle {
  const result: ParsedTitle = {};
  for (const chunk of title.split("+")) {
    const parsed = parseOverlayChunk(chunk);
    if (!parsed) continue;

    // Match label to key (bathtub, sink, floor)
    const matchedLabelKey = (
      Object.keys(LABEL_TO_KEY) as Array<keyof typeof LABEL_TO_KEY>
    ).find((lbl) => lbl.toLowerCase() === parsed.label.toLowerCase());
    if (!matchedLabelKey) continue;

    const key = LABEL_TO_KEY[matchedLabelKey];
    if (key === "bathtub" || key === "sink" || key === "floor")
      result[key] = parsed.values;
  }
  return result;
}

/* -------- Matching helpers -------- */

/**
 * Checks if a scene value matches a selection value.
 * - If selection is undefined, treat as wildcard (always matches).
 * - If selection is null, matches only if scene value is null.
 * - Otherwise, must be equal.
 */
function fieldMatches(
  sceneValue: number | null | undefined,
  selValue: Nullable<number>
): boolean {
  if (selValue === undefined) return true; // wildcard
  if (selValue === null) return sceneValue === null;
  return sceneValue === selValue;
}

// Unified shape for selections (so floor can omit material/color safely)
type PartSel = {
  category_id?: Nullable<number>;
  model_id?: Nullable<number>;
  material_id?: Nullable<number>;
  color_id?: Nullable<number>;
};

/**
 * Checks if all fields in a part (bathtub, sink, floor) match between scene and selection.
 */
function overlayMatches(
  sceneVals: OverlayParsed | undefined,
  selVals: PartSel
): boolean {
  const s = sceneVals ?? {};
  return (
    fieldMatches(s.cat, selVals.category_id) &&
    fieldMatches(s.model, selVals.model_id) &&
    fieldMatches(s.mat, selVals.material_id) &&
    fieldMatches(s.col, selVals.color_id)
  );
}

/**
 * Checks if a scene title matches a user selection.
 */
export function sceneTitleMatchesSelection(
  sceneTitle: string,
  selection: Selection
): boolean {
  const parsed = parseSceneTitle(sceneTitle);
  return (
    overlayMatches(parsed.bathtub, selection.bathtub) &&
    overlayMatches(parsed.sink, selection.sink) &&
    overlayMatches(parsed.floor, selection.floor)
  );
}

/**
 * Finds the most specific matching scene (by title) for a selection.
 * More specific = more fields present in the title.
 */
export function findMatchingSceneByTitle<
  T extends { title: string; sceneId: string }
>(scenes: T[], selection: Selection): T | undefined {
  // Specificity: count how many fields are present in the parsed title
  const specificity = (title: string) => {
    const p = parseSceneTitle(title);
    const cnt = (ov?: OverlayParsed) =>
      ov
        ? Number(ov.cat !== undefined) +
          Number(ov.model !== undefined) +
          Number(ov.mat !== undefined) +
          Number(ov.col !== undefined)
        : 0;
    return cnt(p.bathtub) + cnt(p.sink) + cnt(p.floor);
  };
  // Sort scenes by specificity (descending)
  const sorted = [...scenes].sort(
    (a, b) => specificity(b.title) - specificity(a.title)
  );
  // Return the first matching scene
  return sorted.find((s) => sceneTitleMatchesSelection(s.title, selection));
}

/* -------- Metadata-based matcher (JSON) -------- */

// Metadata shape for a part in the JSON
type PartMeta = {
  categoryId?: number | null;
  modelId?: number | null;
  materialId?: number | null;
  colorId?: number | null;
};

// Scene row shape in the JSON
export type SceneRow = {
  sceneId: string;
  metadata: {
    panorama_id: number;
    base_asset_id: number;
    bathtub: PartMeta;
    sink: PartMeta;
    floor: PartMeta;
  };
};

/**
 * Checks if all fields in a part's metadata match the selection.
 */
function matchesPartMeta(sel: PartSel, meta: PartMeta): boolean {
  return (
    fieldMatches(meta.categoryId, sel.category_id) &&
    fieldMatches(meta.modelId, sel.model_id) &&
    fieldMatches(meta.materialId, sel.material_id) &&
    fieldMatches(meta.colorId, sel.color_id)
  );
}

/**
 * Finds the sceneId in the metadata JSON that matches the user's selection.
 * Returns the first match or null if none found.
 */
export function findSceneIdFromMetadata(
  selection: Selection,
  allScenes: SceneRow[]
): string | null {
  for (const row of allScenes) {
    const m = row.metadata;
    if (
      matchesPartMeta(selection.bathtub, m.bathtub) &&
      matchesPartMeta(selection.sink, m.sink) &&
      matchesPartMeta(selection.floor, m.floor)
    ) {
      return row.sceneId;
    }
  }
  return null;
}
