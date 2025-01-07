import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';
import logger from '../utils/logger';
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
    // 检查缓存
    const cacheKey = DiagramCache.generateKey(code, outputFormat, dpi, theme, background);
    const cachedResult = await DiagramCache.get(cacheKey);
    if (cachedResult) {
      logger.debug(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    // 将转换任务加入队列
    return this.requestQueue.enqueue(async () => {
      try {
        const fileId = uuidv4();
        const tempFile = path.join(config.imagesDir, `${fileId}.mmd`);
        const finalFormat = outputFormat === 'jpg' ? 'png' : outputFormat;
        const outputFile = path.join(config.imagesDir, `${fileId}.${finalFormat}`);

        // 确保目录存在
        await fs.mkdir(config.imagesDir, { recursive: true });

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
        
        return { path: relativePath, data: fileData };
      } catch (error) {
        logger.error('Error generating diagram:', error);
        throw error;
      }
    });
  }

  static async cleanupOldFiles(): Promise<void> {
    try {
      const files = await fs.readdir(config.imagesDir);
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(config.imagesDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > ONE_DAY) {
          await fs.unlink(filePath);
          logger.debug(`Cleaned up old file: ${filePath}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up files:', error);
    }
  }

  static getQueueStatus(): { size: number; activeCount: number } {
    return {
      size: this.requestQueue.size,
      activeCount: this.requestQueue.activeCount
    };
  }
} 