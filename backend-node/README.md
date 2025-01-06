# Mermaid 图表生成器 - 后端

Node.js + Express 实现的 Mermaid 图表生成服务。

## 技术栈

- Node.js
- TypeScript
- Express
- Mermaid CLI
- Multer
- Winston

## 开发环境

```bash
# 安装依赖
pnpm install

# 创建必要的目录
mkdir -p static/images logs

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test
```

## 项目结构

```
src/
├── routes/             # API 路由
│   └── mermaid.routes.ts
├── services/           # 业务逻辑
│   └── mermaid.service.ts
├── config/            # 配置文件
│   └── config.ts
├── utils/             # 工具函数
│   └── logger.ts
└── index.ts          # 入口文件

static/               # 静态文件
└── images/          # 生成的图片

logs/                # 日志文件
├── error.log       # 错误日志
└── combined.log    # 综合日志
```

## API 文档

### 获取支持的格式

```http
GET /api/formats
```

响应：
```json
{
  "formats": ["png", "jpg", "svg"],
  "dpi": {
    "min": 72,
    "max": 600,
    "default": 300
  },
  "themes": ["default", "dark", "forest", "neutral"],
  "backgrounds": ["transparent", "white"]
}
```

### 转换 Mermaid 代码

```http
POST /api/convert
Content-Type: application/json

{
  "code": "graph TD;A-->B;",
  "format": "png",
  "dpi": 300,
  "theme": "default",
  "background": "transparent"
}
```

响应：
```json
{
  "url": "/images/uuid.png"
}
```

### 上传文件转换

```http
POST /api/upload
Content-Type: multipart/form-data

file: <file>
format: "png"
dpi: 300
theme: "default"
background: "transparent"
```

响应：
```json
{
  "url": "/images/uuid.png"
}
```

## 配置说明

### 环境变量 (.env)

```env
PORT=8000
NODE_ENV=development
```

### 配置文件 (config.ts)

```typescript
export const config = {
  port: process.env.PORT || 8000,
  staticDir: path.join(__dirname, '../../static'),
  imagesDir: path.join(__dirname, '../../static/images'),
  allowedFileTypes: ['.txt', '.mmd'],
  maxFileSize: 1024 * 1024, // 1MB
  outputFormats: ['png', 'jpg', 'svg'],
  dpiRange: {
    min: 72,
    max: 600,
    default: 300
  },
  themes: ['default', 'dark', 'forest', 'neutral'],
  backgrounds: ['transparent', 'white']
};
```

## 测试

### 单元测试

```bash
# 运行单元测试
pnpm test
```

测试文件位于 `tests/` 目录。

测试覆盖：
- API 路由测试
- 服务层测试
- 工具函数测试
- 错误处理测试

### 测试场景

1. API 测试
   - 格式获取
   - 代码转换
   - 文件上传
   - 错误处理

2. 服务层测试
   - 图片生成
   - 文件清理
   - 参数验证

3. 性能测试
   - 并发请求
   - 大文件处理
   - 内存使用

4. 错误处理测试
   - 无效输入
   - 文件系统错误
   - 进程错误

## 日志系统

使用 Winston 进行日志记录：

- error.log: 错误日志
- combined.log: 所有日志

日志格式：
```json
{
  "timestamp": "2024-01-05T12:00:00.000Z",
  "level": "info",
  "message": "Server started on port 8000"
}
```

## 文件管理

### 存储位置

- 临时文件：`static/images/`
- 生成的图片：`static/images/`

### 清理策略

- 自动清理 24 小时前的文件
- 每小时执行一次清理
- 跳过正在使用的文件

## 错误处理

### API 错误

- 400: 客户端错误
- 404: 资源不存在
- 500: 服务器错误

### 业务错误

- 文件大小超限
- 格式不支持
- 参数无效

### 系统错误

- 磁盘空间不足
- 权限不足
- 进程崩溃

## 性能优化

1. 图片生成
   - 限制并发数
   - 使用流处理
   - 异步处理

2. 文件处理
   - 流式上传
   - 定期清理
   - 大小限制

3. 内存管理
   - 及时释放
   - 避免泄漏
   - 监控使用

## 部署

### 传统部署

```bash
# 构建
pnpm build

# 启动
NODE_ENV=production pnpm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t mermaid-backend .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/static:/app/static \
  mermaid-backend
```

### 注意事项

1. 目录权限
   - logs 目录可写
   - static/images 目录可写
   - 临时文件目录可写

2. 环境变量
   - 设置 NODE_ENV
   - 配置端口
   - 配置日志级别

3. 资源限制
   - 设置内存限制
   - 设置 CPU 限制
   - 设置存储限制

## 监控

### 日志监控

- 错误率监控
- 响应时间监控
- 请求量监控

### 系统监控

- CPU 使用率
- 内存使用率
- 磁盘使用率

### 业务监控

- 转换成功率
- 文件清理情况
- 并发请求数

## 常见问题

1. **图片生成失败**
   - 检查 Mermaid CLI 安装
   - 验证代码语法
   - 检查磁盘空间

2. **性能问题**
   - 调整并发限制
   - 优化文件清理
   - 检查内存使用

3. **部署问题**
   - 检查目录权限
   - 验证环境变量
   - 确认依赖安装

## 维护指南

### 日常维护

1. 日志检查
   - 检查错误日志
   - 分析性能日志
   - 清理旧日志

2. 存储管理
   - 监控磁盘使用
   - 验证清理任务
   - 备份重要数据

3. 性能优化
   - 分析响应时间
   - 优化资源使用
   - 调整配置参数

### 更新维护

1. 依赖更新
   - 更新 package.json
   - 测试兼容性
   - 记录更新日志

2. 功能更新
   - 编写测试用例
   - 进行压力测试
   - 更新文档

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

ISC License 