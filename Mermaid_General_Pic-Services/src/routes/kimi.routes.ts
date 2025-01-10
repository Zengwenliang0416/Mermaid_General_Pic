import express from 'express';
import { KimiService } from '../services/kimi.service';
import { logWithContext } from '../utils/logger';

const router = express.Router();

// 生成 Mermaid 代码
router.post('/generate', async (req, res) => {
  try {
    logWithContext('debug', 'Received AI generation request', {
      body: req.body,
      headers: req.headers
    });

    const { prompt } = req.body;

    if (!prompt) {
      logWithContext('warn', 'Missing prompt parameter', {
        body: req.body
      });
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    // 生成 Mermaid 代码
    const mermaidCode = await KimiService.generateMermaidCode(prompt);

    logWithContext('info', 'Successfully generated Mermaid code', {
      prompt: prompt.substring(0, 100),
      codeLength: mermaidCode.length
    });

    res.json({
      code: mermaidCode
    });
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logWithContext('error', 'Failed to generate Mermaid code', {
      error: errorMessage,
      details: error?.response?.data,
      stack: error?.stack
    });
    res.status(500).json({ 
      error: {
        message: errorMessage,
        details: error?.response?.data
      }
    });
  }
});

export default router; 