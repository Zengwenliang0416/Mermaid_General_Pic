import crypto from 'crypto';
import fs from 'fs/promises';

interface CacheItem {
  path: string;
  data?: Buffer;  // 添加内存缓存
  timestamp: number;
}

export class DiagramCache {
  private static cache = new Map<string, CacheItem>();
  private static MAX_CACHE_SIZE = 1000; // 最大缓存数量
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 缓存有效期（24小时）
  private static MAX_MEMORY_CACHE_SIZE = 100; // 最大内存缓存数量

  static generateKey(code: string, format: string, dpi: number, theme: string, background: string): string {
    const data = `${code}-${format}-${dpi}-${theme}-${background}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  static async get(key: string): Promise<{ path: string; data?: Buffer } | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查缓存是否过期
    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    // 如果没有内存缓存，尝试从文件系统读取
    if (!item.data) {
      try {
        const data = await fs.readFile(item.path);
        // 只有在缓存数量未超过限制时才存储到内存
        if (this.getMemoryCacheCount() < this.MAX_MEMORY_CACHE_SIZE) {
          item.data = data;
        }
        return { path: item.path, data };
      } catch {
        this.cache.delete(key);
        return null;
      }
    }

    return item;
  }

  static async set(key: string, path: string, data?: Buffer): Promise<void> {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    // 如果内存缓存已满，清除最旧的内存缓存
    if (data && this.getMemoryCacheCount() >= this.MAX_MEMORY_CACHE_SIZE) {
      const oldestMemoryCache = Array.from(this.cache.values())
        .find(item => item.data);
      if (oldestMemoryCache) {
        delete oldestMemoryCache.data;
      }
    }

    this.cache.set(key, {
      path,
      data,
      timestamp: Date.now()
    });
  }

  private static getMemoryCacheCount(): number {
    return Array.from(this.cache.values())
      .filter(item => item.data)
      .length;
  }

  static clear(): void {
    this.cache.clear();
  }
} 