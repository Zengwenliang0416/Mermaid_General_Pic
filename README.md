# Mermaid 图表生成器

[English](./README_EN.md) | 简体中文

Mermaid 图表生成器是一个强大的 Web 应用，旨在简化图表创建过程。通过集成先进的 AI 技术和用户友好的界面，它能够帮助用户快速创建各类专业图表，包括流程图、时序图、类图、状态图等。

![logo](./imgs/logo.png)

## 📚 文档

详细文档请访问我们的[文档中心](./docs/zh/README.md)：

- [快速开始](./docs/zh/guides/getting-started.md)
- [功能概览](./docs/zh/guides/features.md)
- [API 文档](./docs/zh/api/backend.md)
- [开发指南](./docs/zh/development/architecture.md)
- [部署指南](./docs/zh/deployment/installation.md)
- [故障排除](./docs/zh/guides/troubleshooting.md)

## ✨ 功能特点

### 🤖 AI 辅助生成
- 支持多种 AI 模型（Kimi、DeepSeek）
- 通过自然语言描述生成 Mermaid 代码
- 保持对话上下文，支持持续优化
- 可选择不同的模型版本

### 📊 图表编辑
- 实时预览 Mermaid 图表
- 支持多种主题（默认、暗色、森林、中性）
- 可调整背景颜色（透明、白色）
- 支持多种导出格式（PNG、SVG、JPG）
- 可自定义 DPI 分辨率

### 📝 转换历史
- 自动保存所有转换记录
- 支持查看历史图表
- 可重新加载历史代码
- 支持清除历史记录

### 🎨 界面特性
- 响应式设计，支持移动端
- 支持中英文切换
- 暗色/亮色主题切换
- 直观的导航栏

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8 或 pnpm >= 8

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/mermaid-general-pic.git
   cd mermaid-general-pic
   ```

2. 安装依赖：
   ```bash
   # 前端
   cd Mermaid_General_Pic-Web
   pnpm install
   
   # 后端
   cd ../Mermaid_General_Pic-Services
   pnpm install
   ```

3. 配置环境：
   ```bash
   # 前端配置
   cd Mermaid_General_Pic-Web
   cp .env.example .env
   
   # 后端配置
   cd ../Mermaid_General_Pic-Services
   cp .env.example .env
   ```

4. 启动服务：
   ```bash
   # 前端开发服务器
   cd Mermaid_General_Pic-Web
   pnpm dev
   
   # 后端开发服务器
   cd ../Mermaid_General_Pic-Services
   pnpm dev
   ```

更多详细信息请参阅[完整文档](./docs/zh/README.md)。

## 🤝 贡献

我们欢迎所有形式的贡献，包括但不限于：
- 提交问题和建议
- 改进文档
- 修复 bug
- 添加新功能

详细信息请参阅[贡献指南](./docs/zh/development/contributing.md)。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件。 