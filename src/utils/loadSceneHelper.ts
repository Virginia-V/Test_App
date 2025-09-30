type Nullable<T> = T | null | undefined;

type Selection = {
  bathtub: {
    bathtub_category_id: Nullable<number>;
    bathtub_model_id: Nullable<number>;
    bathtub_material_id: Nullable<number>;
    bathtub_color_id?: Nullable<number>;
  };
  sink: {
    sink_category_id: Nullable<number>;
    sink_model_id: Nullable<number>;
    sink_material_id: Nullable<number>;
  };
  floor: {
    floor_category_id: Nullable<number>;
    floor_model_id: Nullable<number>;
  };
};

type Scene = {
  id?: string | number;
  title: string;
  // ...any other fields you have (e.g., krpano scene name, thumb, etc.)
};

/**
 * Map scene title "labels" to the keys in Selection.
 * Adjust these strings if your titles use different labels.
 */
const LABEL_TO_KEY = {
  Bathtub: "bathtub",
  Sink: "sink",
  Floor: "floor"
} as const;

type OverlayParsed = Partial<{
  cat: number;
  model: number;
  mat: number;
  col: number;
}>;

type ParsedTitle = Partial<Record<"bathtub" | "sink" | "floor", OverlayParsed>>;

/**
 * Parse a single overlay chunk like:
 *   "Bathtub C1M3MAT7COL2"
 *   "Sink C2M4"
 *   "Floor C3M7"
 * Supports optional MAT and COL tokens.
 */
function parseOverlayChunk(
  chunk: string
): { label: string; values: OverlayParsed } | null {
  const trimmed = chunk.trim();

  // Extract the leading label (word characters/spaces until we hit a token)
  // e.g., "Bathtub" in "Bathtub C1M3MAT7COL2"
  const labelMatch = trimmed.match(/^[A-Za-z ]+/);
  if (!labelMatch) return null;

  const label = labelMatch[0].trim();

  // Now extract tokens like C<number>, M<number>, MAT<number>, COL<number> in any order
  const rest = trimmed.slice(label.length).replace(/\s+/g, "");
  // Use global regex to find all key-number pairs
  const tokenRe = /(C|M|MAT|COL)(\d+)/g;
  const values: OverlayParsed = {};
  let m: RegExpExecArray | null;

  while ((m = tokenRe.exec(rest)) !== null) {
    const key = m[1];
    const num = Number(m[2]);
    if (Number.isNaN(num)) continue;

    if (key === "C") values.cat = num;
    else if (key === "M") values.model = num;
    else if (key === "MAT") values.mat = num;
    else if (key === "COL") values.col = num;
  }

  return { label, values };
}

/**
 * Parse a full title like:
 *   "Bathtub C1M1 + Sink C2M4 + Floor C3M7"
 */
export function parseSceneTitle(title: string): ParsedTitle {
  const result: ParsedTitle = {};
  const chunks = title.split("+"); // scene parts separated by '+'

  for (const chunk of chunks) {
    const parsed = parseOverlayChunk(chunk);
    if (!parsed) continue;

    // Normalize the label to one of our keys
    const matchedLabelKey = (
      Object.keys(LABEL_TO_KEY) as Array<keyof typeof LABEL_TO_KEY>
    ).find((lbl) => lbl.toLowerCase() === parsed.label.toLowerCase());

    if (!matchedLabelKey) continue;

    const key = LABEL_TO_KEY[matchedLabelKey];
    // Typescript trick: only assign if key is known in result shape
    if (key === "bathtub" || key === "sink" || key === "floor") {
      result[key] = parsed.values;
    }
  }
  return result;
}

/**
 * Compare a parsed scene overlay values against the user selection for ONE item (e.g., bathtub).
 * If a value is present on scene and present on selection, they must be equal.
 * If a value is absent on scene OR absent on selection, we treat it as non-blocking.
 */
function overlayMatches(
  sceneVals: OverlayParsed | undefined,
  selVals: Record<string, Nullable<number>>
): boolean {
  if (!sceneVals) return true; // nothing to constrain for this item

  const checks: Array<[keyof OverlayParsed, Nullable<number>]> = [
    ["cat", selVals.category_id],
    ["model", selVals.model_id],
    ["mat", selVals.material_id],
    ["col", selVals.color_id]
  ];

  for (const [key, selValue] of checks) {
    const sceneValue = sceneVals[key];
    if (sceneValue == null || selValue == null) continue; // missing on either side => don't block
    if (sceneValue !== selValue) return false;
  }

  return true;
}

/**
 * Convert your Selection shape into a normalized comparable object per item
 * so overlayMatches() can work generically for bathtub/sink/floor.
 */
function normalizeSelection(selection: Selection) {
  return {
    bathtub: {
      category_id: selection.bathtub.bathtub_category_id,
      model_id: selection.bathtub.bathtub_model_id,
      material_id: selection.bathtub.bathtub_material_id,
      color_id: selection.bathtub.bathtub_color_id ?? null
    },
    sink: {
      category_id: selection.sink.sink_category_id,
      model_id: selection.sink.sink_model_id,
      material_id: selection.sink.sink_material_id,
      color_id: null
    },
    floor: {
      category_id: selection.floor.floor_category_id,
      model_id: selection.floor.floor_model_id,
      material_id: null,
      color_id: null
    }
  };
}

/**
 * Returns true if the scene title is compatible with the current selection.
 */
export function sceneTitleMatchesSelection(
  sceneTitle: string,
  selection: Selection
): boolean {
  const parsed = parseSceneTitle(sceneTitle);
  const sel = normalizeSelection(selection);

  // Bathtub / Sink / Floor must all individually match
  return (
    overlayMatches(parsed.bathtub, sel.bathtub) &&
    overlayMatches(parsed.sink, sel.sink) &&
    overlayMatches(parsed.floor, sel.floor)
  );
}

/**
 * Find the first scene whose title matches the selection.
 * If multiple match, you can add tie-breakers (e.g., prefer most-specific scene).
 */
export function findMatchingSceneByTitle<T extends Scene>(
  scenes: T[],
  selection: Selection
): T | undefined {
  // Optionally: sort by "specificity" (scenes that specify more tokens win)
  const specificity = (title: string) => {
    const p = parseSceneTitle(title);
    const count = (ov?: OverlayParsed) =>
      ov
        ? Number(ov.cat != null) +
          Number(ov.model != null) +
          Number(ov.mat != null) +
          Number(ov.col != null)
        : 0;
    return count(p.bathtub) + count(p.sink) + count(p.floor);
  };

  // Prefer scenes that specify more info (break ties by original order)
  const sorted = [...scenes].sort(
    (a, b) => specificity(b.title) - specificity(a.title)
  );

  for (const scene of sorted) {
    if (sceneTitleMatchesSelection(scene.title, selection)) {
      return scene;
    }
  }
  return undefined;
}

/* -----------------------------
   OPTIONAL: build a title string
   from the current selection so
   you can log/debug expectations.
------------------------------ */
export function buildTitleFromSelection(selection: Selection) {
  const part = (
    label: string,
    c: Nullable<number>,
    m: Nullable<number>,
    mat?: Nullable<number>,
    col?: Nullable<number>
  ) => {
    const bits = [`C${c ?? "x"}`, `M${m ?? "x"}`];
    if (mat !== undefined) bits.push(`MAT${mat ?? "x"}`);
    if (col !== undefined) bits.push(`COL${col ?? "x"}`);
    return `${label} ${bits.join("")}`;
  };

  return [
    part(
      "Bathtub",
      selection.bathtub.bathtub_category_id,
      selection.bathtub.bathtub_model_id,
      selection.bathtub.bathtub_material_id,
      selection.bathtub.bathtub_color_id
    ),
    part(
      "Sink",
      selection.sink.sink_category_id,
      selection.sink.sink_model_id,
      selection.sink.sink_material_id
    ),
    part(
      "Floor",
      selection.floor.floor_category_id,
      selection.floor.floor_model_id
    )
  ].join(" + ");
}
