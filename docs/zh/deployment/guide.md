# 部署指南

## 环境要求

### 系统要求
- Node.js >= 16.0.0
- pnpm >= 8.0.0
- Redis >= 6.0.0
- SQLite >= 3.0.0
- 推荐使用 Linux/Unix 系统

### 硬件要求
- CPU: 2核心以上
- 内存: 4GB以上
- 硬盘: 20GB以上
- 带宽: 5Mbps以上

### 网络要求
- 开放必要端口(80/443)
- 配置域名和SSL证书
- 设置防火墙规则
- 配置负载均衡(可选)

## 安装部署

### 前端部署
1. 获取代码
```bash
git clone https://github.com/your-repo/Mermaid_General_Pic-Web.git
cd Mermaid_General_Pic-Web
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

4. 构建项目
```bash
pnpm build
```

5. 部署静态文件
```bash
# 将 dist 目录下的文件部署到 Web 服务器
```

### 后端部署
1. 获取代码
```bash
git clone https://github.com/your-repo/Mermaid_General_Pic-Services.git
cd Mermaid_General_Pic-Services
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

4. 初始化数据库
```bash
pnpm run migrate
```

5. 启动服务
```bash
pnpm start
```

### Docker 部署
1. 构建镜像
```bash
docker-compose build
```

2. 启动服务
```bash
docker-compose up -d
```

## 配置说明

### 前端配置
- `VITE_API_BASE_URL`: API基础地址
- `VITE_AI_API_KEY`: AI服务API密钥
- `VITE_APP_TITLE`: 应用标题
- `VITE_APP_DESCRIPTION`: 应用描述

### 后端配置
- `PORT`: 服务端口
- `NODE_ENV`: 运行环境
- `DATABASE_URL`: 数据库连接
- `REDIS_URL`: Redis连接
- `AI_API_KEY`: AI服务密钥
- `LOG_LEVEL`: 日志级别

### Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 性能优化

### 前端优化
- 启用 Gzip 压缩
- 配置浏览器缓存
- 使用 CDN 加速
- 优化资源加载
- 启用预渲染
- 懒加载组件

### 后端优化
- 启用响应压缩
- 配置缓存策略
- 优化数据库查询
- 使用连接池
- 限制请求大小
- 配置超时时间

### 数据库优化
- 优化索引设计
- 配置查询缓存
- 定期维护优化
- 监控性能指标
- 配置连接池
- 定期备份数据

## 监控告警

### 系统监控
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- 进程状态
- 系统日志

### 应用监控
- 接口响应时间
- 错误率统计
- 并发连接数
- 业务指标
- 用户活跃度
- 资源使用率

### 告警配置
- 设置告警阈值
- 配置告警渠道
- 设置告警级别
- 告警升级策略
- 告警抑制规则
- 告警恢复通知

## 日志管理

### 日志配置
- 访问日志
- 错误日志
- 业务日志
- 安全日志
- 性能日志
- 审计日志

### 日志收集
- 使用 ELK 栈
- 配置日志轮转
- 设置保留策略
- 压缩历史日志
- 定期清理日志
- 备份重要日志

### 日志分析
- 错误排查
- 性能分析
- 用户行为分析
- 安全审计
- 业务统计
- 趋势分析

## 备份恢复

### 数据备份
- 定时自动备份
- 手动备份方式
- 备份内容说明
- 备份存储策略
- 备份监控告警
- 备份测试验证

### 数据恢复
- 恢复流程说明
- 恢复测试方案
- 恢复演练计划
- 应急恢复预案
- 数据一致性检查
- 恢复后验证

## 故障处理

### 常见问题
- 服务无法访问
- 接口响应慢
- 数据库连接失败
- 缓存服务异常
- 日志写入失败
- 磁盘空间不足

### 处理流程
1. 问题发现
2. 初步诊断
3. 确定原因
4. 采取措施
5. 恢复服务
6. 复盘总结

### 应急预案
- 服务降级方案
- 限流熔断策略
- 数据备份恢复
- 应急响应流程
- 故障升级机制
- 通知发布流程

## 维护更新

### 日常维护
- 系统巡检
- 性能优化
- 安全加固
- 数据清理
- 配置更新
- 文档维护

### 版本更新
- 更新计划制定
- 更新内容确认
- 更新风险评估
- 更新操作执行
- 更新结果验证
- 回滚预案准备

## 语言切换

- [English Version](../../en/deployment/guide.md)
- [中文版本](./guide.md) 