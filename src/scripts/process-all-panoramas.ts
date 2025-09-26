// src/scripts/process-all-panoramas.ts
import fetch from "node-fetch";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
// import {
//   PanoramaFromDB,
//   Tour,
//   PanoramaOrganizer
// } from "@/lib/panorama-organizer";
import {
  PanoramaFromDB,
  PanoramaOrganizer,
  Tour
} from "../lib/panorama-organizer";


const execAsync = promisify(exec);

interface ProcessorConfig {
  apiBaseUrl: string;
  krpanoPath: string;
}

interface DownloadedImage {
  path: string;
  panorama: PanoramaImage;
  sceneIndex: number;
}

interface PanoramaImage {
  id: number;
  signature: string;
  s3Key: string;
  sourcePanoramaId: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  sceneTitle: string;
}

interface SceneMetadata {
  sceneId: string;
  title: string;
  signature: string;
  thumbnail: string;
}

interface ProcessResult {
  success: boolean;
  tourId: string;
  sceneCount?: number;
  scenes?: SceneMetadata[];
  error?: string;
}

interface PanoramaListResponse {
  success: boolean;
  totalCount: number;
  panoramas: PanoramaFromDB[];
  error?: string;
}

class CompleteBatchProcessor {
  private apiBaseUrl: string;
  private krpanoPath: string;
  private tempDir: string;
  private outputDir: string;

  constructor(config: ProcessorConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.krpanoPath = config.krpanoPath;
    this.tempDir = "./temp";
    this.outputDir = "./public/tours";
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  // Fetch all panoramas from your database via API
  async getAllPanoramas(): Promise<PanoramaFromDB[]> {
    console.log("🔍 Fetching all panoramas from database...");

    const response = await fetch(`${this.apiBaseUrl}/api/panoramas/list`);
    const data = (await response.json()) as PanoramaListResponse;

    if (!data.success) {
      throw new Error(`Failed to fetch panoramas: ${data.error}`);
    }

    console.log(`📊 Found ${data.totalCount} panoramas in database`);
    return data.panoramas;
  }

  // Download image using your existing panorama file route
  async downloadPanorama(
    panorama: PanoramaImage,
    localPath: string
  ): Promise<string> {
    console.log(`⬇️ Downloading: ${panorama.signature}`);

    // Use your existing panorama file route with signature
    const url = `${
      this.apiBaseUrl
    }/api/panorama-file?signature=${encodeURIComponent(
      panorama.signature
    )}&panoramaId=${panorama.sourcePanoramaId}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download ${panorama.signature}: ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(localPath, buffer);
    return localPath;
  }

  // Process a single tour (multiple scenes)
  async processTour(tour: Tour): Promise<ProcessResult> {
    console.log(
      `🎬 Processing tour: ${tour.tourId} (${tour.images.length} scenes)`
    );

    const downloadedImages: DownloadedImage[] = [];

    try {
      // Download all images for this tour
      for (let i = 0; i < tour.images.length; i++) {
        const panorama = tour.images[i];
        const localPath = path.join(
          this.tempDir,
          `${tour.tourId}_scene${i}.png`
        );

        await this.downloadPanorama(panorama, localPath);
        downloadedImages.push({
          path: localPath,
          panorama,
          sceneIndex: i
        });
      }

      // Create krpano config for this tour
      const configContent = this.createTourConfig(
        downloadedImages,
        tour.tourId
      );
      const configPath = path.join(this.tempDir, `${tour.tourId}.config`);
      await fs.writeFile(configPath, configContent);

      // Execute krpano processing
      const outputPath = path.join(this.outputDir, tour.tourId);
      const command = `"${this.krpanoPath}" "${configPath}" -o="${outputPath}"`;

      console.log(`⚙️ Running krpano for ${tour.tourId}...`);
      await execAsync(command);

      // Generate scene metadata for frontend
      const sceneMetadata: SceneMetadata[] = tour.images.map((img, index) => ({
        sceneId: `scene${index}`,
        title: img.sceneTitle,
        signature: img.signature,
        thumbnail: `/tours/${tour.tourId}/panos/scene${index}.tiles/thumb.jpg`
      }));

      await fs.writeFile(
        path.join(outputPath, "scenes.json"),
        JSON.stringify(sceneMetadata, null, 2)
      );

      // Cleanup temp files
      await Promise.all(downloadedImages.map((img) => fs.unlink(img.path)));
      await fs.unlink(configPath);

      console.log(`✅ Successfully processed ${tour.tourId}`);
      return {
        success: true,
        tourId: tour.tourId,
        sceneCount: tour.images.length,
        scenes: sceneMetadata
      };
    } catch (error) {
      console.error(`❌ Failed to process ${tour.tourId}:`, error);

      // Cleanup on error
      await Promise.all(
        downloadedImages.map(async (img) => {
          try {
            await fs.unlink(img.path);
          } catch (unlinkError) {
            console.warn(
              `⚠️ Failed to delete temp file ${img.path}:`,
              unlinkError
            );
          }
        })
      );

      return {
        success: false,
        tourId: tour.tourId,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private createTourConfig(
    downloadedImages: DownloadedImage[],
    tourId: string
  ): string {
    return `
# Multi-scene tour configuration for ${tourId}
include basicsettings.config
panotype=autodetect,flat
hfov=360
makescenes=true

# output path
outputpath=${path.join(this.outputDir, tourId)}

# convert spherical/cylindrical to cubical
converttocube=true
converttocubelimit=360x120
converttocubemaxwidth=60000

# multiresolution settings
multires=true
tilesize=512
levels=auto
levelstep=2
maxsize=auto
maxcubesize=auto
stereosupport=true
adjustlevelsizes=true
adjustlevelsizesformipmapping=true

# output images path
tilepath=%OUTPUTPATH%/panos/%BASENAME%.tiles/[c/]l%Al/%Av/l%Al[_c]_%Av_%Ah.jpg

# preview pano settings
preview=true
graypreview=false
previewsmooth=25
previewpath=%OUTPUTPATH%/panos/%BASENAME%.tiles/preview.jpg

# generate thumbnails
makethumb=true
thumbsize=240
thumbpath=%OUTPUTPATH%/panos/%BASENAME%.tiles/thumb.jpg

# xml output
xml=true
xmlpath=%OUTPUTPATH%/tour.xml

# html output/template
html=true
htmlpath=%OUTPUTPATH%/tour.html
htmlviewerpath=%OUTPUTPATH%/tour.js

# skin / xml template
include vtourskin120.skin

# Process multiple images
${downloadedImages.map((img) => `INPUT="${img.path}"`).join("\n")}
`;
  }

  async processAll(): Promise<ProcessResult[]> {
    console.log("🚀 Starting complete batch processing...\n");

    try {
      // Step 1: Get all panoramas from database
      const allPanoramas = await this.getAllPanoramas();

      // Step 2: Organize into tours
      console.log("📁 Organizing panoramas into tours...");
      const tours = PanoramaOrganizer.organizeFromDatabase(allPanoramas);
      console.log(`Found ${tours.length} tours\n`);

      // Step 3: Process each tour
      const results: ProcessResult[] = [];
      let processedCount = 0;

      for (const tour of tours) {
        const result = await this.processTour(tour);
        results.push(result);
        processedCount++;

        console.log(
          `Progress: ${processedCount}/${tours.length} tours processed\n`
        );
      }

      // Step 4: Final summary
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      const totalScenes = results.reduce(
        (sum, r) => sum + (r.sceneCount || 0),
        0
      );

      console.log("🎉 Batch Processing Complete!");
      console.log(`✅ Successful tours: ${successful}`);
      console.log(`❌ Failed tours: ${failed}`);
      console.log(`🎬 Total scenes processed: ${totalScenes}`);

      if (failed > 0) {
        console.log("\nFailed tours:");
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            console.log(`- ${r.tourId}: ${r.error}`);
          });
      }

      return results;
    } catch (error) {
      console.error("💥 Batch processing failed:", error);
      throw error;
    }
  }
}

// Main execution function
async function main(): Promise<void> {
  const processor = new CompleteBatchProcessor({
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    krpanoPath:
      process.env.KRPANO_PATH || "/Applications/krpano-1.23.1/krpanotools"
  });

  try {
    await processor.initialize();
    const results = await processor.processAll();

    // Exit with appropriate code
    const hasFailures = results.some((r) => !r.success);
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run the script only if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

export { CompleteBatchProcessor };
export type { ProcessorConfig, ProcessResult, SceneMetadata };
