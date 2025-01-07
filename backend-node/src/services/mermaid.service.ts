import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';
import logger from '../utils/logger';
import { WorkerPool } from '../workers/worker-pool';
import { DiagramCache } from '../utils/cache';

export class MermaidService {
  private static workerPool = new WorkerPool('mermaid.worker.ts');

  static async generateDiagram(
    code: string,
    outputFormat: typeof config.outputFormats[number],
    dpi: number,
    theme: typeof config.themes[number] = 'default',
    background: typeof config.backgrounds[number] = 'transparent'
  ): Promise<string> {
    // 检查缓存
    const cacheKey = DiagramCache.generateKey(code, outputFormat, dpi, theme, background);
    const cachedPath = DiagramCache.get(cacheKey);
    if (cachedPath) {
      logger.debug(`Cache hit for key: ${cacheKey}`);
      return cachedPath;
    }

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
      
      // 存入缓存
      DiagramCache.set(cacheKey, relativePath);
      
      return relativePath;
    } catch (error) {
      logger.error('Error generating diagram:', error);
      throw error;
    }
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
} 