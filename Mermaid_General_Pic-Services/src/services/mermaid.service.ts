import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';
import logger, { logWithContext } from '../utils/logger';
import { WorkerPool } from '../workers/worker-pool';
import { DiagramCache } from '../utils/cache';
import { RequestQueue } from '../utils/request-queue';

export class MermaidService {
  private static workerPool = new WorkerPool('mermaid.worker.ts');
  private static requestQueue = new RequestQueue(3); // 最多同时处理3个请求

  static async generateDiagram(
    code: string,
    outputFormat: typeof config.outputFormats[number],
    dpi: number,
    theme: typeof config.themes[number] = 'default',
    background: typeof config.backgrounds[number] = 'transparent'
  ): Promise<{ path: string; data?: Buffer }> {
    const startTime = Date.now();
    const requestId = uuidv4();

    logWithContext('info', 'Starting diagram generation', {
      requestId,
      outputFormat,
      dpi,
      theme,
      background,
      codeLength: code.length
    });

    // 检查缓存
    const cacheKey = DiagramCache.generateKey(code, outputFormat, dpi, theme, background);
    const cachedResult = await DiagramCache.get(cacheKey);
    if (cachedResult) {
      logWithContext('info', 'Cache hit for diagram generation', {
        requestId,
        cacheKey,
        timeMs: Date.now() - startTime
      });
      return cachedResult;
    }

    logWithContext('debug', 'Cache miss, adding to processing queue', {
      requestId,
      queueSize: this.requestQueue.size,
      activeCount: this.requestQueue.activeCount
    });

    // 将转换任务加入队列
    return this.requestQueue.enqueue(async () => {
      const processStartTime = Date.now();
      try {
        const fileId = uuidv4();
        const tempFile = path.join(config.imagesDir, `${fileId}.mmd`);
        const finalFormat = outputFormat === 'jpg' ? 'png' : outputFormat;
        const outputFile = path.join(config.imagesDir, `${fileId}.${finalFormat}`);

        // 确保目录存在
        await fs.mkdir(config.imagesDir, { recursive: true });

        logWithContext('debug', 'Starting worker processing', {
          requestId,
          fileId,
          tempFile,
          outputFile,
          queueWaitTime: processStartTime - startTime
        });

        // 使用 Worker 池处理转换
        const result = await this.workerPool.execute({
          code,
          outputFormat,
          dpi,
          theme,
          background,
          tempFile,
          outputFile
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        const relativePath = `/static/images/${fileId}.${outputFormat}`;
        const absolutePath = path.join(process.cwd(), relativePath);
        
        // 读取文件数据并存入缓存
        const fileData = await fs.readFile(absolutePath);
        await DiagramCache.set(cacheKey, relativePath, fileData);
        
        const totalTime = Date.now() - startTime;
        const processingTime = Date.now() - processStartTime;
        
        logWithContext('info', 'Diagram generation completed', {
          requestId,
          fileId,
          totalTimeMs: totalTime,
          processingTimeMs: processingTime,
          queueWaitTimeMs: processStartTime - startTime,
          outputFormat,
          fileSize: fileData.length
        });

        return { path: relativePath, data: fileData };
      } catch (error: any) {
        logWithContext('error', 'Error generating diagram', {
          requestId,
          error: error.message,
          stack: error.stack,
          timeMs: Date.now() - startTime,
          code: code.substring(0, 30) // 只记录前200个字符
        });
        throw error;
      }
    });
  }

  static async cleanupOldFiles(): Promise<void> {
    const startTime = Date.now();
    let cleanedCount = 0;
    let errorCount = 0;

    try {
      const files = await fs.readdir(config.imagesDir);
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      for (const file of files) {
        try {
          const filePath = path.join(config.imagesDir, file);
          const stats = await fs.stat(filePath);
          const age = now - stats.mtimeMs;

          if (age > ONE_DAY) {
            await fs.unlink(filePath);
            cleanedCount++;
            logWithContext('debug', 'Cleaned up old file', {
              filePath,
              ageHours: Math.round(age / (60 * 60 * 1000))
            });
          }
        } catch (error: any) {
          errorCount++;
          logWithContext('error', 'Error cleaning up file', {
            file,
            error: error.message
          });
        }
      }

      logWithContext('info', 'File cleanup completed', {
        totalFiles: files.length,
        cleanedFiles: cleanedCount,
        errorCount,
        timeMs: Date.now() - startTime
      });
    } catch (error: any) {
      logWithContext('error', 'Error during file cleanup', {
        error: error.message,
        cleanedFiles: cleanedCount,
        errorCount,
        timeMs: Date.now() - startTime
      });
      throw error;
    }
  }

  static getQueueStatus(): { size: number; activeCount: number } {
    const status = {
      size: this.requestQueue.size,
      activeCount: this.requestQueue.activeCount
    };
    
    logWithContext('debug', 'Queue status checked', status);
    return status;
  }
} 