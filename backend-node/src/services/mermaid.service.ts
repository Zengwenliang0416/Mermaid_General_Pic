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
    try {
      const fileId = uuidv4();
      const outputFile = path.join(config.imagesDir, `${fileId}.${outputFormat}`);
      const tempFile = path.join(config.imagesDir, `${fileId}.mmd`);

      // 确保目录存在
      await fs.mkdir(config.imagesDir, { recursive: true });

      // 写入临时文件
      await fs.writeFile(tempFile, code);

      // 构建命令
      const cmd = [
        'npx',
        '@mermaid-js/mermaid-cli',
        `-i "${tempFile}"`,
        `-o "${outputFile}"`,
        `-b ${background}`,
        `-t ${theme}`,
        `-w 1000`,
        `-H 800`,
        `-s ${dpi/72}`,
      ];

      // 只支持 png 和 svg 格式
      const finalFormat = outputFormat === 'jpg' ? 'png' : outputFormat;
      const finalOutputFile = path.join(config.imagesDir, `${fileId}.${finalFormat}`);
      cmd[3] = `-o "${finalOutputFile}"`;
      cmd.push(`-f ${finalFormat}`);

      // 执行命令
      logger.debug(`Executing command: ${cmd.join(' ')}`);
      const { stdout, stderr } = await execAsync(cmd.join(' '));
      if (stderr && !stderr.includes('Store is a function')) {
        logger.warn(`Command stderr: ${stderr}`);
      }
      if (stdout) {
        logger.debug(`Command stdout: ${stdout}`);
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

          await execAsync(convertCmd);
          await fs.unlink(finalOutputFile);
        } catch (error) {
          logger.error('Error converting to JPG:', error);
          // 如果转换失败，返回 PNG 文件
          return `/images/${fileId}.${finalFormat}`;
        }
      }

      // 清理临时文件
      await fs.unlink(tempFile);

      return `/images/${fileId}.${outputFormat}`;
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
        }
      }
    } catch (error) {
      logger.error('Error cleaning up files:', error);
    }
  }
} 