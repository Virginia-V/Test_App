import fetch from "node-fetch";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import {
  PanoramaFromDB,
  PanoramaOrganizer,
  Tour,
  PanoramaImage
} from "../lib/panorama-organizer";

const execAsync = promisify(exec);

interface CDNPreprocessorConfig {
  apiBaseUrl: string;
  krpanoPath: string;
  outputDir: string;
}

interface SceneManifest {
  sceneId: string;
  title: string;
  signature: string;
  tilesPath: string;
  previewPath: string;
  thumbnailPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

interface TourManifest {
  tourId: string;
  panoramaId: string;
  baseAssetId: string;
  totalScenes: number;
  scenes: SceneManifest[];
  createdAt: string;
}

interface ProcessingResult {
  success: boolean;
  tourId: string;
  sceneCount: number;
  error?: string;
  outputSize?: number;
}

class PanoramaCDNPreprocessor {
  private apiBaseUrl: string;
  private krpanoPath: string;
  private tempDir: string;
  private outputDir: string;

  constructor(config: CDNPreprocessorConfig) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.krpanoPath = config.krpanoPath;
    this.tempDir = "./temp";
    this.outputDir = config.outputDir || "./public";
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, "tours"), { recursive: true });
  }

  // Fetch all panoramas from database
  async getAllPanoramas(): Promise<PanoramaFromDB[]> {
    console.log("🔍 Fetching all panoramas from database...");

    const response = await fetch(`${this.apiBaseUrl}/api/panoramas/list`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json()) as any;

    if (!data.success) {
      throw new Error(`Failed to fetch panoramas: ${data.error}`);
    }

    console.log(`📊 Found ${data.totalCount} panoramas in database`);
    return data.panoramas;
  }

  // Download single panorama
  async downloadPanorama(
    panorama: PanoramaImage,
    localPath: string
  ): Promise<void> {
    console.log(`⬇️ Downloading: ${panorama.signature}`);

    const url = `${
      this.apiBaseUrl
    }/api/panorama-file?signature=${encodeURIComponent(
      panorama.signature
    )}&panoramaId=${panorama.sourcePanoramaId}`;

    console.log(`🌐 Fetching from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download ${panorama.signature}: ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(localPath, buffer);

    console.log(`💾 Saved to: ${localPath}`);
  }

  // Process single panorama with proper krpano setup for consolidated tour
  async preprocessSinglePanorama(
    panorama: PanoramaImage,
    tourId: string,
    sceneIndex: number
  ): Promise<SceneManifest> {
    const sceneId = `scene${sceneIndex}`;
    const outputDir = path.join(this.outputDir, "tours", tourId, sceneId);

    // Skip if scene.json already exists
    const sceneJsonPath = path.join(outputDir, "scene.json");
    try {
      await fs.access(sceneJsonPath);
      console.log(`⏩ Skipping ${sceneId} (already processed)`);
      const manifest = JSON.parse(await fs.readFile(sceneJsonPath, "utf-8"));
      return manifest;
    } catch {
      // Not processed yet, continue as normal
    }

    console.log(`📸 Processing ${panorama.signature} -> ${sceneId}`);

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Download panorama to temp location
    const tempPath = path.join(this.tempDir, `${tourId}_${sceneId}.jpg`);
    await this.downloadPanorama(panorama, tempPath);

    try {
      // Use the proper krpano structure from public/krpano
      const projectRoot = process.cwd();
      const krpanoDir = path.join(projectRoot, "public", "krpano");

      // Use vtour-multires.config for CDN preprocessing with tour features
      // This generates tiles with tour-specific optimizations
      const configPath = path.join(
        krpanoDir,
        "templates",
        "vtour-multires.config"
      );

      // Verify the setup
      console.log(`🔧 Using krpano directory: ${krpanoDir}`);
      console.log(`📋 Using config: ${configPath}`);

      // Verify config file exists
      try {
        await fs.access(configPath);
        console.log(`✅ Found config file`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (configError) {
        throw new Error(`Config file not found: ${configPath}`);
      }

      // Verify templates and viewer directories exist
      const templatesDir = path.join(krpanoDir, "templates");
      const viewerDir = path.join(krpanoDir, "viewer");

      try {
        await fs.access(templatesDir);
        await fs.access(viewerDir);
        console.log(`✅ Found templates and viewer directories`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (dirError) {
        throw new Error(`Required krpano directories not found`);
      }

      // Use absolute paths
      const absoluteTempPath = path.resolve(tempPath);
      const absoluteOutputDir = path.resolve(outputDir);

      // Create a custom config for CDN preprocessing inside krpano directory
      const customConfig = this.createCDNConfig(absoluteOutputDir);
      const customConfigPath = path.join(krpanoDir, `${sceneId}_cdn.config`);
      await fs.writeFile(customConfigPath, customConfig);

      // Run krpano from the krpano directory with proper working directory
      const command = `cd "${krpanoDir}" && "${this.krpanoPath}" makepano "${customConfigPath}" "${absoluteTempPath}"`;
      console.log(`⚙️ Running krpano command from: ${krpanoDir}`);

      try {
        const { stdout, stderr } = await execAsync(command, {
          timeout: 300000, // 5 minute timeout for large images
          cwd: krpanoDir // Set working directory to krpano folder
        });

        console.log(`📋 Krpano completed successfully`);

        // Show only important output lines
        const lines = stdout.split("\n");
        const importantLines = lines.filter(
          (line) =>
            line.includes("processing") ||
            line.includes("done.") ||
            line.includes("output:") ||
            line.includes("making images") ||
            line.includes("ERROR") ||
            line.includes("multires")
        );

        if (importantLines.length > 0) {
          console.log(`📋 Key output:\n${importantLines.slice(-8).join("\n")}`);
        }

        if (stderr && !stderr.includes("including config file")) {
          console.log(`⚠️ Krpano stderr:`, stderr);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (execError: any) {
        console.error(`❌ Krpano execution failed:`, execError);

        // Check if files were created despite timeout
        if (execError.killed && execError.signal === "SIGTERM") {
          console.log(`⏰ Process timed out, checking for created files...`);
        } else {
          throw execError;
        }
      }

      // Wait for file system to sync
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check what files were actually created
      console.log(`🔍 Checking output directory: ${outputDir}`);
      try {
        const outputFiles = await fs.readdir(outputDir, { recursive: true });
        console.log(`📁 Found ${outputFiles.length} files`);

        if (outputFiles.length > 0) {
          // Categorize files for better reporting
          const tiles = outputFiles.filter(
            (f) =>
              f.includes("l0_") ||
              f.includes("l1_") ||
              f.includes("l2_") ||
              f.includes("l3_") ||
              f.includes("panos/")
          );
          const previews = outputFiles.filter((f) => f.includes("preview"));
          const thumbs = outputFiles.filter((f) => f.includes("thumb"));
          const others = outputFiles.filter(
            (f) =>
              !tiles.includes(f) && !previews.includes(f) && !thumbs.includes(f)
          );

          console.log(`  📷 Tiles: ${tiles.length}`);
          console.log(`  🖼️ Preview: ${previews.length}`);
          console.log(`  🔍 Thumb: ${thumbs.length}`);
          console.log(`  📄 Other: ${others.length}`);

          // Show sample files
          if (tiles.length > 0) {
            console.log(`  Sample tiles: ${tiles.slice(0, 3).join(", ")}`);
          }

          // Verify essential files exist
          const hasPreview = previews.length > 0;
          const hasTiles = tiles.length > 0;
          console.log(`✅ Has preview: ${hasPreview}, Has tiles: ${hasTiles}`);

          if (!hasTiles) {
            throw new Error("No tile files were created");
          }
        } else {
          throw new Error("No output files were created");
        }
      } catch (readError) {
        console.error(`❌ Could not read output directory:`, readError);
        throw readError;
      }

      // Create scene manifest
      const sceneManifest: SceneManifest = {
        sceneId,
        title: panorama.sceneTitle,
        signature: panorama.signature,
        tilesPath: `/tours/${tourId}/${sceneId}/panos`,
        previewPath: `/tours/${tourId}/${sceneId}/preview.jpg`,
        thumbnailPath: `/tours/${tourId}/${sceneId}/thumb.jpg`,
        metadata: panorama.metadata
      };

      // Save individual scene metadata
      await fs.writeFile(
        path.join(outputDir, "scene.json"),
        JSON.stringify(sceneManifest, null, 2)
      );

      // Cleanup temp files (handle case where krpano consumed the input file)
      try {
        await fs.unlink(tempPath);
      } catch (unlinkError) {
        // File may have been consumed by krpano process, which is normal
        console.log(`ℹ️ Temp file ${tempPath} already cleaned up by krpano`);
      }

      try {
        await fs.unlink(customConfigPath);
      } catch (unlinkError) {
        console.log(
          `⚠️ Could not delete config file ${customConfigPath}:`,
          unlinkError
        );
      }

      console.log(`✅ Successfully processed ${sceneId}`);
      return sceneManifest;
    } catch (error) {
      console.error(`❌ Error processing ${sceneId}:`, error);
      // Cleanup on error (handle case where files don't exist)
      try {
        await fs.unlink(tempPath);
      } catch {
        // File may not exist, ignore error
      }

      // Try to cleanup config file if it was created
      const projectRoot = process.cwd();
      const krpanoDir = path.join(projectRoot, "public", "krpano");
      const configPath = path.join(krpanoDir, `${sceneId}_cdn.config`);
      try {
        await fs.unlink(configPath);
      } catch {
        // Config file may not exist, ignore error
      }
      throw error;
    }
  }

  // Create optimized config for CDN preprocessing - tiles only, no XML
  private createCDNConfig(outputDir: string): string {
    return `
# CDN Preprocessing Config - Tiles Only
# Based on vtour-multires.config with CDN optimizations

# Basic settings (inlined from basicsettings.config)
filter=LANCZOS
jpegquality=82
jpegsubsamp=422
jpegoptimize=true
profile=sRGB
parsegps=true
autolevel=remap
sortinput=true

# Tour settings
panotype=autodetect,flat
hfov=360
makescenes=false

# Output settings
outputpath=${outputDir}

# Convert to cube format for best performance
converttocube=true
converttocubelimit=360x120
converttocubemaxwidth=60000

# Generate multires tiles with tour features
multires=true
tilesize=512
levels=auto
levelstep=2
maxsize=auto
maxcubesize=auto
stereosupport=true
adjustlevelsizes=true
adjustlevelsizesformipmapping=true

# Tile output structure
tilepath=%OUTPUTPATH%/panos/%BASENAME%.tiles/[c/]l%Al/%Av/l%Al[_c]_%Av_%Ah.jpg

# Preview image
preview=true
graypreview=false
previewsmooth=25
previewpath=%OUTPUTPATH%/preview.jpg
previewsize=1024x512

# Thumbnail
makethumb=true
thumbsize=240
thumbpath=%OUTPUTPATH%/thumb.jpg

# Override quality settings for web delivery
jpegquality=85
jpegsubsamp=444
jpegoptimize=true
jpegprogressive=true

# Disable XML output - we'll generate consolidated tour.xml manually
xml=false

# HTML output disabled
html=false
`;
  }

  // Generate consolidated tour.xml with all scenes
  private generateConsolidatedTourXML(
    tour: Tour,
    scenes: SceneManifest[]
  ): string {
    const sceneElements = scenes
      .map((scene) => {
        // Extract a clean scene name from the signature or filename
        // Example: "panorama-1_base-1_bathtub-C1_M3_MAT9_COLx_sink-C2_M6_MAT18_floor-C3_M9_MATx.png"
        // → "test_pano_stone_variant_2" (you may need to adjust this logic)
        const baseName = scene.signature
          .replace(/^panorama-/, "")
          .replace(/\.jpg$|\.jpeg$|\.png$/i, "")
          .replace(/[^a-zA-Z0-9_]/g, "_"); // fallback: safe for filenames

        return `
  <scene name="scene_${baseName}" title="${scene.title}" onstart="" thumburl="panos/${baseName}.tiles/thumb.jpg" lat="" lng="" alt="" heading="">
    <control bouncinglimits="calc:image.cube ? true : false" />
    <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" maxpixelzoom="2.0" fovmin="70" fovmax="140" limitview="auto" />
    <preview url="panos/${baseName}.tiles/preview.jpg" />
    <image>
      <cube url="panos/${baseName}.tiles/%s/l%l/l%l_%s_%0v_%0h.jpg" multires="512,640,1280,2624,5248" />
    </image>
  </scene>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<krpano version="1.23" title="Virtual Tour - ${tour.tourId}">

  <include url="skin/vtourskin.xml" />

  <skin_settings maps="false"
    maps_type="openstreetmaps"
    maps_bing_api_key=""
    maps_google_api_key=""
    maps_zoombuttons="false"
    maps_loadonfirstuse="true"
    gyro="true"
    gyro_keeplookingdirection="false"
    webvr="true"
    webvr_keeplookingdirection="true"
    webvr_prev_next_hotspots="true"
    autotour="false"
    littleplanetintro="false"
    followmousecontrol="false"
    title="true"
    thumbs="true"
    thumbs_width="120" thumbs_height="80" thumbs_padding="10" thumbs_crop="0|40|240|160"
    thumbs_opened="false"
    thumbs_text="false"
    thumbs_dragging="true"
    thumbs_onhoverscrolling="false"
    thumbs_scrollbuttons="false"
    thumbs_scrollindicator="false"
    thumbs_loop="false"
    tooltips_buttons="false"
    tooltips_thumbs="false"
    tooltips_hotspots="false"
    tooltips_mapspots="false"
    deeplinking="false"
    loadscene_flags="MERGE"
    loadscene_blend="OPENBLEND(0.5, 0.0, 0.75, 0.05, linear)"
    loadscene_blend_prev="SLIDEBLEND(0.5, 180, 0.75, linear)"
    loadscene_blend_next="SLIDEBLEND(0.5,   0, 0.75, linear)"
    loadingtext=""
    layout_width="100%"
    layout_maxwidth="814"
    controlbar_width="-24"
    controlbar_height="40"
    controlbar_offset="20"
    controlbar_offset_closed="-40"
    controlbar_overlap.no-fractionalscaling="10"
    controlbar_overlap.fractionalscaling="0"
    design_skin_images="vtourskin.png"
    design_bgcolor="0x2D3E50"
    design_bgalpha="0.8"
    design_bgborder="0"
    design_bgroundedge="1"
    design_bgshadow="0 4 10 0x000000 0.3"
    design_thumbborder_bgborder="3 0xFFFFFF 1.0"
    design_thumbborder_padding="2"
    design_thumbborder_bgroundedge="0"
    design_text_css="color:#FFFFFF; font-family:Arial;"
    design_text_shadow="1"
  />

  <!--
      For an alternative skin design either change the <skin_settings> values 
      from above or optionally include one of the predefined designs from below.
  -->
  <!-- <include url="skin/vtourskin_design_flat_light.xml"  /> -->
  <!-- <include url="skin/vtourskin_design_glass.xml"       /> -->
  <!-- <include url="skin/vtourskin_design_ultra_light.xml" /> -->
  <!-- <include url="skin/vtourskin_design_117.xml"         /> -->
  <!-- <include url="skin/vtourskin_design_117round.xml"    /> -->
  <!-- <include url="skin/vtourskin_design_black.xml"       /> -->

${sceneElements}

</krpano>`;
  }

  // Create tour manifest with all scenes
  async createTourManifest(
    tour: Tour,
    scenes: SceneManifest[]
  ): Promise<TourManifest> {
    const manifest: TourManifest = {
      tourId: tour.tourId,
      panoramaId: tour.panorama_id || "unknown",
      baseAssetId: tour.base_asset_id || "unknown",
      totalScenes: scenes.length,
      scenes,
      createdAt: new Date().toISOString()
    };

    const manifestPath = path.join(
      this.outputDir,
      "tours",
      `${tour.tourId}.json`
    );
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`📋 Created tour manifest: ${tour.tourId}.json`);
    return manifest;
  }

  // Process single tour
  async processTour(tour: Tour): Promise<ProcessingResult> {
    console.log(
      `🎬 Processing tour: ${tour.tourId} (${tour.images.length} scenes)`
    );

    try {
      const scenes: SceneManifest[] = [];

      // Create main tour directory
      const tourDir = path.join(this.outputDir, "tours", tour.tourId);
      await fs.mkdir(tourDir, { recursive: true });

      // Process each scene individually
      for (let i = 0; i < tour.images.length; i++) {
        const panorama = tour.images[i];
        const sceneManifest = await this.preprocessSinglePanorama(
          panorama,
          tour.tourId,
          i
        );
        scenes.push(sceneManifest);

        console.log(
          `Progress: ${i + 1}/${tour.images.length} scenes processed for ${
            tour.tourId
          }`
        );
      }

      // Generate consolidated tour.xml
      const tourXMLContent = this.generateConsolidatedTourXML(tour, scenes);
      const tourXMLPath = path.join(tourDir, "tour.xml");
      await fs.writeFile(tourXMLPath, tourXMLContent);
      console.log(`📋 Created consolidated tour.xml for ${tour.tourId}`);

      // Copy krpano.js to tour directory for standalone operation
      await this.copyKrpanoFiles(tourDir);

      // Create tour manifest
      await this.createTourManifest(tour, scenes);

      // Calculate output size (optional)
      const outputSize = await this.calculateOutputSize(tour.tourId);

      return {
        success: true,
        tourId: tour.tourId,
        sceneCount: scenes.length,
        outputSize
      };
    } catch (error) {
      console.error(`❌ Failed to process tour ${tour.tourId}:`, error);
      return {
        success: false,
        tourId: tour.tourId,
        sceneCount: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Calculate output directory size
  private async calculateOutputSize(tourId: string): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `du -sb "${path.join(this.outputDir, "tours", tourId)}"`
      );
      return parseInt(stdout.split("\t")[0]);
    } catch {
      return 0;
    }
  }

  // Copy essential krpano files to tour directory
  private async copyKrpanoFiles(tourDir: string): Promise<void> {
    try {
      const krpanoSrcPath = path.join(process.cwd(), "public", "kp");

      // Copy krpano.js (main viewer file)
      const krpanoJsSrc = path.join(krpanoSrcPath, "krpano.js");
      const krpanoJsDest = path.join(tourDir, "krpano.js");

      try {
        await fs.access(krpanoJsSrc);
        await fs.copyFile(krpanoJsSrc, krpanoJsDest);
        console.log(`📋 Copied krpano.js to ${tourDir}`);
      } catch {
        console.log(`⚠️ krpano.js not found at ${krpanoJsSrc}, skipping`);
      }

      // Copy skin directory if it exists
      const skinSrcPath = path.join(krpanoSrcPath, "skin");
      const skinDestPath = path.join(tourDir, "skin");

      try {
        await fs.access(skinSrcPath);
        await this.copyDirectoryRecursive(skinSrcPath, skinDestPath);
        console.log(`📋 Copied skin directory to ${tourDir}`);
      } catch {
        console.log(`⚠️ Skin directory not found at ${skinSrcPath}, skipping`);
      }
    } catch (error) {
      console.log(`⚠️ Could not copy krpano files:`, error);
    }
  }

  // Helper method to copy directories recursively
  private async copyDirectoryRecursive(
    src: string,
    dest: string
  ): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const files = await fs.readdir(src);

    for (const file of files) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      const stat = await fs.stat(srcFile);

      if (stat.isDirectory()) {
        await this.copyDirectoryRecursive(srcFile, destFile);
      } else {
        await fs.copyFile(srcFile, destFile);
      }
    }
  }

  // Main preprocessing function
  async preprocessAllForCDN(): Promise<ProcessingResult[]> {
    console.log("🚀 Starting CDN preprocessing...\n");

    try {
      // Initialize directories
      await this.initialize();

      // Get all panoramas and organize into tours
      const allPanoramas = await this.getAllPanoramas();
      const tours = PanoramaOrganizer.organizeFromDatabase(allPanoramas);

      console.log(`📁 Found ${tours.length} tours to process`);
      console.log(`📸 Total panoramas: ${allPanoramas.length}\n`);

      // Process each tour
      const results: ProcessingResult[] = [];
      let processedCount = 0;

      for (const tour of tours) {
        console.log(
          `\n🔄 Processing tour ${processedCount + 1}/${tours.length}`
        );

        const result = await this.processTour(tour);
        results.push(result);
        processedCount++;

        // Show progress
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;
        console.log(
          `📊 Progress: ${successful} successful, ${failed} failed\n`
        );
      }

      // Create master index
      await this.createMasterIndex(results.filter((r) => r.success));

      // Final summary
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      const totalScenes = results.reduce((sum, r) => sum + r.sceneCount, 0);
      const totalSize = results.reduce(
        (sum, r) => sum + (r.outputSize || 0),
        0
      );

      console.log("\n🎉 CDN Preprocessing Complete!");
      console.log(`✅ Successful tours: ${successful}`);
      console.log(`❌ Failed tours: ${failed}`);
      console.log(`🎬 Total scenes processed: ${totalScenes}`);
      console.log(
        `💾 Total output size: ${Math.round(totalSize / 1024 / 1024)}MB`
      );

      if (failed > 0) {
        console.log("\n❌ Failed tours:");
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            console.log(`- ${r.tourId}: ${r.error}`);
          });
      }

      return results;
    } catch (error) {
      console.error("💥 CDN preprocessing failed:", error);
      throw error;
    }
  }

  // Create master index of all tours
  private async createMasterIndex(
    successfulResults: ProcessingResult[]
  ): Promise<void> {
    const index = {
      totalTours: successfulResults.length,
      totalScenes: successfulResults.reduce((sum, r) => sum + r.sceneCount, 0),
      totalSize: successfulResults.reduce(
        (sum, r) => sum + (r.outputSize || 0),
        0
      ),
      tours: successfulResults.map((r) => ({
        tourId: r.tourId,
        sceneCount: r.sceneCount,
        manifestPath: `/tours/${r.tourId}.json`,
        tourXMLPath: `/tours/${r.tourId}/tour.xml`,
        size: r.outputSize
      })),
      createdAt: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(this.outputDir, "tours", "index.json"),
      JSON.stringify(index, null, 2)
    );

    console.log("📋 Created master tours index");
  }
}

// Main execution
async function main(): Promise<void> {
  const processor = new PanoramaCDNPreprocessor({
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    krpanoPath:
      process.env.KRPANO_PATH || "/Applications/krpano-1.23.1/krpanotools",
    outputDir: "./public"
  });

  try {
    const results = await processor.preprocessAllForCDN();

    const hasFailures = results.some((r) => !r.success);
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

// Export with unique name
export { PanoramaCDNPreprocessor };
export type {
  TourManifest,
  SceneManifest,
  ProcessingResult,
  CDNPreprocessorConfig
};
