export type ProductModel = {
  modelId: string;
  title: string;
  reference: string;
  description: string;
};

export type ProductCategory = {
  categoryId: string;
  models: ProductModel[];
};

export type ProductInfoMap = {
  bathtub: ProductCategory;
  sink: ProductCategory;
  floor: ProductCategory;
};

export const PRODUCT_INFO_MAP: ProductInfoMap = {
  bathtub: {
    categoryId: "1",
    models: [
      {
        modelId: "1",
        title: "Orava",
        reference: "ORA-2101",
        description: "product.bathtub_Model_01_Description"
      },
      {
        modelId: "2",
        title: "Kalyra",
        reference: "KAL-2102",
        description: "product.bathtub_Model_02_Description"
      },

      {
        modelId: "3",
        title: "Serelis",
        reference: "SER-2103",
        description: "product.bathtub_Model_03_Description"
      }
    ]
  },

  // categoryId "2" — Sink
  sink: {
    categoryId: "2",
    models: [
      {
        modelId: "4",
        title: "AUREO",
        reference: "AUR-3101",
        description: "product.sink_Model_04_Description"
      },
      {
        modelId: "5",
        title: "VAREL",
        reference: "VAR-3102",
        description: "product.sink_Model_05_Description"
      },
      {
        modelId: "6",
        title: "SORELIS",
        reference: "SOR-3103",
        description: "product.sink_Model_06_Description"
      }
    ]
  },

  floor: {
    categoryId: "3",
    models: [
      {
        modelId: "7",
        title: "CAVARE",
        reference: "CAV-4103",
        description: "product.floor_Model_07_Description"
      },
      {
        modelId: "8",
        title: "TERRANO",
        reference: "TER-4101",
        description: "product.floor_Model_08_Description"
      },
      {
        modelId: "9",
        title: "LIVARIS",
        reference: "LIV-4102",
        description: "product.floor_Model_09_Description"
      }
    ]
  }
};

// Helper
export type ProductInfo = {
  title: string;
  reference: string;
  description: string;
};

export type ProductInfoCategoryKey = keyof ProductInfoMap;

export const getProductInfo = (
  categoryKey?: ProductInfoCategoryKey | null,
  modelId?: string | number | null
): ProductInfo | null => {
  if (!categoryKey || modelId == null) return null;
  const category = PRODUCT_INFO_MAP[categoryKey];
  if (!category) return null;
  const model = category.models.find(
    (m) => String(m.modelId) === String(modelId)
  );
  if (!model) return null;
  return {
    title: model.title,
    reference: model.reference,
    description: model.description
  };
};
