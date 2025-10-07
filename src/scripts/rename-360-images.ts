// rename-360-images.ts
import * as fs from "fs";
import * as path from "path";

const baseDir = "public/360-images/Sink/Sink_Model_03/Sink_Model_03_Mat_03";

interface RenameResult {
  success: number;
  failed: number;
  skipped: number;
}

// Function to extract number from filename and convert to padded format
function extractAndPadNumber(filename: string): string | null {
  // Remove file extension
  const nameWithoutExt = path.parse(filename).name;

  // Try to extract number from various patterns
  let match: RegExpMatchArray | null;

  // Pattern: 01_BATH-A_BMAT-A1 (6) -> extract 6
  match = nameWithoutExt.match(/\((\d+)\)$/);
  if (match) {
    return String(parseInt(match[1], 10)).padStart(4, "0");
  }

  // Pattern: 360VIEWER_BATH-B_BMAT-B1_0005 -> extract 0005
  match = nameWithoutExt.match(/360VIEWER_.*_(\d+)$/);
  if (match) {
    return String(parseInt(match[1], 10)).padStart(4, "0");
  }

  // Pattern: filename_001 or similar
  match = nameWithoutExt.match(/_(\d+)$/);
  if (match) {
    return String(parseInt(match[1], 10)).padStart(4, "0");
  }

  // Pattern: 001_something or similar
  match = nameWithoutExt.match(/^(\d+)_/);
  if (match) {
    return String(parseInt(match[1], 10)).padStart(4, "0");
  }

  // Pattern: just numbers at the end
  match = nameWithoutExt.match(/(\d+)$/);
  if (match) {
    return String(parseInt(match[1], 10)).padStart(4, "0");
  }

  console.warn(`Could not extract number from: ${filename}`);
  return null;
}

// Function to check if a file is an image
function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|webp)$/i.test(filename);
}

// Function to rename files in a directory
function renameFilesInDirectory(dirPath: string): RenameResult {
  const result: RenameResult = { success: 0, failed: 0, skipped: 0 };

  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}`);
    return result;
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(isImageFile);

  console.log(`\nProcessing directory: ${dirPath}`);
  console.log(`Found ${imageFiles.length} image files`);

  if (imageFiles.length === 0) {
    return result;
  }

  // Sort files to process them in order
  imageFiles.sort();

  imageFiles.forEach((filename) => {
    const oldPath = path.join(dirPath, filename);
    const paddedNumber = extractAndPadNumber(filename);

    if (paddedNumber) {
      const newFilename = `${paddedNumber}.jpg`;
      const newPath = path.join(dirPath, newFilename);

      // Check if target file already exists and is different
      if (fs.existsSync(newPath) && newPath !== oldPath) {
        console.warn(`Target file already exists: ${newFilename}`);
        result.skipped++;
        return;
      }

      // Skip if the filename is already in the correct format
      if (filename === newFilename) {
        console.log(`Already correct format: ${filename}`);
        result.skipped++;
        return;
      }

      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${filename} -> ${newFilename}`);
        result.success++;
      } catch (error) {
        console.error(
          `❌ Error renaming ${filename}:`,
          (error as Error).message
        );
        result.failed++;
      }
    } else {
      console.warn(`⚠️  Skipping file (no number found): ${filename}`);
      result.skipped++;
    }
  });

  return result;
}

// Function to recursively find and process all directories
function processAllDirectories(currentDir: string): RenameResult {
  const totalResult: RenameResult = { success: 0, failed: 0, skipped: 0 };

  try {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    // Check if current directory has image files
    const hasImages = items.some(
      (item) => item.isFile() && isImageFile(item.name)
    );

    if (hasImages) {
      const result = renameFilesInDirectory(currentDir);
      totalResult.success += result.success;
      totalResult.failed += result.failed;
      totalResult.skipped += result.skipped;
    }

    // Process subdirectories
    items.forEach((item) => {
      if (item.isDirectory()) {
        const subDirPath = path.join(currentDir, item.name);
        const result = processAllDirectories(subDirPath);
        totalResult.success += result.success;
        totalResult.failed += result.failed;
        totalResult.skipped += result.skipped;
      }
    });
  } catch (error) {
    console.error(
      `Error processing directory ${currentDir}:`,
      (error as Error).message
    );
  }

  return totalResult;
}

// Function to create backup of directory structure (optional)
function createBackup(sourceDir: string): void {
  const backupDir = `${sourceDir}_backup_${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/:/g, "-")}`;

  try {
    fs.cpSync(sourceDir, backupDir, { recursive: true });
    console.log(`📦 Backup created: ${backupDir}`);
  } catch (error) {
    console.error(`❌ Failed to create backup:`, (error as Error).message);
  }
}

// Main execution function
function main(): void {
  console.log("🚀 Starting 360° image renaming process...");
  console.log(`📁 Base directory: ${path.resolve(baseDir)}`);

  if (!fs.existsSync(baseDir)) {
    console.error(`❌ Base directory does not exist: ${baseDir}`);
    process.exit(1);
  }

  // Ask user if they want to create a backup
  const createBackupChoice = process.argv.includes("--backup");
  if (createBackupChoice) {
    console.log("📦 Creating backup...");
    createBackup(baseDir);
  }

  // Process all directories recursively
  const startTime = Date.now();
  const result = processAllDirectories(baseDir);
  const endTime = Date.now();

  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Successfully renamed: ${result.success} files`);
  console.log(`❌ Failed to rename: ${result.failed} files`);
  console.log(`⚠️  Skipped: ${result.skipped} files`);
  console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
  console.log("=".repeat(50));

  if (result.failed > 0) {
    console.log(
      "⚠️  Some files failed to rename. Please check the errors above."
    );
    process.exit(1);
  } else {
    console.log("🎉 Renaming process completed successfully!");
  }
}

// Handle command line arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Usage: npx ts-node rename-360-images.ts [options]

Options:
  --backup    Create a backup of the directory before renaming
  --help, -h  Show this help message

Supported filename patterns:
  - 01_BATH-A_BMAT-A1 (6).jpg -> 0006.jpg
  - 360VIEWER_BATH-B_BMAT-B1_0005.jpg -> 0005.jpg
  - filename_001.jpg -> 0001.jpg
  - 001_filename.jpg -> 0001.jpg
  - Any filename ending with numbers

Examples:
  npx ts-node rename-360-images.ts
  npx ts-node rename-360-images.ts --backup
  `);
  process.exit(0);
}

// Run the script
main();
