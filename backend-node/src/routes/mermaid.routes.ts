import express from 'express';
import { MermaidService } from '../services/mermaid.service';
import { config } from '../config/config';
import logger from '../utils/logger';
import path from 'path';

type OutputFormat = typeof config.outputFormats[number];
type Theme = typeof config.themes[number];
type Background = typeof config.backgrounds[number];

interface ConvertRequestBody {
  code: string;
  format: OutputFormat;
  dpi: number;
  theme: Theme;
  background: Background;
  filename?: string;
}

const router = express.Router();

// 获取支持的格式
router.get('/formats', (req, res) => {
  res.json({
    formats: config.outputFormats,
    themes: config.themes,
    backgrounds: config.backgrounds,
    dpiRange: config.dpiRange
  });
});

// 转换 Mermaid 代码为图片
router.post('/convert', async (req, res, next) => {
  try {
    const { code, format, dpi, theme, background } = req.body as ConvertRequestBody;
    const filename = req.body.filename || 'mermaid-diagram';

    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    if (!config.outputFormats.includes(format)) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    const dpiValue = Number(dpi);
    if (isNaN(dpiValue) || dpiValue < config.dpiRange.min || dpiValue > config.dpiRange.max) {
      return res.status(400).json({ error: 'Invalid DPI value' });
    }

    const imagePath = await MermaidService.generateDiagram(code, format, dpiValue, theme, background);
    const fullPath = path.join(process.cwd(), imagePath.slice(1));

    // 设置下载响应头
    res.setHeader('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format}"`);
    res.sendFile(fullPath);

  } catch (error) {
    logger.error('Error converting Mermaid code:', error);
    next(error);
  }
});

export default router; 