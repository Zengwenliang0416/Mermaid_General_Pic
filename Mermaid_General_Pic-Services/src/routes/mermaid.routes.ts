import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import { MermaidService } from '../services/mermaid.service';
import { logWithContext } from '../utils/logger';
import { config } from '../config/config';
import fs from 'fs';

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.staticDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const router: Router = express.Router();

// 获取支持的格式
router.get('/formats', (req: Request, res: Response) => {
  res.json({
    formats: config.outputFormats,
    themes: config.themes,
    backgrounds: config.backgrounds,
    dpiRange: config.dpiRange
  });
});

// 转换 Mermaid 代码为图片
router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { code, format = 'png', dpi = config.dpiRange.default, theme = 'default', background = 'white' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    const result = await MermaidService.generateDiagram(code, format, dpi, theme, background);

    // 设置响应头
    res.setHeader('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
    
    // 如果有缓存的数据，直接发送
    if (result.data) {
      return res.end(result.data);
    }

    // 否则从文件系统读取
    const fullPath = path.join(process.cwd(), result.path);
    return res.sendFile(fullPath);
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logWithContext('error', 'Failed to convert Mermaid code', {
      error: errorMessage,
      stack: error?.stack
    });
    res.status(500).json({ error: errorMessage });
  }
});

// 上传文件并转换
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await MermaidService.generateDiagram(
      await fs.promises.readFile(req.file.path, 'utf8'),
      'png',
      config.dpiRange.default,
      'default',
      'white'
    );

    // 删除临时文件
    await fs.promises.unlink(req.file.path);

    res.json({ url: `/static/${path.basename(result.path)}` });
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logWithContext('error', 'Failed to convert uploaded file', {
      error: errorMessage,
      stack: error?.stack
    });
    res.status(500).json({ error: errorMessage });
  }
});

export default router; 