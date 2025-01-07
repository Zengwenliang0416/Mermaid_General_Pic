import crypto from 'crypto';
import fs from 'fs/promises';
import { logWithContext, logPerformance } from './logger';

interface CacheItem {
  path: string;
  data?: Buffer;  // 添加内存缓存
  timestamp: number;
  size?: number;  // 文件大小
}

export class DiagramCache {
  private static cache = new Map<string, CacheItem>();
  private static MAX_CACHE_SIZE = 1000; // 最大缓存数量
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 缓存有效期（24小时）
  private static MAX_MEMORY_CACHE_SIZE = 100; // 最大内存缓存数量
  private static totalMemoryUsage = 0; // 总内存使用量（字节）
  private static MAX_MEMORY_USAGE = 500 * 1024 * 1024; // 最大内存使用量（500MB）

  static generateKey(code: string, format: string, dpi: number, theme: string, background: string): string {
    const data = `${code}-${format}-${dpi}-${theme}-${background}`;
    const key = crypto.createHash('md5').update(data).digest('hex');
    
    logWithContext('debug', 'Cache key generated', {
      key,
      format,
      dpi,
      theme,
      background,
      codeLength: code.length
    });
    
    return key;
  }

  static async get(key: string): Promise<{ path: string; data?: Buffer } | null> {
    const startTime = Date.now();
    const item = this.cache.get(key);
    
    if (!item) {
      logWithContext('debug', 'Cache miss', { key });
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      if (item.data) {
        this.totalMemoryUsage -= item.data.length;
      }
      
      logWithContext('debug', 'Cache item expired', {
        key,
        age: Math.round((Date.now() - item.timestamp) / 1000),
        size: item.size
      });
      
      return null;
    }

    // 如果没有内存缓存，尝试从文件系统读取
    if (!item.data) {
      try {
        const readStartTime = Date.now();
        const data = await fs.readFile(item.path);
        const readDuration = Date.now() - readStartTime;
        
        // 记录文件读取性能
        if (readDuration > 100) { // 如果读取时间超过100ms
          logPerformance('cache-file-read', readDuration, {
            key,
            size: data.length
          });
        }

        // 只有在缓存数量和内存使用量未超过限制时才存储到内存
        const canCacheInMemory = 
          this.getMemoryCacheCount() < this.MAX_MEMORY_CACHE_SIZE &&
          this.totalMemoryUsage + data.length <= this.MAX_MEMORY_USAGE;

        if (canCacheInMemory) {
          item.data = data;
          item.size = data.length;
          this.totalMemoryUsage += data.length;
          
          logWithContext('debug', 'Added to memory cache', {
            key,
            size: data.length,
            totalMemoryUsage: this.totalMemoryUsage,
            memoryItems: this.getMemoryCacheCount()
          });
        }

        const duration = Date.now() - startTime;
        logWithContext('debug', 'Cache hit from disk', {
          key,
          size: data.length,
          duration,
          addedToMemory: canCacheInMemory
        });

        return { path: item.path, data };
      } catch (error: any) {
        logWithContext('error', 'Cache file read error', {
          key,
          path: item.path,
          error: error.message
        });
        
        this.cache.delete(key);
        return null;
      }
    }

    const duration = Date.now() - startTime;
    logWithContext('debug', 'Cache hit from memory', {
      key,
      size: item.size,
      duration
    });

    return item;
  }

  static async set(key: string, path: string, data?: Buffer): Promise<void> {
    const startTime = Date.now();
    
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        const oldestItem = this.cache.get(oldestKey);
        if (oldestItem?.data) {
          this.totalMemoryUsage -= oldestItem.data.length;
        }
        this.cache.delete(oldestKey);
        
        logWithContext('debug', 'Removed oldest cache item', {
          key: oldestKey,
          size: oldestItem?.size,
          totalItems: this.cache.size
        });
      }
    }

    // 如果内存缓存已满或超过最大内存限制，清除最旧的内存缓存
    if (data) {
      while (
        this.getMemoryCacheCount() >= this.MAX_MEMORY_CACHE_SIZE ||
        this.totalMemoryUsage + data.length > this.MAX_MEMORY_USAGE
      ) {
        const oldestMemoryCache = Array.from(this.cache.values())
          .find(item => item.data);
          
        if (oldestMemoryCache) {
          this.totalMemoryUsage -= oldestMemoryCache.data!.length;
          delete oldestMemoryCache.data;
          
          logWithContext('debug', 'Cleared memory cache item', {
            totalMemoryUsage: this.totalMemoryUsage,
            memoryItems: this.getMemoryCacheCount()
          });
        } else {
          break;
        }
      }
    }

    const size = data?.length;
    this.cache.set(key, {
      path,
      data,
      timestamp: Date.now(),
      size
    });

    if (data) {
      this.totalMemoryUsage += data.length;
    }

    const duration = Date.now() - startTime;
    logWithContext('debug', 'Cache item set', {
      key,
      size,
      duration,
      totalItems: this.cache.size,
      memoryItems: this.getMemoryCacheCount(),
      totalMemoryUsage: this.totalMemoryUsage
    });
  }

  private static getMemoryCacheCount(): number {
    return Array.from(this.cache.values())
      .filter(item => item.data)
      .length;
  }

  static clear(): void {
    const memoryUsage = this.totalMemoryUsage;
    const itemCount = this.cache.size;
    const memoryItemCount = this.getMemoryCacheCount();
    
    this.cache.clear();
    this.totalMemoryUsage = 0;
    
    logWithContext('info', 'Cache cleared', {
      itemCount,
      memoryItemCount,
      memoryUsage
    });
  }

  static getStats(): {
    totalItems: number;
    memoryItems: number;
    totalMemoryUsage: number;
    maxMemoryUsage: number;
  } {
    return {
      totalItems: this.cache.size,
      memoryItems: this.getMemoryCacheCount(),
      totalMemoryUsage: this.totalMemoryUsage,
      maxMemoryUsage: this.MAX_MEMORY_USAGE
    };
  }
} 