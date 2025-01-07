import { parentPort } from 'worker_threads';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/config';
import logger, { logWithContext } from '../utils/logger';

const execAsync = promisify(exec);

// 简单的内存缓存
const cache = new Map<string, { timestamp: number, path: string }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
const MAX_CACHE_SIZE = 100;

interface WorkerMessage {
  code: string;
  outputFormat: string;
  dpi: number;
  theme: string;
  background: string;
  tempFile: string;
  outputFile: string;
}

function generateCacheKey(message: WorkerMessage): string {
  const { code, outputFormat, dpi, theme, background } = message;
  return crypto
    .createHash('md5')
    .update(`${code}${outputFormat}${dpi}${theme}${background}`)
    .digest('hex');
}

async function cleanOldCache() {
  const startTime = Date.now();
  let removedCount = 0;
  let errorCount = 0;

  try {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        try {
          await fs.unlink(value.path);
          cache.delete(key);
          removedCount++;
        } catch (error: any) {
          errorCount++;
          logWithContext('error', 'Error removing cached file', {
            path: value.path,
            error: error.message
          });
        }
      }
    }

    logWithContext('debug', 'Cache cleanup completed', {
      totalEntries: cache.size,
      removedEntries: removedCount,
      errorCount,
      timeMs: Date.now() - startTime
    });
  } catch (error: any) {
    logWithContext('error', 'Error during cache cleanup', {
      error: error.message,
      timeMs: Date.now() - startTime
    });
  }
}

if (parentPort) {
  parentPort.on('message', async (message: WorkerMessage) => {
    const startTime = Date.now();
    const workerId = crypto.randomBytes(4).toString('hex');

    logWithContext('debug', 'Worker received message', {
      workerId,
      outputFormat: message.outputFormat,
      dpi: message.dpi,
      theme: message.theme,
      background: message.background,
      codeLength: message.code.length
    });

    try {
      const {
        code,
        outputFormat,
        dpi,
        theme,
        background,
        tempFile,
        outputFile
      } = message;

      // 检查缓存
      const cacheKey = generateCacheKey(message);
      const cachedResult = cache.get(cacheKey);
      
      if (cachedResult && (Date.now() - cachedResult.timestamp) <= CACHE_TTL) {
        try {
          await fs.copyFile(cachedResult.path, outputFile);
          logWithContext('info', 'Worker cache hit, file copied', {
            workerId,
            cacheKey,
            timeMs: Date.now() - startTime
          });
          parentPort?.postMessage({ success: true });
          return;
        } catch (error: any) {
          logWithContext('warn', 'Worker cache copy failed', {
            workerId,
            cacheKey,
            error: error.message
          });
          cache.delete(cacheKey);
        }
      }

      // 写入临时文件
      await fs.writeFile(tempFile, code);
      logWithContext('debug', 'Temporary file written', {
        workerId,
        tempFile
      });

      // 构建命令，使用优化的参数
      const scale = Math.max(1, Math.floor(dpi / 100));
      const cmd = `npx @mermaid-js/mermaid-cli -i "${tempFile}" -o "${outputFile}" -t ${theme} -b ${background} -s ${scale} --quiet`;

      logWithContext('debug', 'Starting mermaid-cli execution', {
        workerId,
        command: cmd
      });

      // 执行命令
      const execStartTime = Date.now();
      const { stdout, stderr } = await execAsync(cmd);
      
      if (stderr) {
        logWithContext('warn', 'mermaid-cli produced warnings', {
          workerId,
          stderr,
          execTimeMs: Date.now() - execStartTime
        });
      }

      // 如果需要 jpg 格式，则转换
      if (outputFormat === 'jpg') {
        const platform = process.platform;
        const jpgOutputFile = outputFile.replace('.png', '.jpg');
        
        const convertCmd = platform === 'darwin'
          ? `sips -s format jpeg "${outputFile}" --out "${jpgOutputFile}" -s formatOptions best`
          : `convert "${outputFile}" -quality 90 "${jpgOutputFile}"`;

        logWithContext('debug', 'Starting image conversion', {
          workerId,
          platform,
          command: convertCmd
        });

        const convStartTime = Date.now();
        await execAsync(convertCmd);
        await fs.unlink(outputFile);

        logWithContext('debug', 'Image conversion completed', {
          workerId,
          conversionTimeMs: Date.now() - convStartTime
        });
      }

      // 更新缓存
      if (cache.size >= MAX_CACHE_SIZE) {
        logWithContext('debug', 'Cache size limit reached, cleaning up', {
          workerId,
          currentSize: cache.size
        });
        
        await cleanOldCache();
        
        if (cache.size >= MAX_CACHE_SIZE) {
          const oldestKey = Array.from(cache.keys())[0];
          const oldestValue = cache.get(oldestKey);
          if (oldestValue) {
            try {
              await fs.unlink(oldestValue.path);
              logWithContext('debug', 'Removed oldest cache entry', {
                workerId,
                path: oldestValue.path
              });
            } catch (error: any) {
              logWithContext('error', 'Error removing oldest cache entry', {
                workerId,
                error: error.message
              });
            }
            cache.delete(oldestKey);
          }
        }
      }
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        path: outputFile
      });

      // 清理临时文件
      await fs.unlink(tempFile);

      logWithContext('info', 'Worker processing completed', {
        workerId,
        totalTimeMs: Date.now() - startTime,
        outputFormat,
        cacheSize: cache.size
      });

      parentPort?.postMessage({ success: true });
    } catch (error: any) {
      // 清理临时文件
      try {
        if (message?.tempFile) {
          await fs.unlink(message.tempFile);
        }
      } catch (e: any) {
        logWithContext('error', 'Error cleaning up temp file', {
          workerId,
          error: e.message
        });
      }

      logWithContext('error', 'Worker processing failed', {
        workerId,
        error: error.message,
        stack: error.stack,
        timeMs: Date.now() - startTime,
        code: message.code.substring(0, 200) // 只记录前200个字符
      });

      parentPort?.postMessage({ 
        success: false, 
        error: error?.message || 'Unknown error' 
      });
    }
  });

  // 定期清理过期缓存
  setInterval(cleanOldCache, CACHE_TTL);
} 