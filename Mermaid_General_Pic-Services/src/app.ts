import express from 'express';
import cors from 'cors';
import mermaidRoutes from './routes/mermaid.routes';
import kimiRoutes from './routes/kimi.routes';
import { loggingMiddleware } from './utils/logging-middleware';
import { logSystemEvent } from './utils/logger';
import { config } from './config/config';

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/static', express.static(config.imagesDir));

// 添加日志中间件
app.use(loggingMiddleware);

// 路由
app.use('/api/mermaid', mermaidRoutes);
app.use('/api/kimi', kimiRoutes);

// 404 处理
app.use((req, res) => {
  logSystemEvent('404 Not Found', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logSystemEvent('Server Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app; 