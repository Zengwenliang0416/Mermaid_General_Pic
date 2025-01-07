import { parentPort } from 'worker_threads';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';

const execAsync = promisify(exec);

interface WorkerMessage {
  code: string;
  outputFormat: string;
  dpi: number;
  theme: string;
  background: string;
  tempFile: string;
  outputFile: string;
}

if (parentPort) {
  parentPort.on('message', async (message: WorkerMessage) => {
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

      // 写入临时文件
      await fs.writeFile(tempFile, code);

      // 构建命令
      const scale = Math.max(1, Math.floor(dpi / 100));
      const cmd = `npx @mermaid-js/mermaid-cli -i "${tempFile}" -o "${outputFile}" -t ${theme} -b ${background} -s ${scale}`;

      // 执行命令
      await execAsync(cmd);

      // 如果需要 jpg 格式，则转换
      if (outputFormat === 'jpg') {
        const platform = process.platform;
        const jpgOutputFile = outputFile.replace('.png', '.jpg');
        
        const convertCmd = platform === 'darwin'
          ? `sips -s format jpeg "${outputFile}" --out "${jpgOutputFile}"`
          : `convert "${outputFile}" "${jpgOutputFile}"`;

        await execAsync(convertCmd);
        await fs.unlink(outputFile);
      }

      // 清理临时文件
      await fs.unlink(tempFile);

      parentPort?.postMessage({ success: true });
    } catch (error: any) {
      parentPort?.postMessage({ 
        success: false, 
        error: error?.message || 'Unknown error' 
      });
    }
  });
} 