import crypto from 'crypto';

interface CacheItem {
  path: string;
  timestamp: number;
}

export class DiagramCache {
  private static cache = new Map<string, CacheItem>();
  private static MAX_CACHE_SIZE = 1000; // 最大缓存数量
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 缓存有效期（24小时）

  static generateKey(code: string, format: string, dpi: number, theme: string, background: string): string {
    const data = `${code}-${format}-${dpi}-${theme}-${background}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  static get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查缓存是否过期
    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.path;
  }

  static set(key: string, path: string): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      path,
      timestamp: Date.now()
    });
  }

  static clear(): void {
    this.cache.clear();
  }
} 