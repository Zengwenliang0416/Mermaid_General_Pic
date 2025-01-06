# Mermaid 图表生成器 🎨

一个基于 Vue 3 和 Node.js 的 Web 应用，用于将 Mermaid 代码转换为图片。支持实时预览、多种输出格式、DPI 调整、主题切换等功能。

## ✨ 特性

- 🖼️ 支持多种输出格式（PNG、SVG、JPG）
- 🔍 实时预览功能
- 📱 响应式设计，支持移动端
- 🌈 多种主题选择
- 🎯 可调节 DPI 和背景设置
- 🌏 支持中英文界面
- 📦 支持 Docker 部署
- 💾 转换历史记录

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- Docker (可选，用于容器化部署)
- pnpm (推荐的包管理器)

### 使用 Docker 部署（推荐）

1. 克隆仓库：
   ```bash
   git clone <repository-url>
   cd Mermaid_General_Pic
   ```

2. 使用 Docker Compose 启动服务：
   ```bash
   docker compose up -d
   ```

3. 访问应用：
   - 前端：http://localhost:3000
   - 后端 API：http://localhost:8000

### 手动部署

#### 后端服务

1. 进入后端目录：
   ```bash
   cd backend-node
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 构建项目：
   ```bash
   pnpm build
   ```

4. 启动服务：
   ```bash
   pnpm start
   ```

#### 前端服务

1. 进入前端目录：
   ```bash
   cd frontend
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 开发模式启动：
   ```bash
   pnpm dev
   ```

4. 构建生产版本：
   ```bash
   pnpm build
   ```

## 📖 使用说明

1. 在左侧编辑器中输入 Mermaid 代码
2. 实时预览会显示在右侧
3. 调整输出设置：
   - 选择输出格式（PNG/SVG/JPG）
   - 调整 DPI 值（72-600）
   - 选择主题（默认/暗色/森林/中性）
   - 设置背景（透明/白色）
4. 点击下载按钮获取生成的图片
5. 在历史记录页面查看之前的转换记录

## 🔧 配置说明

### 环境变量

后端服务配置（backend-node/.env）：
```env
PORT=8000
NODE_ENV=production
```

前端服务配置（frontend/.env）：
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Docker 配置

项目包含以下 Docker 相关文件：
- `docker-compose.yml`：定义服务编排
- `frontend/Dockerfile`：前端服务构建配置
- `backend-node/Dockerfile`：后端服务构建配置

## 📝 API 文档

### 主要端点

- `GET /api/formats`：获取支持的输出格式
- `POST /api/convert`：转换 Mermaid 代码为图片
- `POST /api/upload`：上传并转换 Mermaid 文件
- `GET /images/:filename`：获取生成的图片

详细的 API 文档请参考 [API.md](./API.md)

## 🔨 开发指南

### 项目结构
```
.
├── frontend/                # 前端 Vue 项目
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   ├── views/         # 页面视图
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── i18n/          # 国际化配置
│   │   └── services/      # API 服务
│   └── ...
├── backend-node/           # 后端 Node.js 项目
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── services/      # 业务逻辑
│   │   ├── config/        # 配置文件
│   │   └── utils/         # 工具函数
│   └── ...
└── docker-compose.yml      # Docker 编排配置
```

### 测试

运行后端测试：
```bash
cd backend-node
pnpm test
```

运行前端测试：
```bash
cd frontend
pnpm test
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🆘 常见问题

### Q: 如何解决中文显示乱码问题？
A: 确保 Docker 环境中已安装中文字体包，项目默认使用文泉驿字体。

### Q: 如何调整生成图片的质量？
A: 可以通过调整 DPI 值来改变图片质量，支持的范围是 72-600。

### Q: 如何备份转换历史？
A: 转换历史存储在浏览器的本地存储中，可以通过导出功能保存。

## 📞 支持与反馈

如果你遇到任何问题或有建议，请：
1. 查看 [Issues](issues) 页面
2. 创建新的 Issue
3. 或发送邮件到：[your-email@example.com] 