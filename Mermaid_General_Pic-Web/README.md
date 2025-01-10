# Mermaid 图表生成器 - 前端

Vue 3 + TypeScript 实现的 Mermaid 图表生成器前端界面。

## 技术栈

- Vue 3
- TypeScript
- Element Plus
- Pinia
- Vue Router
- Vue I18n
- Vite

## 开发环境

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

## 项目结构

```
src/
├── components/          # 可复用组件
├── views/              # 页面组件
│   ├── Home.vue       # 主编辑页面
│   └── History.vue    # 历史记录页面
├── stores/             # Pinia 状态管理
│   └── mermaid.ts     # Mermaid 相关状态
├── services/           # API 服务
│   └── api.ts         # API 调用封装
├── i18n/               # 国际化
│   ├── index.ts       # i18n 配置
│   └── messages.ts    # 翻译文件
├── router/             # 路由配置
│   └── index.ts       # 路由定义
├── App.vue            # 根组件
└── main.ts            # 入口文件

## 测试

### 单元测试

```bash
# 运行单元测试
pnpm test:unit
```

测试文件位于 `tests/unit/` 目录，使用 Vitest 进行测试。

测试覆盖：
- 组件渲染测试
- Store 状态管理测试
- API 服务测试
- 工具函数测试

### E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e
```

测试文件位于 `tests/e2e/` 目录，使用 Cypress 进行测试。

测试场景：
1. 基本功能测试
   - Mermaid 代码编辑和预览
   - 格式切换
   - DPI 调整
   - 主题切换
   - 背景切换

2. 文件操作测试
   - 文件上传
   - 图片下载
   - 历史记录管理

3. 界面交互测试
   - 响应式布局
   - 语言切换
   - 错误提示
   - 加载状态

4. 边界条件测试
   - 空输入处理
   - 错误代码处理
   - 网络错误处理

## 组件说明

### Home.vue

主编辑页面，包含：
- Mermaid 代码编辑器
- 实时预览
- 格式选择
- DPI 设置
- 主题选择
- 背景选择
- 文件上传
- 图片下载

### History.vue

历史记录页面，包含：
- 转换历史列表
- 历史记录预览
- 重新加载历史记录
- 下载历史图片
- 清空历史记录

## 状态管理

使用 Pinia 管理状态，主要包含：
- Mermaid 代码
- 输出格式
- DPI 设置
- 主题设置
- 背景设置
- 转换历史
- 加载状态
- 错误信息

## API 服务

### api.ts

封装了与后端的通信：
- 获取支持的格式
- 转换 Mermaid 代码
- 上传文件
- 错误处理

## 国际化

支持中英文切换，翻译文件位于 `src/i18n/messages.ts`。

### 添加新语言

1. 在 messages.ts 中添加新语言对象
2. 在语言切换组件中添加新选项
3. 更新语言检测逻辑

## 样式主题

使用 Element Plus 的主题系统，可以通过以下方式自定义：

1. 覆盖 Element Plus 变量
2. 添加自定义 CSS
3. 使用主题编辑器

## 开发指南

### 新增功能

1. 创建功能分支
2. 添加必要的组件/服务
3. 更新状态管理
4. 添加测试用例
5. 更新文档
6. 提交 PR

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格
- 使用 TypeScript 类型注解

### 提交规范

使用语义化提交信息：
- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

## 部署

### 构建

```bash
# 构建生产版本
pnpm build
```

构建产物位于 `dist/` 目录。

### 环境变量

在 `.env` 文件中配置：
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Docker 部署

```bash
# 构建镜像
docker build -t mermaid-frontend .

# 运行容器
docker run -d -p 80:80 mermaid-frontend
```

## 常见问题

1. **开发服务器启动失败**
   - 检查端口占用
   - 确认依赖安装完整
   - 检查环境变量配置

2. **构建错误**
   - 清理依赖缓存
   - 更新依赖版本
   - 检查 TypeScript 错误

3. **测试失败**
   - 检查测试环境配置
   - 更新快照
   - 检查异步测试超时

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

ISC License
