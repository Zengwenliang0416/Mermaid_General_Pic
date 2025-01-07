import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import os from 'os';

// 日志级别定义
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  trace: 6
};

// 日志级别颜色 - 使用彩虹配色
const colors = {
  error: 'red bold',
  warn: 'yellow bold',
  info: 'green bold',
  http: 'magenta bold',
  verbose: 'cyan bold',
  debug: 'blue bold',
  trace: 'gray bold'
};

// 自定义颜色主题
const customColors = {
  timestamp: 'gray italic',
  requestId: 'blue bold',
  memory: 'cyan',
  cpu: 'magenta',
  event: 'green bold',
  metadata: 'gray',
  success: 'green',
  failure: 'red',
  slow: 'yellow',
  brackets: 'cyan dim',
  separator: 'gray dim'
};

// 添加自定义颜色
winston.addColors({ ...colors, ...customColors });

const logDir = path.join(__dirname, '../../logs');

// 性能指标格式化
const formatPerformance = winston.format((info) => {
  if (info.performance) {
    const { heapUsed, heapTotal, external, arrayBuffers } = process.memoryUsage();
    info.performance = {
      ...info.performance,
      memory: {
        heapUsed: Math.round(heapUsed / 1024 / 1024),
        heapTotal: Math.round(heapTotal / 1024 / 1024),
        external: Math.round(external / 1024 / 1024),
        arrayBuffers: Math.round(arrayBuffers / 1024 / 1024)
      },
      cpu: os.loadavg(),
      uptime: process.uptime()
    };
  }
  return info;
});

// 错误堆栈格式化
const formatError = winston.format((info) => {
  if (info.error instanceof Error) {
    const { message, stack, ...rest } = info.error;
    info.error = {
      message,
      stack,
      ...rest
    };
  }
  return info;
});

// 性能指标接口
interface PerformanceMetrics {
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: number[];
  uptime: number;
}

// 自定义格式
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // 确保时间戳始终存在
  const ts = timestamp || new Date().toISOString();
  let msg = `${ts} [${level.toUpperCase()}]: ${message}`;
  
  if (metadata.requestId) {
    msg = `${msg} [RequestID: ${metadata.requestId}]`;
  }
  
  if (metadata.performance) {
    const performance = metadata.performance as PerformanceMetrics;
    msg = `${msg} [Memory: ${performance.memory.heapUsed}MB/${performance.memory.heapTotal}MB, CPU: ${performance.cpu[0].toFixed(2)}]`;
  }

  const remainingMetadata = { ...metadata };
  delete remainingMetadata.requestId;
  delete remainingMetadata.performance;

  if (Object.keys(remainingMetadata).length > 0) {
    msg += ` ${JSON.stringify(remainingMetadata)}`;
  }
  
  return msg;
});

// 创建基本日志格式
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  formatError(),
  formatPerformance(),
  winston.format.errors({ stack: true }),
  customFormat
);

// 创建控制台日志格式（添加彩虹配色）
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  formatError(),
  formatPerformance(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, ...metadata } = info;
    const ts = timestamp || new Date().toISOString();
    const colorizer = winston.format.colorize();
    
    // 给时间戳添加样式
    const coloredTs = colorizer.colorize('trace', ts.toString());
    
    // 给日志级别添加彩虹色
    const brackets = colorizer.colorize('brackets', '[]');
    const coloredLevel = `${brackets[0]}${colorizer.colorize(level, level.toUpperCase())}${brackets[1]}`;
    
    // 给消息添加颜色
    const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
    const coloredMessage = ['error', 'warn'].includes(level) 
      ? colorizer.colorize(level, msgStr)
      : level === 'info' 
        ? colorizer.colorize('success', msgStr)
        : msgStr;

    // 组装基本消息
    const separator = colorizer.colorize('separator', ':');
    let msg = `${coloredTs} ${coloredLevel}${separator} ${coloredMessage}`;
    
    // 给 RequestID 添加样式
    if (metadata.requestId) {
      const reqIdBrackets = colorizer.colorize('brackets', '[]');
      const coloredReqId = colorizer.colorize('requestId', `RequestID: ${metadata.requestId}`);
      msg = `${msg} ${reqIdBrackets[0]}${coloredReqId}${reqIdBrackets[1]}`;
    }
    
    // 给性能指标添加彩虹色
    if (metadata.performance) {
      const performance = metadata.performance as PerformanceMetrics;
      const memBrackets = colorizer.colorize('brackets', '[]');
      const memoryInfo = colorizer.colorize('memory', 
        `Memory: ${performance.memory.heapUsed}MB/${performance.memory.heapTotal}MB`);
      const cpuInfo = colorizer.colorize('cpu', 
        `CPU: ${performance.cpu[0].toFixed(2)}`);
      msg = `${msg} ${memBrackets[0]}${memoryInfo}, ${cpuInfo}${memBrackets[1]}`;
    }

    // 给剩余的元数据添加彩虹色
    const remainingMetadata = { ...metadata };
    delete remainingMetadata.requestId;
    delete remainingMetadata.performance;

    if (Object.keys(remainingMetadata).length > 0) {
      const metadataStr = JSON.stringify(remainingMetadata);
      if (remainingMetadata.error) {
        msg += ` ${colorizer.colorize('failure', metadataStr)}`;
      } 
      else if (remainingMetadata.event) {
        const eventBrackets = colorizer.colorize('brackets', '{}');
        msg += ` ${eventBrackets[0]}${colorizer.colorize('event', metadataStr)}${eventBrackets[1]}`;
      }
      else {
        msg += ` ${colorizer.colorize('metadata', metadataStr)}`;
      }
    }
    
    return msg;
  })
);

// 创建 logger 实例
const logger = winston.createLogger({
  levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: baseFormat,
  transports: [
    // 错误日志
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // 应用日志
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // 性能日志
    new DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      level: 'verbose'
    })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// 辅助方法：记录带上下文的日志
export const logWithContext = (
  level: string,
  message: string,
  context: Record<string, any> = {}
) => {
  const logData = {
    ...context,
    performance: true // 添加性能指标
  };
  logger.log(level, message, logData);
};

// 辅助方法：处理请求体，避免记录过长的内容
const sanitizeBody = (body: any): any => {
  if (!body) return undefined;
  
  // 如果是 Mermaid 图表转换请求
  if (body.code) {
    return {
      ...body,
      code: `${body.code.substring(0, 50)}... (${body.code.length} chars)`
    };
  }
  
  // 对于其他类型的请求体，如果太长就截断
  if (typeof body === 'string' && body.length > 100) {
    return `${body.substring(0, 100)}... (${body.length} chars)`;
  }
  
  if (typeof body === 'object') {
    const sanitized = { ...body };
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = `${sanitized[key].substring(0, 100)}... (${sanitized[key].length} chars)`;
      }
    }
    return sanitized;
  }
  
  return body;
};

interface HttpLogData {
  requestId: string;
  method: string;
  url: string;
  status: number;
  responseTime: number;
  ip: string;
  userAgent?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  [key: string]: any;
}

// 辅助方法：记录HTTP请求日志
export const logHttpRequest = (
  req: any,
  res: any,
  responseTime: number,
  context: Record<string, any> = {}
) => {
  const logData: HttpLogData = {
    requestId: req.id,
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime,
    ip: req.ip || req.connection.remoteAddress,
    ...context
  };

  // 只在调试级别记录详细信息
  if (process.env.NODE_ENV !== 'production') {
    logData.userAgent = req.headers['user-agent'];
    if (Object.keys(req.query).length > 0) logData.query = req.query;
    if (Object.keys(req.params).length > 0) logData.params = req.params;
    if (req.body && Object.keys(req.body).length > 0) {
      logData.body = sanitizeBody(req.body);
    }
  }

  // 对于慢请求，记录更多信息
  if (responseTime > 1000) {
    logger.warn(`Slow HTTP ${req.method} ${req.url}`, {
      ...logData,
      performance: true
    });
  } else {
    logger.http(`HTTP ${req.method} ${req.url}`, logData);
  }
};

// 辅助方法：记录API错误
export const logApiError = (
  error: Error,
  req: any,
  context: Record<string, any> = {}
) => {
  const logData = {
    requestId: req.id,
    method: req.method,
    url: req.url,
    error,
    body: req.body,
    params: req.params,
    query: req.query,
    ...context
  };
  logger.error('API Error', logData);
};

// 辅助方法：记录性能指标
export const logPerformance = (
  metric: string,
  value: number,
  context: Record<string, any> = {}
) => {
  const logData = {
    metric,
    value,
    performance: true,
    ...context
  };
  logger.verbose('Performance metric', logData);
};

// 辅助方法：记录系统事件
export const logSystemEvent = (
  event: string,
  context: Record<string, any> = {}
) => {
  const logData = {
    event,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    performance: true,
    ...context
  };
  logger.info('System event', logData);
};

// 辅助方法：记录安全事件
export const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high',
  context: Record<string, any> = {}
) => {
  const logData = {
    event,
    severity,
    hostname: os.hostname(),
    performance: true,
    ...context
  };
  logger.warn('Security event', logData);
};

export default logger; 