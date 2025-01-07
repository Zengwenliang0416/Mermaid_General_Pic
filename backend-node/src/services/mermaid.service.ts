import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export class MermaidService {
  static async generateDiagram(
    code: string,
    outputFormat: typeof config.outputFormats[number],
    dpi: number,
    theme: typeof config.themes[number] = 'default',
    background: typeof config.backgrounds[number] = 'transparent'
  ): Promise<string> {
    let tempFile: string | null = null;
    let finalOutputFile: string | null = null;

    try {
      const fileId = uuidv4();
      const outputFile = path.join(config.imagesDir, `${fileId}.${outputFormat}`);
      tempFile = path.join(config.imagesDir, `${fileId}.mmd`);

      // 确保目录存在
      logger.debug(`Creating directory: ${config.imagesDir}`);
      await fs.mkdir(config.imagesDir, { recursive: true });

      // 写入临时文件
      logger.debug(`Writing temp file: ${tempFile}`);
      await fs.writeFile(tempFile, code);

      // 只支持 png 和 svg 格式
      const finalFormat = outputFormat === 'jpg' ? 'png' : outputFormat;
      finalOutputFile = path.join(config.imagesDir, `${fileId}.${finalFormat}`);

      // 构建命令
      const scale = Math.max(1, Math.floor(dpi / 100)); // 将 DPI 转换为比例因子
      const cmd = `npx @mermaid-js/mermaid-cli -i "${tempFile}" -o "${finalOutputFile}" -t ${theme} -b ${background} -s ${scale}`;
      logger.debug(`Executing command: ${cmd}`);
      
      try {
        const { stdout, stderr } = await execAsync(cmd);
        if (stderr && !stderr.includes('Store is a function')) {
          logger.warn(`Command stderr: ${stderr}`);
        }
        if (stdout) {
          logger.debug(`Command stdout: ${stdout}`);
        }
      } catch (error) {
        logger.error('Error executing mermaid-cli:', error);
        throw error;
      }

      // 检查文件是否生成
      try {
        await fs.access(finalOutputFile);
        logger.debug(`File generated successfully: ${finalOutputFile}`);
      } catch (error) {
        logger.error(`File not generated: ${finalOutputFile}`);
        throw new Error('Failed to generate diagram');
      }

      // 如果需要 jpg 格式，则使用 ImageMagick 转换
      if (outputFormat === 'jpg' && finalFormat === 'png') {
        try {
          // 检测系统类型
          const platform = process.platform;
          let convertCmd = '';
          
          if (platform === 'darwin') {
            // macOS 使用 sips 命令
            convertCmd = `sips -s format jpeg "${finalOutputFile}" --out "${outputFile}"`;
          } else {
            // Linux/Windows 使用 ImageMagick
            convertCmd = `convert "${finalOutputFile}" "${outputFile}"`;
          }

          logger.debug(`Converting to JPG: ${convertCmd}`);
          await execAsync(convertCmd);
          await fs.unlink(finalOutputFile);
          finalOutputFile = outputFile;
        } catch (error) {
          logger.error('Error converting to JPG:', error);
          // 如果转换失败，返回 PNG 文件
          return `/static/images/${fileId}.${finalFormat}`;
        }
      }

      // 清理临时文件
      if (tempFile) {
        try {
          await fs.unlink(tempFile);
          logger.debug(`Cleaned up temp file: ${tempFile}`);
        } catch (error) {
          logger.warn(`Failed to clean up temp file: ${tempFile}`, error);
        }
      }

      const relativePath = `/static/images/${fileId}.${outputFormat}`;
      logger.debug(`Returning relative path: ${relativePath}`);
      return relativePath;
    } catch (error) {
      // 清理临时文件
      if (tempFile) {
        try {
          await fs.unlink(tempFile);
          logger.debug(`Cleaned up temp file: ${tempFile}`);
        } catch (cleanupError) {
          logger.warn(`Failed to clean up temp file: ${tempFile}`, cleanupError);
        }
      }

      // 清理输出文件
      if (finalOutputFile) {
        try {
          await fs.unlink(finalOutputFile);
          logger.debug(`Cleaned up output file: ${finalOutputFile}`);
        } catch (cleanupError) {
          logger.warn(`Failed to clean up output file: ${finalOutputFile}`, cleanupError);
        }
      }

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