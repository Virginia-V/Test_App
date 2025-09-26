// src/lib/fileCache.ts

interface CachedFileMetadata {
  contentType: string;
  contentLength: number;
  lastModified: Date;
  etag: string;
  data?: Buffer; // Only cache small files (< 1MB) in memory
  cachedAt: number; // Timestamp when cached
}

interface CacheOptions {
  maxItems: number; // Maximum number of items to cache
  ttl: number; // Time to live in milliseconds
  maxFileSize: number; // Maximum individual file size to cache in bytes
}

class SimpleFileCache {
  private cache: Map<string, CachedFileMetadata> = new Map();
  private readonly maxItems: number;
  private readonly ttl: number;
  private readonly maxFileSize: number;

  constructor(
    options: CacheOptions = {
      maxItems: 1000,
      ttl: 1000 * 60 * 60 * 2, // 2 hours
      maxFileSize: 1024 * 1024 * 5 // 5MB
    }
  ) {
    this.maxItems = options.maxItems;
    this.ttl = options.ttl;
    this.maxFileSize = options.maxFileSize;
  }

  private isExpired(item: CachedFileMetadata): boolean {
    return Date.now() - item.cachedAt > this.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.cachedAt > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    if (this.cache.size >= this.maxItems) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [key, value] of this.cache.entries()) {
        if (value.cachedAt < oldestTime) {
          oldestTime = value.cachedAt;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  set(key: string, metadata: Omit<CachedFileMetadata, "cachedAt">): void {
    // Cleanup expired items periodically
    if (Math.random() < 0.01) {
      // 1% chance
      this.cleanup();
    }

    // Only cache files smaller than maxFileSize in full
    let cacheData = { ...metadata, cachedAt: Date.now() };
    if (metadata.data && metadata.data.length > this.maxFileSize) {
      // Store metadata only, without data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, ...metadataOnly } = cacheData;
      cacheData = metadataOnly;
    }

    this.evictOldest();
    this.cache.set(key, cacheData);
  }

  get(key: string): CachedFileMetadata | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return undefined;
    }

    return item;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxItems: this.maxItems
    };
  }

  // Check if file should be cached based on extension and size
  shouldCache(key: string): boolean {
    const cacheableExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".mp4",
      ".webm",
      ".pdf",
      ".svg"
    ];
    const ext = key.toLowerCase().substring(key.lastIndexOf("."));

    if (!cacheableExtensions.includes(ext)) {
      return false;
    }

    // Always cache metadata, even for large files
    return true;
  }
}

// Export singleton instance
export const fileCache = new SimpleFileCache({
  maxItems: 2000,
  ttl: 1000 * 60 * 60 * 4, // 4 hours
  maxFileSize: 1024 * 1024 * 2 // 2MB max file size for full caching
});

export type { CachedFileMetadata };
