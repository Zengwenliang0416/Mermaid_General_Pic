# 构建阶段
FROM node:20-slim AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括devDependencies）
RUN pnpm install

# 复制源代码
COPY . .

# 编译TypeScript
RUN pnpm build

# 生产阶段
FROM node:20-slim

WORKDIR /app

# 安装必要的系统依赖
RUN apt-get update \
    && apt-get install -y chromium curl fonts-freefont-ttf \
    fonts-wqy-zenhei fonts-wqy-microhei locales \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && locale-gen zh_CN.UTF-8

# 设置语言环境
ENV LANG=zh_CN.UTF-8 \
    LANGUAGE=zh_CN:zh \
    LC_ALL=zh_CN.UTF-8

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod

# 从构建阶段复制编译后的文件
COPY --from=builder /app/dist ./dist

# 创建必要的目录
RUN mkdir -p static/images logs \
    && chown -R node:node /app

# 设置 Puppeteer 环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["pnpm", "start"] 