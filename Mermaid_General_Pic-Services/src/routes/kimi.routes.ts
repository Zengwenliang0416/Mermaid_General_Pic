import express, { Request, Response, Router } from 'express';
import { KimiService } from '../services/kimi.service';
import { logWithContext } from '../utils/logger';

const router: Router = express.Router();

interface GenerateRequest {
  prompt: string;
  conversationId?: string;
  apiKey: string;
  model: string;
  kimiModel?: string;
}

// 生成 Mermaid 代码
router.post('/generate', async (req: Request<{}, {}, GenerateRequest>, res: Response) => {
  try {
    logWithContext('debug', 'Received AI generation request', {
      body: {
        ...req.body,
        apiKey: req.body.apiKey ? '***' : undefined // 隐藏 API 密钥
      },
      headers: req.headers
    });

    const { prompt, conversationId, apiKey, kimiModel } = req.body;

    if (!prompt) {
      logWithContext('warn', 'Missing prompt parameter', {
        body: {
          ...req.body,
          apiKey: req.body.apiKey ? '***' : undefined
        }
      });
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    if (!apiKey) {
      logWithContext('warn', 'Missing API key', {
        body: {
          ...req.body,
          apiKey: undefined
        }
      });
      return res.status(400).json({ error: 'Missing API key' });
    }

    // 生成 Mermaid 代码
    const result = await KimiService.generateMermaidCode(prompt, conversationId, apiKey, kimiModel);

    logWithContext('info', 'Successfully generated Mermaid code', {
      prompt: prompt.substring(0, 100),
      codeLength: result.code.length,
      conversationId: result.conversationId,
      code: result.code,
      kimiModel
    });

    res.json({
      code: result.code,
      conversationId: result.conversationId
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