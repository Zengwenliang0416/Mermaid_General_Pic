# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 设置npm和pnpm配置以加快安装速度
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install -g pnpm \
    && pnpm config set registry https://registry.npmmirror.com/ \
    && pnpm config set network-timeout 300000

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm build

# 生产阶段
FROM nginx:alpine

# 设置时区
ENV TZ=Asia/Shanghai
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# 复制构建产物和配置
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 