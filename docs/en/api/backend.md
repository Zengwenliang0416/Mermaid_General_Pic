# Backend API Documentation

## Basic Endpoints

### Get Supported Formats

Retrieve the list of supported chart formats.

- **URL**: `/api/formats`
- **Method**: `GET`
- **Response Example**:
  ```json
  {
    "formats": ["png", "svg", "jpg"]
  }
  ```

### Convert Mermaid Code

Convert Mermaid code to an image.

- **URL**: `/api/convert`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "graph TD\nA[Start] --> B[End]",
    "format": "png",
    "theme": "default",
    "backgroundColor": "transparent",
    "dpi": 300
  }
  ```
- **Parameters**:
  - `code`: Mermaid code (required)
  - `format`: Output format, options: png, svg, jpg (required)
  - `theme`: Theme, options: default, dark, forest, neutral (optional, default: default)
  - `backgroundColor`: Background color, options: transparent, white (optional, default: transparent)
  - `dpi`: Output image DPI value (optional, default: 300)
- **Response**:
  - Success: Returns image file
  - Failure:
    ```json
    {
      "error": "Error message"
    }
    ```

### Upload File Conversion

Convert through file upload.

- **URL**: `/api/upload`
- **Method**: `POST`
- **Request Body**: `multipart/form-data`
  - `file`: Mermaid code file
  - `format`: Output format
  - `theme`: Theme (optional)
  - `backgroundColor`: Background color (optional)
  - `dpi`: DPI value (optional)
- **Response**: Same as Convert Mermaid Code endpoint

## AI-Related Endpoints

### Get Available AI Models

Retrieve the list of supported AI models.

- **URL**: `/api/ai/models`
- **Method**: `GET`
- **Response Example**:
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

### AI Generate Mermaid Code

Use AI model to convert natural language description to Mermaid code.

- **URL**: `/api/ai/generate`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "prompt": "Create a flowchart showing user login process",
    "model": "kimi-v1",
    "conversationId": "optional-conversation-id"
  }
  ```
- **Parameters**:
  - `prompt`: Natural language description (required)
  - `model`: AI model ID (required)
  - `conversationId`: Conversation ID for maintaining context (optional)
- **Response Example**:
  ```json
  {
    "code": "graph TD\nA[Start] --> B[Enter Username/Password]\nB --> C{Validate}\nC -->|Success| D[Login Success]\nC -->|Failure| E[Show Error]\nE --> B",
    "conversationId": "generated-conversation-id"
  }
  ```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages when errors occur:

- 400 Bad Request: Invalid request parameters
- 401 Unauthorized: Unauthorized access
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server internal error

Error response format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Rate Limiting

To protect server resources, the API has the following rate limits:

- Basic conversion endpoints: 60 requests per minute
- AI generation endpoint: 10 requests per minute

Returns 429 Too Many Requests status code when exceeded.

## Versioning

Current API version: v1

API version is specified through URL prefix: `/api/v1/...`

## Testing

### Endpoint Testing

Each API endpoint provides a test endpoint to verify service operation:

```bash
# Test basic conversion service
curl http://localhost:3000/api/test/convert

# Test AI generation service
curl http://localhost:3000/api/test/ai
```

### Performance Testing

Use Apache Bench for performance testing:

```bash
# Test basic conversion endpoint
ab -n 1000 -c 10 http://localhost:3000/api/formats

# Test AI generation endpoint
ab -n 100 -c 5 -p test/data/prompt.json -T application/json http://localhost:3000/api/ai/generate
```

## Example Code

### Node.js

```javascript
const axios = require('axios');

// Convert Mermaid code
async function convertMermaid(code, format = 'png') {
  try {
    const response = await axios.post('http://localhost:3000/api/convert', {
      code,
      format
    });
    return response.data;
  } catch (error) {
    console.error('Conversion failed:', error.response.data);
  }
}

// Use AI to generate code
async function generateMermaid(prompt) {
  try {
    const response = await axios.post('http://localhost:3000/api/ai/generate', {
      prompt,
      model: 'kimi-v1'
    });
    return response.data;
  } catch (error) {
    console.error('Generation failed:', error.response.data);
  }
}
```

### Python

```python
import requests

# Convert Mermaid code
def convert_mermaid(code, format='png'):
    try:
        response = requests.post('http://localhost:3000/api/convert', json={
            'code': code,
            'format': format
        })
        return response.content
    except Exception as e:
        print(f'Conversion failed: {str(e)}')

# Use AI to generate code
def generate_mermaid(prompt):
    try:
        response = requests.post('http://localhost:3000/api/ai/generate', json={
            'prompt': prompt,
            'model': 'kimi-v1'
        })
        return response.json()
    except Exception as e:
        print(f'Generation failed: {str(e)}')
```

## Changelog

### v1.0.0 (2024-01-20)
- Initial release
- Basic chart conversion support
- AI generation integration

### v1.1.0 (2024-02-15)
- Added multi-model support
- Improved error handling
- Enhanced conversion performance

## Language Switch

- [English Version](./backend.md)
- [中文版本](../../zh/api/backend.md) 