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

export async function fetchSceneMetadata(
  sceneId: string
): Promise<SceneMetadata> {
  const res = await fetch(
    `https://pub-f8c8c146ca47443e8eab15da50a51ecf.r2.dev/tours/tour-1-1/${sceneId}/scene.json`
  );
  if (!res.ok) throw new Error("Failed to fetch scene metadata");
  const data = await res.json();
  return {
    ...data,
    metadata: remapMetadata(data.metadata)
  };
}
