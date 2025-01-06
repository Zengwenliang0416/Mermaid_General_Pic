# API 文档

## 基础信息

- 基础 URL: `http://localhost:8000`
- 所有请求和响应均使用 JSON 格式
- 所有响应都包含适当的 HTTP 状态码

## 端点说明

### 获取支持的格式

获取支持的输出格式、DPI 范围、主题和背景选项。

```http
GET /api/formats
```

#### 响应

```json
{
  "formats": ["png", "jpg", "svg"],
  "dpi": {
    "min": 72,
    "max": 600,
    "default": 300
  },
  "themes": ["default", "dark", "forest", "neutral"],
  "backgrounds": ["transparent", "white"]
}
```

### 转换 Mermaid 代码

将 Mermaid 代码转换为图片。

```http
POST /api/convert
Content-Type: application/json
```

#### 请求体

```json
{
  "code": "graph TD;A-->B;",
  "format": "png",
  "dpi": 300,
  "theme": "default",
  "background": "transparent"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| code | string | 是 | Mermaid 图表代码 |
| format | string | 是 | 输出格式（png/jpg/svg） |
| dpi | number | 否 | 图片分辨率（72-600） |
| theme | string | 否 | 主题样式 |
| background | string | 否 | 背景类型 |

#### 响应

```json
{
  "url": "/images/abc123.png",
  "format": "png"
}
```

### 上传文件转换

上传包含 Mermaid 代码的文件并转换为图片。

```http
POST /api/upload
Content-Type: multipart/form-data
```

#### 请求参数

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | file | 是 | Mermaid 文件（.txt/.mmd） |
| format | string | 是 | 输出格式 |
| dpi | number | 否 | 图片分辨率 |
| theme | string | 否 | 主题样式 |
| background | string | 否 | 背景类型 |

#### 响应

```json
{
  "url": "/images/abc123.png",
  "format": "png"
}
```

### 获取生成的图片

获取已生成的图片文件。

```http
GET /images/:filename
```

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| filename | string | 图片文件名 |

#### 响应

返回图片文件的二进制数据。

## 错误处理

所有错误响应都遵循以下格式：

```json
{
  "error": "错误描述信息"
}
```

### HTTP 状态码

- 200: 请求成功
- 400: 请求参数错误
- 404: 资源不存在
- 415: 不支持的媒体类型
- 500: 服务器内部错误

### 常见错误

1. 无效的 Mermaid 代码
```json
{
  "error": "Invalid Mermaid syntax"
}
```

2. 不支持的输出格式
```json
{
  "error": "Unsupported output format"
}
```

3. 文件大小超限
```json
{
  "error": "File size exceeds limit (1MB)"
}
```

## 示例

### cURL 示例

1. 获取支持的格式
```bash
curl http://localhost:8000/api/formats
```

2. 转换 Mermaid 代码
```bash
curl -X POST http://localhost:8000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "code": "graph TD;A-->B;",
    "format": "png",
    "dpi": 300,
    "theme": "default",
    "background": "transparent"
  }'
```

3. 上传文件
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@diagram.mmd" \
  -F "format=png" \
  -F "dpi=300" \
  -F "theme=default" \
  -F "background=transparent"
```

## 限制说明

- 最大文件大小：1MB
- 支持的文件类型：.txt, .mmd
- DPI 范围：72-600
- 图片保存时间：24小时
- 并发请求限制：每分钟 60 次

## 安全说明

- 所有上传的文件都会进行安全检查
- 生成的图片使用随机文件名
- 定期清理过期文件
- 限制并发请求数量
- 验证所有输入参数 