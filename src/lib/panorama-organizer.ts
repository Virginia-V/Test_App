// This module provides utilities for parsing panorama image signatures and organizing panoramas into tours and scenes.

interface BathtubMetadata {
  category: string | null;
  model: string | null;
  material: string | null;
  color: string | null;
}

interface SinkMetadata {
  category: string | null;
  model: string | null;
  material: string | null;
}

interface FloorMetadata {
  category: string | null;
  model: string | null;
}

interface ParsedMetadata {
  panorama_id: string | null;
  base_asset_id: string | null;
  bathtub: BathtubMetadata;
  sink: SinkMetadata;
  floor: FloorMetadata;
}

interface PanoramaFromDB {
  id: number;
  signature: string;
  s3Key: string;
  sourcePanoramaId: number | null;
  imageKey?: string;
}

interface PanoramaImage {
  id: number;
  signature: string;
  s3Key: string;
  sourcePanoramaId: number | null;
  metadata: ParsedMetadata;
  sceneTitle: string;
}

interface Tour {
  tourId: string;
  panorama_id: string | null;
  base_asset_id: string | null;
  images: PanoramaImage[];
}

interface OrganizedStructure {
  tours: Tour[];
  totalTours: number;
  totalImages: number;
}

interface SceneOption {
  sceneId: string;
  originalSceneId: string;
  title: string;
  signature: string;
  thumbnail: string;
}

interface TourConfiguration {
  tourId: string;
  imageSet: string[];
  sceneOptions: SceneOption[];
}

export class PanoramaOrganizer {
  /**
   * Parses a panorama image signature string into structured metadata.
   * Example signature: "panorama-1_base-100_bathtub-C1_M2_MAT3_COL4_sink-C2_M1_MAT2_floor-C1_M1"
   */
  static parseImageSignature(signature: string): ParsedMetadata {
    const parts = signature.split("_");

    const metadata: ParsedMetadata = {
      panorama_id: null,
      base_asset_id: null,
      bathtub: { category: null, model: null, material: null, color: null },
      sink: { category: null, model: null, material: null },
      floor: { category: null, model: null }
    };

    let currentSection: "bathtub" | "sink" | "floor" | null = null;

    parts.forEach((part) => {
      // Parse panorama and base asset IDs
      if (part.startsWith("panorama-")) {
        metadata.panorama_id = part.replace("panorama-", "");
      } else if (part.startsWith("base-")) {
        metadata.base_asset_id = part.replace("base-", "");
      }
      // Parse bathtub section
      else if (part.startsWith("bathtub-")) {
        currentSection = "bathtub";
        const categoryMatch = part.match(/bathtub-C(\w+)/);
        if (categoryMatch) {
          metadata.bathtub.category =
            categoryMatch[1] === "x" ? null : categoryMatch[1];
        }
      }
      // Parse sink section
      else if (part.startsWith("sink-")) {
        currentSection = "sink";
        const categoryMatch = part.match(/sink-C(\w+)/);
        if (categoryMatch) {
          metadata.sink.category =
            categoryMatch[1] === "x" ? null : categoryMatch[1];
        }
      }
      // Parse floor section
      else if (part.startsWith("floor-")) {
        currentSection = "floor";
        const categoryMatch = part.match(/floor-C(\w+)/);
        if (categoryMatch) {
          metadata.floor.category =
            categoryMatch[1] === "x" ? null : categoryMatch[1];
        }
      }
      // Parse model for current section
      else if (part.startsWith("M") && currentSection) {
        const modelValue = part.replace("M", "");
        if (currentSection === "bathtub" && !metadata.bathtub.model) {
          metadata.bathtub.model = modelValue === "x" ? null : modelValue;
        } else if (currentSection === "sink" && !metadata.sink.model) {
          metadata.sink.model = modelValue === "x" ? null : modelValue;
        } else if (currentSection === "floor" && !metadata.floor.model) {
          metadata.floor.model = modelValue === "x" ? null : modelValue;
        }
      }
      // Parse material for current section
      else if (part.startsWith("MAT") && currentSection) {
        const materialValue = part.replace("MAT", "");
        if (currentSection === "bathtub") {
          metadata.bathtub.material =
            materialValue === "x" ? null : materialValue;
        } else if (currentSection === "sink") {
          metadata.sink.material = materialValue === "x" ? null : materialValue;
        }
      }
      // Parse color for bathtub section
      else if (part.startsWith("COL") && currentSection === "bathtub") {
        const colorValue = part.replace("COL", "");
        metadata.bathtub.color = colorValue === "x" ? null : colorValue;
      }
    });

    return metadata;
  }

  /**
   * Generates a tour ID based on panorama and base asset IDs.
   * Used to group images belonging to the same tour.
   */
  static generateTourId(metadata: ParsedMetadata): string {
    return `tour-${metadata.panorama_id}-${metadata.base_asset_id}`;
  }

  /**
   * Generates a human-readable scene title from parsed metadata.
   * Example: "Bathtub C1M2MAT3COL4 + Sink C2M1MAT2 + Floor C1M1"
   */
  static generateSceneTitle(metadata: ParsedMetadata): string {
    const parts: string[] = [];

    if (metadata.bathtub.category && metadata.bathtub.model) {
      let bathtubTitle = `Bathtub C${metadata.bathtub.category}M${metadata.bathtub.model}`;
      if (metadata.bathtub.material) {
        bathtubTitle += `MAT${metadata.bathtub.material}`;
      }
      if (metadata.bathtub.color) {
        bathtubTitle += `COL${metadata.bathtub.color}`;
      }
      parts.push(bathtubTitle);
    }

    if (metadata.sink.category && metadata.sink.model) {
      let sinkTitle = `Sink C${metadata.sink.category}M${metadata.sink.model}`;
      if (metadata.sink.material) {
        sinkTitle += `MAT${metadata.sink.material}`;
      }
      parts.push(sinkTitle);
    }

    if (metadata.floor.category && metadata.floor.model) {
      parts.push(`Floor C${metadata.floor.category}M${metadata.floor.model}`);
    }

    return parts.length > 0 ? parts.join(" + ") : "Default Configuration";
  }

  /**
   * Generates a unique scene ID string based on all variations in the metadata.
   */
  static generateSceneId(metadata: ParsedMetadata): string {
    const bathtubSig = `B${metadata.bathtub.category || "x"}M${
      metadata.bathtub.model || "x"
    }`;
    const sinkSig = `S${metadata.sink.category || "x"}M${
      metadata.sink.model || "x"
    }`;
    const floorSig = `F${metadata.floor.category || "x"}M${
      metadata.floor.model || "x"
    }`;

    return `scene-${bathtubSig}-${sinkSig}-${floorSig}`;
  }

  /**
   * Organizes a flat list of panoramas from the database into tours,
   * grouping by tourId and attaching parsed metadata and scene titles.
   */
  static organizeFromDatabase(panoramasFromDB: PanoramaFromDB[]): Tour[] {
    const tours = new Map<string, Tour>();

    panoramasFromDB.forEach((panorama) => {
      // Parse the signature to get metadata
      const metadata = this.parseImageSignature(panorama.signature);
      const tourId = this.generateTourId(metadata);

      // Create a new tour if it doesn't exist yet
      if (!tours.has(tourId)) {
        tours.set(tourId, {
          tourId,
          panorama_id: metadata.panorama_id,
          base_asset_id: metadata.base_asset_id,
          images: []
        });
      }

      const tour = tours.get(tourId)!;
      // Add the panorama image to the tour's images array
      tour.images.push({
        id: panorama.id,
        signature: panorama.signature,
        s3Key: panorama.s3Key,
        sourcePanoramaId: panorama.sourcePanoramaId,
        metadata,
        sceneTitle: this.generateSceneTitle(metadata)
      });
    });

    return Array.from(tours.values());
  }

  /**
   * Returns an organized structure with all tours and summary counts.
   */
  static getOrganizedStructure(
    panoramasFromDB: PanoramaFromDB[]
  ): OrganizedStructure {
    const tours = this.organizeFromDatabase(panoramasFromDB);

    return {
      tours,
      totalTours: tours.length,
      totalImages: panoramasFromDB.length
    };
  }

  /**
   * Returns the configuration for a specific tour, including image set and scene options.
   */
  static getTourConfiguration(
    tours: Tour[],
    tourId: string
  ): TourConfiguration | null {
    const tour = tours.find((t) => t.tourId === tourId);
    if (!tour) return null;

    return {
      tourId,
      imageSet: tour.images.map((img) => img.s3Key),
      sceneOptions: tour.images.map((img, index) => ({
        sceneId: `scene${index}`, // krpano uses scene0, scene1, etc.
        originalSceneId: this.generateSceneId(img.metadata),
        title: img.sceneTitle,
        signature: img.signature,
        thumbnail: `/tours/${tourId}/scene${index}/thumb.jpg`
      }))
    };
  }

  /**
   * Utility method to get all unique panorama/base combinations (tours) with image counts.
   */
  static getUniqueTourCombinations(panoramasFromDB: PanoramaFromDB[]): Array<{
    panorama_id: string;
    base_asset_id: string;
    tourId: string;
    imageCount: number;
  }> {
    const tours = this.organizeFromDatabase(panoramasFromDB);

    return tours.map((tour) => ({
      panorama_id: tour.panorama_id || "unknown",
      base_asset_id: tour.base_asset_id || "unknown",
      tourId: tour.tourId,
      imageCount: tour.images.length
    }));
  }

  /**
   * Utility method to validate if a signature contains required panorama and base asset IDs.
   */
  static validateSignature(signature: string): boolean {
    try {
      const metadata = this.parseImageSignature(signature);
      return !!(metadata.panorama_id && metadata.base_asset_id);
    } catch {
      return false;
    }
  }
}

// Export types for use in other files
export type {
  ParsedMetadata,
  PanoramaFromDB,
  PanoramaImage,
  Tour,
  OrganizedStructure,
  SceneOption,
  TourConfiguration,
  BathtubMetadata,
  SinkMetadata,
  FloorMetadata
};
