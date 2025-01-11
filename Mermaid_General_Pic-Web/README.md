# Mermaid 图表生成器 - 前端

[English](./README_EN.md) | 简体中文

Vue 3 + TypeScript 实现的 Mermaid 图表生成器前端界面。

## 📚 目录

- [技术栈](#技术栈)
- [开发环境](#开发环境)
- [项目结构](#项目结构)
- [组件说明](#组件说明)
- [状态管理](#状态管理)
- [API 服务](#api-服务)
- [国际化](#国际化)
- [测试指南](#测试指南)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 🛠️ 技术栈

- Vue 3 - 渲染框架
- TypeScript - 类型系统
- Element Plus - UI 组件库
- Pinia - 状态管理
- Vue Router - 路由管理
- Vue I18n - 国际化
- Vite - 构建工具

## 🚀 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test
```

## 📁 项目结构

```
src/
├── assets/              # 静态资源
│   ├── styles/         # 样式文件
│   └── images/         # 图片资源
├── components/         # 可复用组件
│   ├── Editor/        # 编辑器相关组件
│   ├── History/       # 历史记录相关组件
│   └── common/        # 公共组件
├── views/             # 页面组件
│   ├── Home.vue      # 主编辑页面
│   └── History.vue   # 历史记录页面
├── stores/            # Pinia 状态管理
│   └── mermaid.ts    # Mermaid 相关状态
├── services/          # API 服务
│   ├── api.ts        # API 调用封装
│   └── types.ts      # 类型定义
├── i18n/              # 国际化
│   ├── index.ts      # i18n 配置
│   └── messages.ts   # 翻译文件
├── utils/            # 工具函数
│   ├── mermaid.ts   # Mermaid 相关工具
│   └── ai.ts        # AI 相关工具
├── router/           # 路由配置
│   └── index.ts     # 路由定义
├── App.vue          # 根组件
└── main.ts         # 入口文件
```

## 🧩 组件说明

### 📝 Editor 组件
`Editor.vue` - Mermaid 代码编辑器
- Monaco 编辑器集成
- 语法高亮
- 自动完成
- 错误提示
- 快捷键支持

### 👁️ Preview 组件
`Preview.vue` - 图表预览组件
- 实时渲染
- 缩放控制
- 导出选项
- 主题切换
- 背景设置

### 📋 History 组件
`History.vue` - 历史记录组件
- 列表展示
- 预览功能
- 代码恢复
- 批量操作
- 搜索过滤

### 🤖 AI 相关组件
`AIPrompt.vue` - AI 输入组件
- 模型选择
- 提示输入
- 上下文管理
- 历史对话
- 错误处理

## 📦 状态管理

使用 Pinia 管理状态：

### Mermaid Store
```typescript
interface MermaidState {
  code: string;
  format: 'png' | 'svg' | 'jpg';
  dpi: number;
  theme: string;
  background: string;
  history: HistoryItem[];
  loading: boolean;
  error: Error | null;
}
```

### AI Store
```typescript
interface AIState {
  model: string;
  version: string;
  conversationId: string | null;
  history: ChatMessage[];
  loading: boolean;
}
```

## 🔌 API 服务

### api.ts
```typescript
export const api = {
  // Mermaid 相关
  getFormats: () => Promise<FormatResponse>,
  convertCode: (params: ConvertParams) => Promise<ConvertResponse>,
  uploadFile: (file: File, params: UploadParams) => Promise<UploadResponse>,
  
  // AI 相关
  getModels: () => Promise<ModelResponse>,
  generateCode: (params: GenerateParams) => Promise<GenerateResponse>,
}
```

## 🌍 国际化

### 添加新语言
1. 在 `messages.ts` 添加翻译：
```typescript
export const messages = {
  zh: {
    editor: { ... },
    preview: { ... },
    history: { ... }
  },
  en: {
    editor: { ... },
    preview: { ... },
    history: { ... }
  }
}
```

2. 在语言选择器添加选项：
```typescript
const languages = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' }
]
```

## 🧪 测试指南

### 单元测试
```bash
# 运行所有测试
pnpm test:unit

# 运行特定测试文件
pnpm test:unit src/components/Editor.spec.ts

# 监视模式
pnpm test:unit:watch

# 生成覆盖率报告
pnpm test:unit:coverage
```

### E2E 测试
```bash
# 打开 Cypress 测试界面
pnpm test:e2e

# 运行所有 E2E 测试
pnpm test:e2e:ci
```

### 测试示例

#### 组件测试
```typescript
import { mount } from '@vue/test-utils'
import Editor from '@/components/Editor.vue'

describe('Editor.vue', () => {
  it('renders editor with initial value', () => {
    const wrapper = mount(Editor, {
      props: {
        modelValue: 'graph TD;A-->B;'
      }
    })
    expect(wrapper.find('.monaco-editor').exists()).toBe(true)
  })
})
```

#### E2E 测试
```typescript
describe('Mermaid Editor', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should render editor and preview', () => {
    cy.get('.editor-container').should('be.visible')
    cy.get('.preview-container').should('be.visible')
  })
})
```

## 📖 开发指南

### 代码规范
- ESLint 配置
- Prettier 格式化
- TypeScript 严格模式
- Vue 3 组合式 API 风格

### Git 工作流
- 主分支：`main`
- 开发分支：`develop`
- 功能分支：`feature/*`
- 修复分支：`bugfix/*`
- 发布分支：`release/*`

### 提交规范
```bash
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）:
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建

## 📦 部署指南

### 构建
```bash
# 构建生产版本
pnpm build
```

### 环境变量
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_AI_API_KEY=your-api-key
```

### Docker 部署
```bash
# 构建镜像
docker build -t mermaid-frontend .

# 运行容器
docker run -d -p 80:80 mermaid-frontend
```

### 部署检查清单
- [ ] 环境变量配置
- [ ] 依赖安装完整
- [ ] 构建成功
- [ ] API 配置正确
- [ ] 静态资源优化
- [ ] 安全配置
- [ ] 性能测试
- [ ] 日志配置

## ❓ 常见问题

### 开发问题
1. **编辑器加载失败**
   - 检查 Monaco 编辑器配置
   - 验证 WebWorker 设置
   - 确认资源加载完成

2. **预览不更新**
   - 检查 Mermaid 配置
   - 验证代码语法
   - 确认主题设置

3. **AI 生成失败**
   - 验证 API 密钥
   - 检查网络请求
   - 确认模型参数

### 部署问题
1. **构建失败**
   - 清理依赖缓存
   - 更新依赖版本
   - 检查 TypeScript 错误

2. **性能问题**
   - 检查代码分割
   - 优化资源加载
   - 启用缓存策略

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件
