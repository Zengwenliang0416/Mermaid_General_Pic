# Mermaid Chart Generator - Backend

English | [简体中文](./README.md)

Mermaid chart generation service implemented with Node.js + Express.

## 🛠️ Tech Stack

- Node.js
- TypeScript
- Express
- Mermaid CLI
- Multer
- Winston

## 🚀 Development Environment

```bash
# Install dependencies
pnpm install

# Create necessary directories
mkdir -p static/images logs

# Start development server
pnpm dev

# Build production version
pnpm build

# Run tests
pnpm test
```

## 📁 Project Structure

```
src/
├── routes/             # API routes
│   └── mermaid.routes.ts
├── services/           # Business logic
│   └── mermaid.service.ts
├── config/            # Configuration files
│   └── config.ts
├── utils/             # Utility functions
│   └── logger.ts
└── index.ts          # Entry file

static/               # Static files
└── images/          # Generated images

logs/                # Log files
├── error.log       # Error logs
└── combined.log    # Combined logs
```

## 📚 API Documentation

### Basic Endpoints

#### Get Supported Formats

```http
GET /api/formats
```

**Description**: Get supported image formats, DPI ranges, themes, and background options.

**Response**: 200 OK
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

#### Convert Mermaid Code

```http
POST /api/convert
Content-Type: application/json
```

**Description**: Convert Mermaid code to an image.

**Request Body**:
```json
{
  "code": "graph TD;A-->B;",
  "format": "png",
  "dpi": 300,
  "theme": "default",
  "background": "transparent"
}
```

**Parameters**:
- `code` (string, required): Mermaid chart code
- `format` (string, required): Output format (png/jpg/svg)
- `dpi` (number, optional): Image resolution, default 300
- `theme` (string, optional): Theme style, default "default"
- `background` (string, optional): Background type, default "transparent"

**Response**: 200 OK
```json
{
  "url": "/images/uuid.png"
}
```

**Error Responses**:
- 400 Bad Request: Invalid code or parameters
- 500 Internal Server Error: Conversion failed

#### Upload File Conversion

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Description**: Upload a file containing Mermaid code and convert it to an image.

**Form Fields**:
- `file`: (file, required) Mermaid code file
- `format`: (string, required) Output format
- `dpi`: (number, optional) Image resolution
- `theme`: (string, optional) Theme style
- `background`: (string, optional) Background type

**Response**: 200 OK
```json
{
  "url": "/images/uuid.png"
}
```

**Error Responses**:
- 400 Bad Request: Invalid file or parameters
- 413 Payload Too Large: File too large
- 500 Internal Server Error: Processing failed

### AI-related Endpoints

#### Get Available AI Models

```http
GET /api/ai/models
```

**Description**: Get list of supported AI models in the system.

**Response**: 200 OK
```json
{
  "models": [
    {
      "id": "kimi",
      "name": "Kimi",
      "versions": ["v1"]
    },
    {
      "id": "deepseek",
      "name": "DeepSeek",
      "versions": ["v1"]
    }
  ]
}
```

#### AI Generate Mermaid Code

```http
POST /api/ai/generate
Content-Type: application/json
```

**Description**: Use AI model to convert natural language description to Mermaid code.

**Request Body**:
```json
{
  "prompt": "Create a flowchart showing user login process",
  "model": "kimi",
  "version": "v1",
  "apiKey": "your-api-key"
}
```

**Parameters**:
- `prompt` (string, required): Natural language description
- `model` (string, required): AI model ID
- `version` (string, optional): Model version
- `apiKey` (string, required): API key
- `conversationId` (string, optional): Conversation context ID

**Response**: 200 OK
```json
{
  "code": "graph TD\nA[Start] --> B[Enter Username/Password]\nB --> C{Validate}\nC -->|Success| D[Login Success]\nC -->|Failure| E[Show Error]\nE --> B",
  "conversationId": "uuid"
}
```

**Error Responses**:
- 400 Bad Request: Invalid request parameters
- 401 Unauthorized: Invalid API key
- 500 Internal Server Error: AI service error

## 🧪 Testing

### Unit Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/api/mermaid.test.ts

# Run tests with coverage report
pnpm test:coverage
```

### Test File Structure

```
tests/
├── api/                    # API tests
│   ├── mermaid.test.ts    # Mermaid-related API tests
│   └── ai.test.ts         # AI-related API tests
├── services/              # Service layer tests
│   ├── mermaid.test.ts   # Mermaid service tests
│   └── ai.test.ts        # AI service tests
└── utils/                # Utility function tests
    └── logger.test.ts    # Logger tests
```

### Test Examples

#### API Test Example

```typescript
describe('Mermaid API', () => {
  describe('POST /api/convert', () => {
    it('should convert valid mermaid code', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          code: 'graph TD;A-->B;',
          format: 'png'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
    });

    it('should handle invalid mermaid code', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          code: 'invalid code',
          format: 'png'
        });
      
      expect(response.status).toBe(400);
    });
  });
});
```

### Test Coverage

1. API Testing
   - Success/failure scenarios for all endpoints
   - Parameter validation
   - Error handling
   - Response format validation
   - File upload handling
   - AI model integration

2. Service Layer Testing
   - Mermaid code validation
   - Image generation process
   - File management
   - AI service integration
   - Caching mechanism

3. Integration Testing
   - End-to-end flow testing
   - Multiple service coordination
   - Data persistence
   - Error propagation

4. Performance Testing
   - Concurrent request handling
   - Memory usage monitoring
   - Response time testing
   - Resource cleanup validation

### Testing Tools

- Jest: Testing framework
- Supertest: HTTP testing
- Istanbul: Code coverage
- Mock Service Worker: API mocking

### Running Test Environment

1. Prepare test database (if needed):
```bash
pnpm test:setup-db
```

2. Run tests:
```bash
# Development environment testing
pnpm test:dev

# Production environment testing
pnpm test:prod
```

3. View test report:
```bash
pnpm test:report
```

### CI/CD Testing

Testing steps in CI/CD pipeline:

1. Code check:
```bash
pnpm lint
pnpm test:types
```

2. Unit tests:
```bash
pnpm test:ci
```

3. Integration tests:
```bash
pnpm test:integration
```

4. Performance tests:
```bash
pnpm test:performance
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
PORT=8000
NODE_ENV=development
```

### Configuration File (config.ts)

```typescript
export const config = {
  port: process.env.PORT || 8000,
  staticDir: path.join(__dirname, '../../static'),
  imagesDir: path.join(__dirname, '../../static/images'),
  allowedFileTypes: ['.txt', '.mmd'],
  maxFileSize: 1024 * 1024, // 1MB
  outputFormats: ['png', 'jpg', 'svg'],
  dpiRange: {
    min: 72,
    max: 600,
    default: 300
  },
  themes: ['default', 'dark', 'forest', 'neutral'],
  backgrounds: ['transparent', 'white']
};
```

## 📝 Logging System

Using Winston for logging:

- error.log: Error logs
- combined.log: All logs

Log format:
```json
{
  "timestamp": "2024-01-05T12:00:00.000Z",
  "level": "info",
  "message": "Server started on port 8000"
}
```

## 📂 File Management

### Storage Location

- Temporary files: `static/images/`
- Generated images: `static/images/`

### Cleanup Strategy

- Auto-clean files older than 24 hours
- Cleanup runs hourly
- Skip files in use

## ❌ Error Handling

### API Errors

- 400: Client errors
- 404: Resource not found
- 500: Server errors

### Business Errors

- File size exceeded
- Format not supported
- Invalid parameters

### System Errors

- Insufficient disk space
- Insufficient permissions
- Process crashes

## 🚀 Performance Optimization

1. Image Generation
   - Limit concurrency
   - Use stream processing
   - Async processing

2. File Processing
   - Stream uploads
   - Regular cleanup
   - Size limits

3. Memory Management
   - Timely release
   - Prevent leaks
   - Monitor usage

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details
``` 