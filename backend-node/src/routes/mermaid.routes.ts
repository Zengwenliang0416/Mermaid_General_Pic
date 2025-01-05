import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/config';
import { MermaidService } from '../services/mermaid.service';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: config.imagesDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
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

// 获取支持的格式
router.get('/formats', (req: Request, res: Response) => {
  res.json({
    formats: config.outputFormats,
    dpi: config.dpiRange,
    themes: config.themes,
    backgrounds: config.backgrounds
  });
});

// 转换Mermaid代码
router.post('/convert', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      code, 
      format = 'png', 
      dpi = config.dpiRange.default,
      theme = 'default',
      background = 'transparent'
    } = req.body;

    if (!code) {
      res.status(400).json({ error: 'No Mermaid code provided' });
      return;
    }

    if (!config.outputFormats.includes(format)) {
      res.status(400).json({ error: 'Invalid output format' });
      return;
    }

    if (dpi < config.dpiRange.min || dpi > config.dpiRange.max) {
      res.status(400).json({ error: 'Invalid DPI value' });
      return;
    }

    if (!config.themes.includes(theme)) {
      res.status(400).json({ error: 'Invalid theme' });
      return;
    }

    if (!config.backgrounds.includes(background)) {
      res.status(400).json({ error: 'Invalid background' });
      return;
    }

    const outputPath = await MermaidService.generateDiagram(code, format, dpi, theme, background);
    res.json({ url: outputPath });
  } catch (error) {
    console.error('Error converting Mermaid code:', error);
    res.status(500).json({ error: 'Failed to convert Mermaid code' });
  }
});

// 上传文件并转换
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { 
      format = 'png', 
      dpi = config.dpiRange.default,
      theme = 'default',
      background = 'transparent'
    } = req.body;

    if (!config.outputFormats.includes(format)) {
      res.status(400).json({ error: 'Invalid output format' });
      return;
    }

    if (dpi < config.dpiRange.min || dpi > config.dpiRange.max) {
      res.status(400).json({ error: 'Invalid DPI value' });
      return;
    }

    if (!config.themes.includes(theme)) {
      res.status(400).json({ error: 'Invalid theme' });
      return;
    }

    if (!config.backgrounds.includes(background)) {
      res.status(400).json({ error: 'Invalid background' });
      return;
    }

    const code = await fs.readFile(req.file.path, 'utf-8');
    await fs.unlink(req.file.path); // 删除上传的文件

    const outputPath = await MermaidService.generateDiagram(code, format, dpi, theme, background);
    res.json({ url: outputPath });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ error: 'Failed to process uploaded file' });
  }
});

export default router; 