# 后端 API 文档

## 基础端点

### 获取支持的格式

获取系统支持的图表格式列表。

- **URL**: `/api/formats`
- **方法**: `GET`
- **响应示例**:
  ```json
  {
    "formats": ["png", "svg", "jpg"]
  }
  ```

### 转换 Mermaid 代码

将 Mermaid 代码转换为图片。

- **URL**: `/api/convert`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "code": "graph TD\nA[开始] --> B[结束]",
    "format": "png",
    "theme": "default",
    "backgroundColor": "transparent",
    "dpi": 300
  }
  ```
- **参数说明**:
  - `code`: Mermaid 代码（必需）
  - `format`: 输出格式，可选值：png、svg、jpg（必需）
  - `theme`: 主题，可选值：default、dark、forest、neutral（可选，默认：default）
  - `backgroundColor`: 背景颜色，可选值：transparent、white（可选，默认：transparent）
  - `dpi`: 输出图片的 DPI 值（可选，默认：300）
- **响应**:
  - 成功：返回图片文件
  - 失败：
    ```json
    {
      "error": "错误信息"
    }
    ```

### 上传文件转换

通过上传文件进行转换。

- **URL**: `/api/upload`
- **方法**: `POST`
- **请求体**: `multipart/form-data`
  - `file`: Mermaid 代码文件
  - `format`: 输出格式
  - `theme`: 主题（可选）
  - `backgroundColor`: 背景颜色（可选）
  - `dpi`: DPI 值（可选）
- **响应**: 同转换 Mermaid 代码接口

## AI 相关端点

### 获取可用的 AI 模型

获取系统支持的 AI 模型列表。

- **URL**: `/api/ai/models`
- **方法**: `GET`
- **响应示例**:
  ```json
  {
    "models": [
      {
        "id": "kimi-v1",
        "name": "Kimi"
      },
      {
        "id": "deepseek-v1",
        "name": "DeepSeek"
      }
    ]
  }
  ```

### AI 生成 Mermaid 代码

使用 AI 模型将自然语言描述转换为 Mermaid 代码。

- **URL**: `/api/ai/generate`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "prompt": "创建一个显示用户登录流程的流程图",
    "model": "kimi-v1",
    "conversationId": "optional-conversation-id"
  }
  ```
- **参数说明**:
  - `prompt`: 自然语言描述（必需）
  - `model`: AI 模型 ID（必需）
  - `conversationId`: 对话 ID，用于保持上下文（可选）
- **响应示例**:
  ```json
  {
    "code": "graph TD\nA[开始] --> B[输入用户名密码]\nB --> C{验证}\nC -->|成功| D[登录成功]\nC -->|失败| E[显示错误]\nE --> B",
    "conversationId": "generated-conversation-id"
  }
  ```

## 错误处理

所有 API 端点在发生错误时都会返回适当的 HTTP 状态码和错误信息：

- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未授权访问
- 404 Not Found: 资源不存在
- 500 Internal Server Error: 服务器内部错误

错误响应格式：
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 速率限制

为了保护服务器资源，API 设置了以下速率限制：

- 基础转换接口：每分钟 60 次请求
- AI 生成接口：每分钟 10 次请求

超过限制时会返回 429 Too Many Requests 状态码。

## 版本控制

当前 API 版本：v1

API 版本通过 URL 前缀指定：`/api/v1/...`

## 测试

### 端点测试

每个 API 端点都提供了一个测试端点，用于验证服务是否正常运行：

```bash
# 测试基础转换服务
curl http://localhost:3000/api/test/convert

# 测试 AI 生成服务
curl http://localhost:3000/api/test/ai
```

### 性能测试

使用 Apache Bench 进行性能测试：

```bash
# 测试基础转换接口
ab -n 1000 -c 10 http://localhost:3000/api/formats

# 测试 AI 生成接口
ab -n 100 -c 5 -p test/data/prompt.json -T application/json http://localhost:3000/api/ai/generate
```

## 示例代码

### Node.js

```javascript
const axios = require('axios');

// 转换 Mermaid 代码
async function convertMermaid(code, format = 'png') {
  try {
    const response = await axios.post('http://localhost:3000/api/convert', {
      code,
      format
    });
    return response.data;
  } catch (error) {
    console.error('转换失败:', error.response.data);
  }
}

// 使用 AI 生成代码
async function generateMermaid(prompt) {
  try {
    const response = await axios.post('http://localhost:3000/api/ai/generate', {
      prompt,
      model: 'kimi-v1'
    });
    return response.data;
  } catch (error) {
    console.error('生成失败:', error.response.data);
  }
}
```

### Python

```python
import requests

# 转换 Mermaid 代码
def convert_mermaid(code, format='png'):
    try:
        response = requests.post('http://localhost:3000/api/convert', json={
            'code': code,
            'format': format
        })
        return response.content
    except Exception as e:
        print(f'转换失败: {str(e)}')

# 使用 AI 生成代码
def generate_mermaid(prompt):
    try:
        response = requests.post('http://localhost:3000/api/ai/generate', json={
            'prompt': prompt,
            'model': 'kimi-v1'
        })
        return response.json()
    except Exception as e:
        print(f'生成失败: {str(e)}')
```

## 更新日志

### v1.0.0 (2024-01-20)
- 初始版本发布
- 支持基础图表转换
- 集成 AI 生成功能

### v1.1.0 (2024-02-15)
- 添加多模型支持
- 优化错误处理
- 提高转换性能

## 语言切换

- [English Version](../en/api/backend.md)
- [中文版本](./backend.md) 