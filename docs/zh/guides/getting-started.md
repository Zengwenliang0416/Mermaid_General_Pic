# 快速开始

本指南将帮助您快速上手 Mermaid 图表生成器。

## 环境要求

在开始之前，请确保您的系统满足以下要求：

- Node.js >= 16
- npm >= 8 或 pnpm >= 8
- 现代浏览器（Chrome、Firefox、Safari、Edge 等）

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/mermaid-general-pic.git
cd mermaid-general-pic
```

### 2. 安装依赖

我们推荐使用 pnpm 作为包管理器：

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装前端依赖
cd Mermaid_General_Pic-Web
pnpm install

# 安装后端依赖
cd ../Mermaid_General_Pic-Services
pnpm install
```

### 3. 配置环境变量

#### 前端配置

```bash
cd Mermaid_General_Pic-Web
cp .env.example .env
```

编辑 `.env` 文件，设置必要的环境变量：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_DEFAULT_THEME=default
VITE_DEFAULT_LANGUAGE=zh
```

#### 后端配置

```bash
cd ../Mermaid_General_Pic-Services
cp .env.example .env
```

编辑 `.env` 文件，设置必要的环境变量：

```env
PORT=3000
NODE_ENV=development
KIMI_API_KEY=your_kimi_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 4. 启动开发服务器

#### 启动后端服务

```bash
cd Mermaid_General_Pic-Services
pnpm dev
```

后端服务将在 http://localhost:3000 启动。

#### 启动前端服务

```bash
cd Mermaid_General_Pic-Web
pnpm dev
```

前端服务将在 http://localhost:5173 启动。

## 基本使用

### 1. 创建图表

1. 打开浏览器访问 http://localhost:5173
2. 在编辑器中输入 Mermaid 代码，例如：
   ```mermaid
   graph TD
   A[开始] --> B[处理]
   B --> C[结束]
   ```
3. 实时预览将显示在右侧面板

### 2. 使用 AI 生成

1. 点击 "AI 生成" 按钮
2. 选择 AI 模型（Kimi 或 DeepSeek）
3. 输入自然语言描述，例如："创建一个显示用户登录流程的图表"
4. 点击生成按钮

### 3. 导出图表

1. 在预览面板中选择导出格式（PNG、SVG、JPG）
2. 选择主题和背景颜色
3. 调整 DPI 设置（如需要）
4. 点击导出按钮

## 常见问题

### 1. 服务无法启动

- 检查端口是否被占用
- 确认环境变量配置正确
- 检查 Node.js 版本是否满足要求

### 2. AI 生成失败

- 确认 API 密钥配置正确
- 检查网络连接
- 查看后端日志获取详细错误信息

### 3. 图表渲染问题

- 确认 Mermaid 语法正确
- 尝试清除浏览器缓存
- 检查浏览器控制台是否有错误信息

## 下一步

- 查看[功能概览](./features.md)了解更多功能
- 阅读[API 文档](../api/backend.md)了解接口详情
- 参考[开发指南](../development/architecture.md)了解系统架构

## 获取帮助

- 提交 [GitHub Issues](https://github.com/yourusername/mermaid-general-pic/issues)
- 查看[故障排除指南](./troubleshooting.md)
- 参考[常见问题解答](./faq.md)

## 语言切换

- [English Version](../en/guides/getting-started.md)
- [中文版本](./getting-started.md) 