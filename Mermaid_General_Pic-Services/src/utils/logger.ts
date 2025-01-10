/**
 * 日志工具模块
 * 提供统一的日志记录功能，支持不同级别的日志、性能指标记录和彩虹配色输出
 */
import winston from 'winston';
import 'winston-daily-rotate-file';
import { Request, Response } from 'express';
import chalk from 'chalk';

// 日志等级颜色配置
const levelColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'gray'
} as const;

// 模块颜色配置
const moduleColors = {
  HTTP: 'cyan',
  API: 'magenta',
  System: 'blue',
  Security: 'red',
  Performance: 'yellow',
  Default: 'white'
} as const;

type ModuleType = keyof typeof moduleColors;
type ColorType = typeof moduleColors[keyof typeof moduleColors];

// 清理敏感信息
function sanitizeData(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '******';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
}

// 格式化错误信息
function formatError(error: Error): any {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 5).join('\n') // 只保留前5行堆栈
  };
}

// 格式化元数据
function formatMetadata(meta: Record<string, any>): string {
  if (!meta || Object.keys(meta).length === 0) return '';
  
  // Filter out redundant or verbose fields
  const excludedFields = [
    'module', 'traceId', 'hostname', 'platform', 'arch',
    'rawCode', 'cleanedCode', 'originalCode', // Avoid duplicate code logs
    'headers', // Avoid verbose header information
  ];
  
  const formatted = Object.entries(meta)
    .filter(([key]) => !excludedFields.includes(key))
    .map(([key, value]) => {
      // For API responses, only show essential information
      if (key === 'fullResponse' && typeof value === 'object') {
        const { choices, usage } = value;
        return `${chalk.gray(key)}: ${JSON.stringify({ choices, usage }, null, 2)}`;
      }
      
      const valueStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
      return `${chalk.gray(key)}: ${valueStr}`;
    })
    .join(' | ');

  return formatted ? `\n  ${formatted}` : '';
}

// 创建日志格式
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const moduleInfo = (meta.module as ModuleType) || 'Default';
    const moduleColor = moduleColors[moduleInfo] as ColorType;
    const levelColor = levelColors[level as keyof typeof levelColors] || 'white';
    const traceId = meta.traceId ? chalk.gray(`[${meta.traceId}]`) : '';

    // 构建基本日志信息
    const timeStr = chalk.gray(timestamp);
    const levelStr = (chalk as any)[levelColor](level.toUpperCase().padEnd(7));
    const moduleStr = (chalk as any)[moduleColor](`[${moduleInfo}]`.padEnd(12));
    const messageStr = chalk.white(message);

    // 格式化元数据
    const metaStr = formatMetadata(meta);

    return `${timeStr} ${levelStr} ${moduleStr} ${traceId} ${messageStr}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const moduleInfo = (meta.module as ModuleType) || 'Default';
    const traceId = meta.traceId ? `[${meta.traceId}]` : '';
    const levelPadded = level.toUpperCase().padEnd(7);
    const modulePadded = `[${moduleInfo}]`.padEnd(12);

    // 格式化元数据
    const metaObj = Object.entries(meta)
      .filter(([key]) => !['module', 'traceId', 'hostname', 'platform', 'arch'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    const metaStr = Object.keys(metaObj).length > 0 ? ` ${JSON.stringify(metaObj)}` : '';

    return `${timestamp} ${levelPadded} ${modulePadded} ${traceId} ${message}${metaStr}`;
  })
);

// 创建 Winston logger
const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new (winston.transports as any).DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    new (winston.transports as any).DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
});

// 添加上下文信息的日志函数
export function logWithContext(
  level: string,
  message: string,
  context: Record<string, any> = {}
) {
  const logData = {
    ...context,
    hostname: require('os').hostname(),
    platform: process.platform,
    arch: process.arch,
    traceId: context.traceId || generateTraceId()
  };

  logger.log(level, message, logData);
}

// 生成追踪ID
function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}`;
}

// 系统事件日志
export function logSystemEvent(
  event: string,
  context: Record<string, any> = {}
) {
  logWithContext('info', event, {
    module: 'System',
    ...context
  });
}

// HTTP请求日志
export function logHttpRequest(
  req: Request,
  res: Response,
  responseTime: number,
  context: Record<string, any> = {}
) {
  const logData = {
    module: 'HTTP',
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    query: sanitizeData(req.query),
    params: sanitizeData(req.params),
    body: sanitizeData(req.body),
    ...context
  };

  const level = res.statusCode >= 400 ? 'warn' : 
                responseTime > 1000 ? 'warn' : 'info';
  
  const statusColor = res.statusCode >= 500 ? chalk.red :
                     res.statusCode >= 400 ? chalk.yellow :
                     res.statusCode >= 300 ? chalk.cyan :
                     chalk.green;
  
  const message = `${req.method} ${req.originalUrl || req.url} ${statusColor(res.statusCode)}`;
  logWithContext(level, message, logData);
}

// API错误日志
export function logApiError(
  error: Error,
  req: Request,
  context: Record<string, any> = {}
) {
  const logData = {
    module: 'API',
    method: req.method,
    url: req.originalUrl || req.url,
    error: formatError(error),
    ...context
  };

  logWithContext('error', `❌ ${error.message}`, logData);
}

// 性能指标日志
export function logPerformance(
  metric: string,
  value: number,
  context: Record<string, any> = {}
) {
  const logData = {
    module: 'Performance',
    metric,
    value: typeof value === 'number' ? `${value}ms` : value,
    ...context
  };

  // Only log performance warnings for truly slow operations
  if (value > 3000) {
    logWithContext('warn', `⚠️ ${metric}`, logData);
  }
}

// 安全事件日志
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high',
  context: Record<string, any> = {}
) {
  const logData = {
    module: 'Security',
    event,
    severity,
    ...context
  };

  const level = severity === 'high' ? 'error' : 
                severity === 'medium' ? 'warn' : 'info';
  
  const icon = severity === 'high' ? '🚨' : 
               severity === 'medium' ? '⚠️' : 'ℹ️';
                
  logWithContext(level, `${icon} ${event}`, logData);
}

export default logger; 