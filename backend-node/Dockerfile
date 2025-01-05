FROM node:20-slim

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 编译TypeScript
RUN pnpm build

# 创建必要的目录
RUN mkdir -p static/images logs

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["pnpm", "start"] 