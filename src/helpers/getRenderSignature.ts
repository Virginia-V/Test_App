type Nullable<T> = T | null;

export function getRenderSignature({
  panoramaId,
  baseAssetId,
  bathtub,
  sink,
  floor
}: {
  panoramaId: number;
  baseAssetId: number;
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
}) {
  // Helper to format overlay info
  const formatOverlay = (
    prefix: string,
    cat: Nullable<number>,
    model: Nullable<number>,
    mat: Nullable<number>,
    color?: Nullable<number>
  ) =>
    [
      `${prefix}C${cat ?? "x"}`,
      `M${model ?? "x"}`,
      `MAT${mat ?? "x"}`,
      color !== undefined ? `COL${color ?? "x"}` : null
    ]
      .filter(Boolean)
      .join("_");

  return (
    [
      `panorama-${panoramaId}`,
      `base-${baseAssetId}`,
      formatOverlay(
        "bathtub-",
        bathtub.bathtub_category_id,
        bathtub.bathtub_model_id,
        bathtub.bathtub_material_id,
        bathtub.bathtub_color_id
      ),
      formatOverlay(
        "sink-",
        sink.sink_category_id,
        sink.sink_model_id,
        sink.sink_material_id
      ),
      formatOverlay(
        "floor-",
        floor.floor_category_id,
        floor.floor_model_id,
        null
      )
    ].join("_") + ".png"
  );
}
