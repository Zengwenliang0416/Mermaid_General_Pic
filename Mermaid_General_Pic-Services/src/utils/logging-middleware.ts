import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logHttpRequest, logApiError, logSecurityEvent, logPerformance } from './logger';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// 请求计时中间件
export const requestTimer = (req: Request, res: Response, next: NextFunction) => {
  // 为每个请求添加唯一ID
  req.id = req.id || uuidv4();
  
  // 记录请求开始时间
  const start = Date.now();
  
  // 响应结束时记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    logHttpRequest(req, res, duration, {
      query: req.query,
      params: req.params,
      // 对于某些敏感路由，不记录请求体
      body: !req.path.includes('/auth') ? req.body : undefined
    });
  });

  next();
};

// API 错误处理中间件
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logApiError(err, req);
  next(err);
};

// 安全相关的请求记录
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const sensitiveRoutes = ['/auth', '/admin', '/api/users'];
  if (sensitiveRoutes.some(route => req.path.includes(route))) {
    const context = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      authHeader: req.headers.authorization ? 'present' : 'absent'
    };
    
    // 根据路由和方法确定严重程度
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      severity = 'medium';
    }
    if (req.path.includes('/admin')) {
      severity = 'high';
    }

    logSecurityEvent(`Access to sensitive route: ${req.path}`, severity, context);
  }
  next();
};

// 性能监控中间件
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    if (duration > 1000) { // 记录响应时间超过1秒的请求
      logPerformance('slow-request', duration, {
        path: req.path,
        method: req.method,
        status: res.statusCode
      });
    }
  });

  next();
};

// 组合所有中间件
export const loggingMiddleware = [
  requestTimer,
  securityLogger,
  performanceLogger,
  errorLogger
]; 