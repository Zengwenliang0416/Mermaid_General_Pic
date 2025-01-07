# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 设置npm和pnpm配置以加快安装速度
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install -g pnpm \
    && pnpm config set registry https://registry.npmmirror.com/ \
    && pnpm config set network-timeout 300000

# 只复制依赖相关文件以利用缓存
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖）
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prefer-offline

# 复制源代码并构建
COPY . .
RUN pnpm build

# 清理开发依赖
RUN pnpm prune --prod

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 设置时区和语言环境
ENV TZ=Asia/Shanghai \
    LANG=zh_CN.UTF-8 \
    LANGUAGE=zh_CN:zh \
    LC_ALL=zh_CN.UTF-8 \
    NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 一次性安装所有依赖并清理（使用 USTC 镜像源）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache \
        chromium \
        curl \
        ttf-freefont \
        font-wqy-zenhei \
        tzdata \
        imagemagick \
        imagemagick-dev \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && mkdir -p static/images logs \
    && chown -R node:node /app \
    && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# 从构建阶段复制必要文件
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 全局安装 mermaid-cli
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install -g @mermaid-js/mermaid-cli pnpm \
    && npm cache clean --force

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["pnpm", "start"] 