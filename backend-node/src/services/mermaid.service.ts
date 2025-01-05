import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';

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
        'npx mmdc',
        `-i "${tempFile}"`,
        `-o "${outputFile}"`,
        `-b ${background}`,
        `-t ${theme}`,
        `-w 1000`,
        `-H 800`,
        `-s ${dpi/72}`,
      ];

      if (outputFormat !== 'svg') {
        cmd.push(`-f ${outputFormat}`);
      }

      // 执行命令
      await execAsync(cmd.join(' '));

      // 清理临时文件
      await fs.unlink(tempFile);

      return `/images/${fileId}.${outputFormat}`;
    } catch (error) {
      console.error('Error generating diagram:', error);
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
      console.error('Error cleaning up files:', error);
    }
  }
} 