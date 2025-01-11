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

### 基础端点

#### 获取支持的格式

```http
GET /api/formats
```

**描述**: 获取支持的图片格式、DPI范围、主题和背景选项。

**响应**: 200 OK
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

#### 转换 Mermaid 代码

```http
POST /api/convert
Content-Type: application/json
```

**描述**: 将 Mermaid 代码转换为图片。

**请求体**:
```json
{
  "code": "graph TD;A-->B;",
  "format": "png",
  "dpi": 300,
  "theme": "default",
  "background": "transparent"
}
```

**参数说明**:
- `code` (string, 必需): Mermaid 图表代码
- `format` (string, 必需): 输出格式 (png/jpg/svg)
- `dpi` (number, 可选): 图片分辨率，默认 300
- `theme` (string, 可选): 主题样式，默认 "default"
- `background` (string, 可选): 背景类型，默认 "transparent"

**响应**: 200 OK
```json
{
  "url": "/images/uuid.png"
}
```

**错误响应**:
- 400 Bad Request: 无效的代码或参数
- 500 Internal Server Error: 转换失败

#### 上传文件转换

```http
POST /api/upload
Content-Type: multipart/form-data
```

**描述**: 上传包含 Mermaid 代码的文件并转换为图片。

**表单字段**:
- `file`: (文件, 必需) Mermaid 代码文件
- `format`: (string, 必需) 输出格式
- `dpi`: (number, 可选) 图片分辨率
- `theme`: (string, 可选) 主题样式
- `background`: (string, 可选) 背景类型

**响应**: 200 OK
```json
{
  "url": "/images/uuid.png"
}
```

**错误响应**:
- 400 Bad Request: 无效的文件或参数
- 413 Payload Too Large: 文件过大
- 500 Internal Server Error: 处理失败

### AI 相关端点

#### 获取可用的 AI 模型

```http
GET /api/ai/models
```

**描述**: 获取系统支持的 AI 模型列表。

**响应**: 200 OK
```json
{
  "models": [
    {
      "id": "kimi",
      "name": "Kimi",
      "versions": ["v1"]
    },
    {
      "id": "deepseek",
      "name": "DeepSeek",
      "versions": ["v1"]
    }
  ]
}
```

#### AI 生成 Mermaid 代码

```http
POST /api/ai/generate
Content-Type: application/json
```

**描述**: 使用 AI 模型将自然语言描述转换为 Mermaid 代码。

**请求体**:
```json
{
  "prompt": "创建一个显示用户登录流程的流程图",
  "model": "kimi",
  "version": "v1",
  "apiKey": "your-api-key"
}
```

**参数说明**:
- `prompt` (string, 必需): 自然语言描述
- `model` (string, 必需): AI 模型 ID
- `version` (string, 可选): 模型版本
- `apiKey` (string, 必需): API 密钥
- `conversationId` (string, 可选): 对话上下文 ID

**响应**: 200 OK
```json
{
  "code": "graph TD\nA[开始] --> B[输入用户名密码]\nB --> C{验证}\nC -->|成功| D[登录成功]\nC -->|失败| E[显示错误]\nE --> B",
  "conversationId": "uuid"
}
```

**错误响应**:
- 400 Bad Request: 无效的请求参数
- 401 Unauthorized: API 密钥无效
- 500 Internal Server Error: AI 服务错误

## 测试

### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test tests/api/mermaid.test.ts

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### 测试文件结构

```
tests/
├── api/                    # API 测试
│   ├── mermaid.test.ts    # Mermaid 相关接口测试
│   └── ai.test.ts         # AI 相关接口测试
├── services/              # 服务层测试
│   ├── mermaid.test.ts   # Mermaid 服务测试
│   └── ai.test.ts        # AI 服务测试
└── utils/                # 工具函数测试
    └── logger.test.ts    # 日志工具测试
```

### 测试示例

#### API 测试示例

```typescript
describe('Mermaid API', () => {
  describe('POST /api/convert', () => {
    it('should convert valid mermaid code', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          code: 'graph TD;A-->B;',
          format: 'png'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
    });

    it('should handle invalid mermaid code', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          code: 'invalid code',
          format: 'png'
        });
      
      expect(response.status).toBe(400);
    });
  });
});
```

### 测试覆盖范围

1. API 测试
   - 所有端点的成功/失败场景
   - 参数验证
   - 错误处理
   - 响应格式验证
   - 文件上传处理
   - AI 模型集成

2. 服务层测试
   - Mermaid 代码验证
   - 图片生成流程
   - 文件管理
   - AI 服务集成
   - 缓存机制

3. 集成测试
   - 端到端流程测试
   - 多个服务协同工作
   - 数据持久化
   - 错误传播

4. 性能测试
   - 并发请求处理
   - 内存使用监控
   - 响应时间测试
   - 资源清理验证

### 测试工具

- Jest: 测试框架
- Supertest: HTTP 测试
- Istanbul: 代码覆盖率
- Mock Service Worker: API 模拟

### 运行测试环境

1. 准备测试数据库（如需要）:
```bash
pnpm test:setup-db
```

2. 运行测试:
```bash
# 开发环境测试
pnpm test:dev

# 生产环境测试
pnpm test:prod
```

3. 查看测试报告:
```bash
pnpm test:report
```

### 持续集成测试

在 CI/CD 流程中的测试步骤:

1. 代码检查:
```bash
pnpm lint
pnpm test:types
```

2. 单元测试:
```bash
pnpm test:ci
```

3. 集成测试:
```bash
pnpm test:integration
```

4. 性能测试:
```bash
pnpm test:performance
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