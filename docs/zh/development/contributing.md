# 贡献指南

## 参与贡献

### 行为准则
- 尊重每一位贡献者
- 友善地进行技术讨论
- 接受建设性的批评
- 关注项目的最佳利益
- 遵循社区规范

### 贡献方式
- 提交 Issue
- 提交 Pull Request
- 完善文档
- 回答问题
- 参与讨论
- 分享项目

## 开发流程

### 准备工作
1. Fork 项目仓库
2. 克隆到本地
```bash
git clone https://github.com/your-username/project-name.git
```
3. 添加上游仓库
```bash
git remote add upstream https://github.com/original-owner/project-name.git
```
4. 创建开发分支
```bash
git checkout -b feature/your-feature
```

### 开发规范
- 遵循项目的代码规范
- 保持代码整洁
- 编写必要的注释
- 更新相关文档
- 添加必要的测试
- 确保测试通过

### 提交规范
- 使用规范的提交信息
```
<type>(<scope>): <subject>

<body>

<footer>
```
- type 类型:
  - feat: 新功能
  - fix: 修复
  - docs: 文档
  - style: 格式
  - refactor: 重构
  - test: 测试
  - chore: 其他
- 一个提交只做一件事
- 保持提交信息清晰明了

### 分支管理
- master: 主分支
- develop: 开发分支
- feature/*: 功能分支
- bugfix/*: 修复分支
- release/*: 发布分支
- hotfix/*: 紧急修复分支

## Pull Request 流程

### 提交前检查
1. 代码风格检查
```bash
pnpm lint
```
2. 运行测试
```bash
pnpm test
```
3. 更新文档
4. 解决冲突
5. 压缩提交
6. 更新分支

### 提交步骤
1. 推送到远程分支
```bash
git push origin feature/your-feature
```
2. 创建 Pull Request
3. 填写 PR 描述
4. 等待 CI 检查
5. 等待代码审查
6. 根据反馈修改

### PR 描述模板
```markdown
## 描述
简要描述你的改动

## 动机和背景
为什么需要这个改动

## 改动内容
- 改动点1
- 改动点2
- 改动点3

## 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] E2E测试

## 文档
- [ ] 更新了API文档
- [ ] 更新了使用说明
- [ ] 更新了开发文档

## 截图（如果适用）
```

## 代码审查

### 审查重点
- 代码质量
- 测试覆盖
- 文档完整性
- 性能影响
- 安全隐患
- 向后兼容性

### 反馈规范
- 清晰表达问题
- 给出改进建议
- 指出潜在风险
- 肯定好的改动
- 保持建设性
- 及时回复

### 修改流程
1. 收到反馈
2. 讨论方案
3. 修改代码
4. 提交修改
5. 请求再次审查
6. 合并代码

## 发布流程

### 版本规范
- 遵循语义化版本
  - 主版本号：不兼容的API修改
  - 次版本号：向下兼容的功能性新增
  - 修订号：向下兼容的问题修正

### 发布步骤
1. 创建发布分支
```bash
git checkout -b release/v1.0.0
```
2. 更新版本号
3. 更新更新日志
4. 运行测试
5. 创建发布PR
6. 合并到主分支
7. 创建标签
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

### 更新日志
- 记录所有重要改动
- 按类型分类
- 注明破坏性更新
- 标注贡献者
- 链接相关 Issue 和 PR

## 问题反馈

### Issue 规范
- 使用 Issue 模板
- 提供详细信息
- 描述清楚问题
- 提供复现步骤
- 说明环境信息
- 附上相关日志

### Issue 模板
```markdown
## 问题描述
描述你遇到的问题

## 复现步骤
1. 步骤1
2. 步骤2
3. 步骤3

## 期望行为
描述期望的行为

## 实际行为
描述实际的行为

## 环境信息
- 操作系统：
- 浏览器：
- 版本号：
- 其他相关信息：

## 其他信息
截图或日志等
```

### 问题分类
- bug: 程序错误
- feature: 功能请求
- docs: 文档相关
- question: 使用疑问
- enhancement: 改进建议

## 社区参与

### 交流方式
- GitHub Discussions
- Issue 讨论
- 邮件列表
- 社区会议
- 技术博客
- 社交媒体

### 贡献激励
- 贡献者名单
- 版本致谢
- 社区角色
- 技术分享
- 项目展示

### 社区治理
- 决策流程
- 角色定义
- 晋升机制
- 争议解决
- 行为准则

## 语言切换

- [English Version](../../en/development/contributing.md)
- [中文版本](./contributing.md) 