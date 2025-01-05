import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/config';
import mermaidRoutes from './routes/mermaid.routes';
import logger from './utils/logger';
import { MermaidService } from './services/mermaid.service';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use('/images', express.static(config.imagesDir));

// 路由
app.use('/api', mermaidRoutes);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 定期清理旧文件
setInterval(() => {
  MermaidService.cleanupOldFiles()
    .catch(err => logger.error('Error cleaning up files:', err));
}, 60 * 60 * 1000); // 每小时执行一次

// 启动服务器
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
}); 