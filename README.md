# Mermaid General Pic

一个用于生成 Mermaid 图表的服务。

## 功能特点

- 支持多种输出格式 (PNG, SVG, JPG)
- 支持自定义主题和背景色
- 支持自定义 DPI
- 高性能的 Worker 池处理
- 智能缓存系统
- 详细的日志记录

## 日志系统

### 日志分类

系统包含三种类型的日志文件：

1. 应用日志 (`logs/application-%DATE%.log`)
   - 记录一般应用信息
   - 包含 HTTP 请求、系统事件等
   - 保留 14 天

2. 错误日志 (`logs/error-%DATE%.log`)
   - 记录所有错误和异常
   - 包含完整的错误堆栈
   - 保留 14 天

3. 性能日志 (`logs/performance-%DATE%.log`)
   - 记录性能指标
   - 包含内存使用、CPU 负载等
   - 保留 7 天

### 日志级别

- `error`: 错误和异常 (红色)
- `warn`: 警告信息 (黄色)
- `info`: 一般信息 (绿色)
- `http`: HTTP 请求 (紫色)
- `verbose`: 详细信息 (青色)
- `debug`: 调试信息 (蓝色)
- `trace`: 追踪信息 (灰色)

### 日志格式

每条日志包含以下信息：
```
时间戳 [日志级别]: 消息 [RequestID: 请求ID] [内存和CPU信息] {元数据}
```

例如：
```
2025-01-07 17:46:22.938 [INFO]: System event [Memory: 11MB/18MB, CPU: 5.02] {"event":"Server started","hostname":"Macbook-Pro-7.local"}
```

### 性能监控

日志系统自动记录以下性能指标：
- 内存使用（堆内存、外部内存）
- CPU 负载
- 系统运行时间
- 请求响应时间

### 特殊事件记录

1. 慢请求监控
   - 自动记录响应时间超过 1 秒的请求
   - 包含详细的请求信息和性能指标

2. 安全事件
   - 记录敏感路由的访问
   - 包含 IP、用户代理等信息
   - 根据操作类型分级（低、中、高）

3. 系统事件
   - 服务启动和关闭
   - Worker 池状态变化
   - 文件清理操作

## 开发环境设置

1. 安装依赖：
```bash
pnpm install
```

2. 启动开发服务器：
```bash
pnpm dev
```

3. 构建生产版本：
```bash
pnpm build
```

## 环境变量

- `NODE_ENV`: 环境设置 (`development` 或 `production`)
- `PORT`: 服务器端口 (默认: 8000)
- `HOST`: 服务器主机 (默认: 0.0.0.0)

## API 文档

详见 [API.md](API.md)

## Docker 部署

使用 Docker Compose 启动服务：
```bash
docker-compose up -d
```

## 许可证

MIT 