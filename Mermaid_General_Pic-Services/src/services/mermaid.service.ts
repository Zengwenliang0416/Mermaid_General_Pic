/**
 * Mermaid 服务类
 * 负责处理 Mermaid 图表的生成、缓存和文件清理
 */
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';
import logger, { logWithContext } from '../utils/logger';
import { WorkerPool } from '../workers/worker-pool';
import { DiagramCache } from '../utils/cache';
import { RequestQueue } from '../utils/request-queue';

export class MermaidService {
  // 创建 Worker 池用于处理图表生成任务
  private static workerPool = new WorkerPool('mermaid.worker.ts');
  // 创建请求队列，限制最大并发处理数为 3
  private static requestQueue = new RequestQueue(3);

  /**
   * 生成 Mermaid 图表
   * @param code - Mermaid 图表代码
   * @param outputFormat - 输出格式（png/jpg/svg）
   * @param dpi - 图片DPI值
   * @param theme - 主题样式
   * @param background - 背景类型
   * @returns 包含生成图片路径和数据的对象
   */
  static async generateDiagram(
    code: string,
    outputFormat: typeof config.outputFormats[number],
    dpi: number,
    theme: typeof config.themes[number] = 'default',
    background: typeof config.backgrounds[number] = 'transparent'
  ): Promise<{ path: string; data?: Buffer }> {
    const startTime = Date.now();
    const requestId = uuidv4();

    // 记录开始生成的日志
    logWithContext('info', 'Starting diagram generation', {
      requestId,
      outputFormat,
      dpi,
      theme,
      background,
      codeLength: code.length
    });

    // 检查缓存中是否存在相同的图表
    const cacheKey = DiagramCache.generateKey(code, outputFormat, dpi, theme, background);
    const cachedResult = await DiagramCache.get(cacheKey);
    if (cachedResult) {
      // 如果找到缓存，直接返回缓存的结果
      logWithContext('info', 'Cache hit for diagram generation', {
        requestId,
        cacheKey,
        timeMs: Date.now() - startTime
      });
      return cachedResult;
    }

    // 记录缓存未命中的日志
    logWithContext('debug', 'Cache miss, adding to processing queue', {
      requestId,
      queueSize: this.requestQueue.size,
      activeCount: this.requestQueue.activeCount
    });

    // 将转换任务加入队列
    return this.requestQueue.enqueue(async () => {
      const processStartTime = Date.now();
      try {
        // 生成唯一的文件ID和相关路径
        const fileId = uuidv4();
        const tempFile = path.join(config.imagesDir, `${fileId}.mmd`);
        const finalFormat = outputFormat === 'jpg' ? 'png' : outputFormat;
        const outputFile = path.join(config.imagesDir, `${fileId}.${finalFormat}`);

        // 确保输出目录存在
        await fs.mkdir(config.imagesDir, { recursive: true });

        // 记录开始处理的日志
        logWithContext('debug', 'Starting worker processing', {
          requestId,
          fileId,
          tempFile,
          outputFile,
          queueWaitTime: processStartTime - startTime
        });

        // 使用 Worker 池处理图表生成
        const result = await this.workerPool.execute({
          code,
          outputFormat,
          dpi,
          theme,
          background,
          tempFile,
          outputFile
        });

        // 检查处理结果
        if (!result.success) {
          throw new Error(result.error);
        }

        // 构建文件路径
        const relativePath = `/static/images/${fileId}.${outputFormat}`;
        const absolutePath = path.join(process.cwd(), relativePath);
        
        // 读取生成的文件并存入缓存
        const fileData = await fs.readFile(absolutePath);
        await DiagramCache.set(cacheKey, relativePath, fileData);
        
        // 计算处理时间
        const totalTime = Date.now() - startTime;
        const processingTime = Date.now() - processStartTime;
        
        // 记录完成日志
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
        // 记录错误日志
        logWithContext('error', 'Error generating diagram', {
          requestId,
          error: error.message,
          stack: error.stack,
          timeMs: Date.now() - startTime,
          code: code.substring(0, 30) // 只记录前30个字符
        });
        throw error;
      }
    });
  }

  /**
   * 清理旧文件
   * 删除超过24小时的临时文件
   */
  static async cleanupOldFiles(): Promise<void> {
    const startTime = Date.now();
    let cleanedCount = 0;
    let errorCount = 0;

    try {
      // 读取目录中的所有文件
      const files = await fs.readdir(config.imagesDir);
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      // 遍历处理每个文件
      for (const file of files) {
        try {
          const filePath = path.join(config.imagesDir, file);
          const stats = await fs.stat(filePath);
          const age = now - stats.mtimeMs;

          // 删除超过24小时的文件
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

      // 记录清理完成的日志
      logWithContext('info', 'File cleanup completed', {
        totalFiles: files.length,
        cleanedFiles: cleanedCount,
        errorCount,
        timeMs: Date.now() - startTime
      });
    } catch (error: any) {
      // 记录清理过程中的错误
      logWithContext('error', 'Error during file cleanup', {
        error: error.message,
        cleanedFiles: cleanedCount,
        errorCount,
        timeMs: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 获取当前队列状态
   * @returns 包含队列大小和活动任务数的对象
   */
  static getQueueStatus(): { size: number; activeCount: number } {
    const status = {
      size: this.requestQueue.size,
      activeCount: this.requestQueue.activeCount
    };
    
    logWithContext('debug', 'Queue status checked', status);
    return status;
  }
} 