# Mermaid Code to Image Converter Backend

This is the backend service for converting Mermaid code to images. It provides RESTful APIs for converting Mermaid code to various image formats.

## Features

- Convert Mermaid code to PNG, JPG, or SVG
- Support file upload (.txt, .mmd)
- Configurable DPI settings
- Automatic cleanup of old files
- CORS enabled
- Error handling and logging

## Prerequisites

- Node.js 20 or later
- pnpm package manager

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create necessary directories:
   ```bash
   mkdir -p static/images logs
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

## Development

Start the development server:
```bash
pnpm dev
```

## Production Build

Build the TypeScript code:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

## Docker

Build the Docker image:
```bash
docker build -t mermaid-converter-backend .
```

Run the container:
```bash
docker run -d -p 8000:8000 mermaid-converter-backend
```

## API Endpoints

### GET /api/formats
Get supported output formats and DPI range.

### POST /api/convert
Convert Mermaid code to image.

Request body:
```json
{
  "code": "graph TD;A-->B;",
  "format": "png",
  "dpi": 300
}
```

### POST /api/upload
Upload and convert Mermaid file.

Form data:
- file: Mermaid file (.txt, .mmd)
- format: Output format (png, jpg, svg)
- dpi: Resolution (72-600)

## Environment Variables

- PORT: Server port (default: 8000)
- NODE_ENV: Environment (development/production)

## License

ISC 