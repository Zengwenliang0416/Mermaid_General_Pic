interface LoggerOptions {
  level: string;
  module?: string;
  timestamp?: boolean;
}

class Logger {
  private level: string;
  private module: string;
  private timestamp: boolean;
  private levels = ['debug', 'info', 'warn', 'error'];

  constructor(options: LoggerOptions) {
    this.level = options.level;
    this.module = options.module || 'App';
    this.timestamp = options.timestamp !== undefined ? options.timestamp : true;
  }

  private shouldLog(level: string): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.level);
  }

  private formatMessage(level: string, message: any, ...args: any[]): string {
    const timestamp = this.timestamp ? `[${new Date().toISOString()}]` : '';
    const moduleStr = `[${this.module}]`;
    const levelStr = `[${level.toUpperCase()}]`;
    return `${timestamp} ${moduleStr} ${levelStr} ${message} ${args.length ? JSON.stringify(args) : ''}`;
  }

  debug(message: any, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: any, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, ...args));
    }
  }

  warn(message: any, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  error(message: any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, ...args));
    }
  }
}

// 创建默认logger实例
const defaultLogger = new Logger({
  level: import.meta.env.MODE === 'production' ? 'info' : 'debug',
  timestamp: true
});

// 创建logger工厂方法
export const createLogger = (options: LoggerOptions) => new Logger(options);

export default defaultLogger; 