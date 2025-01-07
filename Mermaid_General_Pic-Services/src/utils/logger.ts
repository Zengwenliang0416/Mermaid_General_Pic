/**
 * 日志工具模块
 * 提供统一的日志记录功能，支持不同级别的日志、性能指标记录和彩虹配色输出
 */
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import os from 'os';

// 日志级别定义，从低到高排序
const levels = {
  error: 0,   // 错误信息
  warn: 1,    // 警告信息
  info: 2,    // 普通信息
  http: 3,    // HTTP请求信息
  verbose: 4, // 详细信息
  debug: 5,   // 调试信息
  trace: 6    // 追踪信息
};

// 日志级别对应的控制台颜色
const colors = {
  error: 'red bold',      // 错误用红色加粗
  warn: 'yellow bold',    // 警告用黄色加粗
  info: 'green bold',     // 信息用绿色加粗
  http: 'magenta bold',   // HTTP用洋红色加粗
  verbose: 'cyan bold',   // 详细信息用青色加粗
  debug: 'blue bold',     // 调试用蓝色加粗
  trace: 'gray bold'      // 追踪用灰色加粗
};

// 自定义颜色主题，用于不同类型的日志内容
const customColors = {
  timestamp: 'gray italic',    // 时间戳使用斜体灰色
  requestId: 'blue bold',      // 请求ID用蓝色加粗
  memory: 'cyan',              // 内存信息用青色
  cpu: 'magenta',             // CPU信息用洋红色
  event: 'green bold',         // 事件信息用绿色加粗
  metadata: 'gray',            // 元数据用灰色
  success: 'green',            // 成功信息用绿色
  failure: 'red',              // 失败信息用红色
  slow: 'yellow',              // 慢请求用黄色
  brackets: 'cyan dim',        // 方括号用暗青色
  separator: 'gray dim'        // 分隔符用暗灰色
};

// 添加自定义颜色到 winston
winston.addColors({ ...colors, ...customColors });

// 日志文件存储目录
const logDir = path.join(__dirname, '../../logs');

/**
 * 性能指标格式化
 * 添加内存使用、CPU负载等性能指标
 */
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

/**
 * 错误堆栈格式化
 * 确保错误对象被正确序列化
 */
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

// 性能指标接口定义
interface PerformanceMetrics {
  memory: {
    heapUsed: number;    // 已使用的堆内存
    heapTotal: number;   // 总堆内存
    external: number;    // 外部内存
    arrayBuffers: number;// 数组缓冲区
  };
  cpu: number[];        // CPU负载
  uptime: number;       // 运行时间
}

/**
 * 自定义日志格式
 * 定义基本的日志输出格式，包括时间戳、日志级别、消息和元数据
 */
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // 确保时间戳始终存在
  const ts = timestamp || new Date().toISOString();
  let msg = `[${ts}] [${level.toUpperCase().padEnd(5)}] [${message}]`;
  
  // 添加请求ID（如果存在）
  if (metadata.requestId) {
    msg = `${msg} [RequestID: ${metadata.requestId}]`;
  }
  
  // 添加性能指标（如果存在）
  if (metadata.performance) {
    const performance = metadata.performance as PerformanceMetrics;
    msg = `${msg} [Memory: ${performance.memory.heapUsed}MB/${performance.memory.heapTotal}MB, CPU: ${performance.cpu[0].toFixed(2)}]`;
  }

  // 处理剩余的元数据
  const remainingMetadata = { ...metadata };
  delete remainingMetadata.requestId;
  delete remainingMetadata.performance;

  if (Object.keys(remainingMetadata).length > 0) {
    msg += ` ${JSON.stringify(remainingMetadata)}`;
  }
  
  return msg;
});

/**
 * 创建基本日志格式
 * 组合多个格式化器
 */
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  formatError(),
  formatPerformance(),
  winston.format.errors({ stack: true }),
  customFormat
);

/**
 * 创建控制台日志格式
 * 添加彩虹配色的控制台输出格式
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  formatError(),
  formatPerformance(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, ...metadata } = info;
    const ts = timestamp || new Date().toISOString();
    const colorizer = winston.format.colorize();
    
    // 给各个部分添加颜色
    const coloredTs = colorizer.colorize('trace', `[${ts}]`);
    const coloredLevel = colorizer.colorize(level, `[${level.toUpperCase().padEnd(5)}]`);
    
    // 根据日志级别给消息添加不同的颜色
    const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
    const coloredMessage = ['error', 'warn'].includes(level) 
      ? colorizer.colorize(level, `[${msgStr}]`)
      : level === 'info' 
        ? colorizer.colorize('success', `[${msgStr}]`)
        : `[${msgStr}]`;

    // 组装基本消息
    let msg = `${coloredTs} ${coloredLevel} ${coloredMessage}`;
    
    // 添加带颜色的请求ID
    if (metadata.requestId) {
      const coloredReqId = colorizer.colorize('requestId', `[RequestID: ${metadata.requestId}]`);
      msg = `${msg} ${coloredReqId}`;
    }
    
    // 添加带颜色的性能指标
    if (metadata.performance) {
      const performance = metadata.performance as PerformanceMetrics;
      const memoryInfo = colorizer.colorize('memory', 
        `[Memory: ${performance.memory.heapUsed}MB/${performance.memory.heapTotal}MB, CPU: ${performance.cpu[0].toFixed(2)}]`);
      msg = `${msg} ${memoryInfo}`;
    }

    // 添加带颜色的其他元数据
    const remainingMetadata = { ...metadata };
    delete remainingMetadata.requestId;
    delete remainingMetadata.performance;

    if (Object.keys(remainingMetadata).length > 0) {
      const metadataStr = JSON.stringify(remainingMetadata);
      msg += ` ${colorizer.colorize('metadata', metadataStr)}`;
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
    // 错误日志配置
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // 应用日志配置
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // 性能日志配置
    new DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      level: 'verbose'
    })
  ]
});

// 在开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

/**
 * 记录带上下文的日志
 * @param level - 日志级别
 * @param message - 日志消息
 * @param context - 上下文信息
 */
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

/**
 * 处理请求体，避免记录过长的内容
 * @param body - 请求体
 * @returns 处理后的请求体
 */
const sanitizeBody = (body: any): any => {
  if (!body) return undefined;
  
  // 处理 Mermaid 图表转换请求
  if (body.code) {
    return {
      ...body,
      code: `${body.code.substring(0, 50)}... (${body.code.length} chars)`
    };
  }
  
  // 处理字符串类型的请求体
  if (typeof body === 'string' && body.length > 100) {
    return `${body.substring(0, 100)}... (${body.length} chars)`;
  }
  
  // 处理对象类型的请求体
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

// HTTP日志数据接口
interface HttpLogData {
  requestId: string;      // 请求ID
  method: string;         // HTTP方法
  url: string;           // 请求URL
  status: number;        // 响应状态码
  responseTime: number;   // 响应时间
  ip: string;            // 客户端IP
  userAgent?: string;    // 用户代理
  query?: Record<string, any>;    // 查询参数
  params?: Record<string, any>;   // 路由参数
  body?: any;            // 请求体
  [key: string]: any;    // 其他字段
}

/**
 * 记录HTTP请求日志
 * @param req - 请求对象
 * @param res - 响应对象
 * @param responseTime - 响应时间
 * @param context - 额外的上下文信息
 */
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

  // 在开发环境记录更多详细信息
  if (process.env.NODE_ENV !== 'production') {
    logData.userAgent = req.headers['user-agent'];
    if (Object.keys(req.query).length > 0) logData.query = req.query;
    if (Object.keys(req.params).length > 0) logData.params = req.params;
    if (req.body && Object.keys(req.body).length > 0) {
      logData.body = sanitizeBody(req.body);
    }
  }

  // 对于慢请求（>1秒），记录警告日志
  if (responseTime > 1000) {
    logger.warn(`Slow HTTP ${req.method} ${req.url}`, {
      ...logData,
      performance: true
    });
  } else {
    logger.http(`HTTP ${req.method} ${req.url}`, logData);
  }
};

/**
 * 记录API错误
 * @param error - 错误对象
 * @param req - 请求对象
 * @param context - 额外的上下文信息
 */
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

/**
 * 记录性能指标
 * @param metric - 指标名称
 * @param value - 指标值
 * @param context - 额外的上下文信息
 */
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

/**
 * 记录系统事件
 * @param event - 事件名称
 * @param context - 额外的上下文信息
 */
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

/**
 * 记录安全事件
 * @param event - 事件名称
 * @param severity - 严重程度
 * @param context - 额外的上下文信息
 */
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