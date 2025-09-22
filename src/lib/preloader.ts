// src/lib/preloader.ts
import { s3, HETZNER_BUCKET } from "./s3";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { fileCache } from "./fileCache";

interface PreloadOptions {
  keys: string[];
  priority?: 'high' | 'medium' | 'low';
}

class AssetPreloader {
  private preloadQueue: Set<string> = new Set();
  private isPreloading = false;
  private preloadStats = {
    attempted: 0,
    successful: 0,
    failed: 0,
    cached: 0
  };

  async preload(options: PreloadOptions): Promise<void> {
    const { keys, priority = 'medium' } = options;
    
    // Add keys to queue if not already preloading them
    for (const key of keys) {
      if (!fileCache.has(key) && !this.preloadQueue.has(key)) {
        this.preloadQueue.add(key);
      }
    }

    // Start preloading if not already running
    if (!this.isPreloading) {
      this.isPreloading = true;
      
      // Use different concurrency based on priority
      const concurrency = priority === 'high' ? 5 : priority === 'medium' ? 3 : 1;
      
      await this.processQueue(concurrency);
      
      this.isPreloading = false;
    }
  }

  private async processQueue(concurrency: number): Promise<void> {
    const workers: Promise<void>[] = [];
    
    for (let i = 0; i < concurrency; i++) {
      workers.push(this.worker());
    }
    
    await Promise.allSettled(workers);
  }

  private async worker(): Promise<void> {
    while (this.preloadQueue.size > 0) {
      const key = this.preloadQueue.values().next().value;
      if (!key) break;
      
      this.preloadQueue.delete(key);
      await this.preloadSingle(key);
    }
  }

  private async preloadSingle(key: string): Promise<void> {
    this.preloadStats.attempted++;
    
    try {
      // Check if already cached
      if (fileCache.has(key)) {
        this.preloadStats.cached++;
        return;
      }

      // Only preload if it should be cached
      if (!fileCache.shouldCache(key)) {
        return;
      }

      // Get metadata from S3
      const headObj = await s3.send(
        new HeadObjectCommand({
          Bucket: HETZNER_BUCKET,
          Key: key
        })
      );

      // Determine content type
      const contentType = headObj.ContentType || this.inferContentType(key);
      
      // Cache metadata
      fileCache.set(key, {
        contentType,
        contentLength: headObj.ContentLength || 0,
        lastModified: headObj.LastModified || new Date(),
        etag: headObj.ETag?.replace(/"/g, '') || this.generateETag(key)
      });

      this.preloadStats.successful++;
      
      console.log(`[Preloader] Successfully preloaded metadata for: ${key}`);
    } catch (error) {
      this.preloadStats.failed++;
      console.warn(`[Preloader] Failed to preload ${key}:`, error);
    }
  }

  private inferContentType(key: string): string {
    const ext = key.toLowerCase().substring(key.lastIndexOf('.'));
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private generateETag(key: string): string {
    return Buffer.from(key).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  getStats() {
    return { ...this.preloadStats };
  }

  clearStats() {
    this.preloadStats = {
      attempted: 0,
      successful: 0,
      failed: 0,
      cached: 0
    };
  }
}

// Export singleton instance
export const assetPreloader = new AssetPreloader();

// Convenience function for preloading critical assets
export async function preloadCriticalAssets(): Promise<void> {
  const criticalAssets = [
    'assets/video_website.mp4', // Background video
    // Add other critical assets here
  ];

  await assetPreloader.preload({
    keys: criticalAssets,
    priority: 'high'
  });
}

// Convenience function for preloading based on user behavior
export async function preloadUserAssets(keys: string[]): Promise<void> {
  await assetPreloader.preload({
    keys,
    priority: 'medium'
  });
}