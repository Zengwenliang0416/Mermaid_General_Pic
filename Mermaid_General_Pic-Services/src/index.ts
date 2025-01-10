import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { loggingMiddleware } from './utils/logging-middleware';
import { logSystemEvent } from './utils/logger';
import mermaidRoutes from './routes/mermaid.routes';
import kimiRoutes from './routes/kimi.routes';
import { MermaidService } from './services/mermaid.service';

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 添加日志中间件
app.use(loggingMiddleware);

// 路由
app.use('/api/mermaid', mermaidRoutes);
app.use('/api/kimi', kimiRoutes);

// 静态文件服务
app.use('/static', express.static(config.imagesDir));

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

// 启动服务器
const server = app.listen(config.port, () => {
  logSystemEvent('Server started', {
    port: config.port,
    env: process.env.NODE_ENV,
    nodeVersion: process.version,
    config: {
      ...config,
      kimiApiKey: config.kimiApiKey ? '***' : 'not set'
    }
  });
});

// 优雅关闭
process.on('SIGTERM', () => {
  logSystemEvent('Received SIGTERM signal', {
    activeConnections: server.connections
  });
  
  server.close(() => {
    logSystemEvent('Server shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logSystemEvent('Received SIGINT signal', {
    activeConnections: server.connections
  });
  
  server.close(() => {
    logSystemEvent('Server shutdown complete');
    process.exit(0);
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logSystemEvent('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // 给进程一点时间来记录日志
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logSystemEvent('Unhandled Rejection', {
    reason,
    promise
  });
});

// 定期清理旧文件
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24小时
setInterval(() => {
  MermaidService.cleanupOldFiles()
    .catch(error => {
      logSystemEvent('File cleanup failed', {
        error: error.message
      });
    });
}, CLEANUP_INTERVAL);

export default app; 