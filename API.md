# API 文档

## 基础信息

- 基础路径: `/api`
- 所有请求和响应均使用 JSON 格式
- 所有请求都会被记录到日志系统中

## 认证

目前 API 不需要认证。

## 错误处理

所有错误响应都遵循以下格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {} // 可选的详细信息
  }
}
```

错误会被记录到 `error.log` 文件中，包含完整的错误堆栈和请求信息。

## 端点

### 转换 Mermaid 图表

将 Mermaid 代码转换为图片。

```
POST /convert
```

#### 请求参数

```json
{
  "code": "graph TD\nA-->B",
  "outputFormat": "png",
  "theme": "default",
  "backgroundColor": "transparent",
  "dpi": 300
}
```

- `code`: Mermaid 代码 (必需)
- `outputFormat`: 输出格式，支持 "png"、"svg"、"jpg" (必需)
- `theme`: 主题，支持 "default"、"dark"、"forest"、"neutral" (可选，默认 "default")
- `backgroundColor`: 背景色，支持 "transparent" 或十六进制颜色值 (可选，默认 "transparent")
- `dpi`: DPI 值，范围 72-600 (可选，默认 300)

#### 响应

成功响应 (200):
```json
{
  "url": "/images/diagram-123456.png",
  "format": "png",
  "size": 12345
}
```

### 获取支持的格式

获取支持的输出格式列表。

```
GET /formats
```

#### 响应

```json
{
  "formats": ["png", "svg", "jpg"]
}
```

### 上传 Mermaid 文件

上传包含 Mermaid 代码的文件并转换。

```
POST /upload
```

#### 请求

使用 `multipart/form-data` 格式：
- `file`: Mermaid 代码文件
- `outputFormat`: 输出格式
- `theme`: 主题 (可选)
- `backgroundColor`: 背景色 (可选)
- `dpi`: DPI 值 (可选)

#### 响应

与 `/convert` 端点相同。

### 获取生成的图片

```
GET /images/:filename
```

#### 参数

- `filename`: 图片文件名，从 `/convert` 或 `/upload` 响应中获取

#### 响应

直接返回图片文件。

## 性能监控

所有 API 请求都会被记录以下性能指标：

- 响应时间
- 内存使用
- CPU 使用率
- 缓存命中率

慢请求（响应时间 > 1秒）会被额外记录到性能日志中。

## 日志记录

每个 API 请求都会生成以下日志：

### 请求日志
```
[时间] [INFO] HTTP 请求
方法: POST
路径: /api/convert
请求ID: req-123456
IP: 127.0.0.1
用户代理: Mozilla/5.0 ...
请求体: {...}
```

### 响应日志
```
[时间] [INFO] HTTP 响应
请求ID: req-123456
状态码: 200
响应时间: 235ms
响应体大小: 12345 bytes
```

### 错误日志
```
[时间] [ERROR] 请求处理失败
请求ID: req-123456
错误: Invalid Mermaid syntax
堆栈: Error: Invalid Mermaid syntax
    at MermaidService.validate ...
```

## 限流

- 每个 IP 每分钟最多 60 个请求
- 超出限制会返回 429 状态码
- 限流事件会被记录到日志中

## 缓存

- 相同的转换请求会使用缓存
- 缓存命中会在日志中标记
- 缓存有效期为 24 小时 