# Mermaid General Pic API 文档

## 基本信息

- 基础URL: `http://localhost:8000`
- 所有请求和响应均使用 JSON 格式
- 所有时间戳使用 ISO 8601 格式

## API 端点

### 1. 获取支持的格式信息

获取服务支持的所有图片格式、主题、背景和DPI范围。

**请求**
- 方法: `GET`
- 路径: `/api/formats`

**响应**
```json
{
  "formats": [
    "png",
    "jpg",
    "svg"
  ],
  "themes": [
    "default",
    "dark",
    "forest",
    "neutral"
  ],
  "backgrounds": [
    "transparent",
    "white"
  ],
  "dpiRange": {
    "min": 300,
    "max": 1200,
    "default": 300
  }
}
```

### 2. 获取队列状态

获取当前处理队列的状态信息。

**请求**
- 方法: `GET`
- 路径: `/api/status`

**响应**
```json
{
  "queue": {
    "waiting": 0,    // 等待处理的任务数
    "processing": 0  // 正在处理的任务数
  }
}
```

### 3. 转换 Mermaid 代码为图片

将 Mermaid 图表代码转换为指定格式的图片。

**请求**
- 方法: `POST`
- 路径: `/api/convert`
- Content-Type: `application/json`

**请求体参数**
```json
{
  "code": "graph TD\nA[开始] --> B[结束]",  // Mermaid 图表代码
  "format": "png",                         // 输出格式：png、jpg 或 svg
  "dpi": 300,                             // 图片DPI值 (300-1200)
  "theme": "default",                     // 主题：default、dark、forest 或 neutral
  "background": "transparent",            // 背景：transparent 或 white
  "filename": "diagram-name"              // 可选：输出文件名
}
```

**响应**
- Content-Type: `image/{format}` (format 为请求的输出格式)
- Content-Disposition: `attachment; filename="{filename}.{format}"`
- 响应体: 二进制图片数据

**错误响应**
```json
{
  "error": "错误信息"
}
```

## 错误处理

所有接口在发生错误时都会返回相应的 HTTP 状态码和错误信息：

- 400 Bad Request: 请求参数错误
- 500 Internal Server Error: 服务器内部错误

## 性能说明

1. 图片生成过程是异步的，通过队列管理
2. 生成的图片会被缓存，相同的请求会直接返回缓存结果
3. 大型图表可能需要更长的处理时间

## 使用示例

### cURL 示例

1. 获取支持的格式：
```bash
curl http://localhost:8000/api/formats | jq
```

2. 获取队列状态：
```bash
curl http://localhost:8000/api/status | jq
```

3. 转换图表为图片：
```bash
curl -X POST http://localhost:8000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "code": "graph TD\nA[开始] --> B[结束]",
    "format": "png",
    "dpi": 300,
    "theme": "default",
    "background": "transparent",
    "filename": "test-diagram"
  }' --output diagram.png
``` 