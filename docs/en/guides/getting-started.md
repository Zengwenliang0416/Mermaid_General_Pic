# Quick Start

This guide will help you get started with the Mermaid Chart Generator.

## Requirements

Before you begin, ensure your system meets the following requirements:

- Node.js >= 16
- npm >= 8 or pnpm >= 8
- Modern browser (Chrome, Firefox, Safari, Edge, etc.)

## Installation Steps

### 1. Clone the Project

```bash
git clone https://github.com/yourusername/mermaid-general-pic.git
cd mermaid-general-pic
```

### 2. Install Dependencies

We recommend using pnpm as the package manager:

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install frontend dependencies
cd Mermaid_General_Pic-Web
pnpm install

# Install backend dependencies
cd ../Mermaid_General_Pic-Services
pnpm install
```

### 3. Configure Environment Variables

#### Frontend Configuration

```bash
cd Mermaid_General_Pic-Web
cp .env.example .env
```

Edit the `.env` file and set the necessary environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_DEFAULT_THEME=default
VITE_DEFAULT_LANGUAGE=en
```

#### Backend Configuration

```bash
cd ../Mermaid_General_Pic-Services
cp .env.example .env
```

Edit the `.env` file and set the necessary environment variables:

```env
PORT=3000
NODE_ENV=development
KIMI_API_KEY=your_kimi_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 4. Start Development Servers

#### Start Backend Server

```bash
cd Mermaid_General_Pic-Services
pnpm dev
```

The backend server will start at http://localhost:3000.

#### Start Frontend Server

```bash
cd Mermaid_General_Pic-Web
pnpm dev
```

The frontend server will start at http://localhost:5173.

## Basic Usage

### 1. Create a Chart

1. Open your browser and visit http://localhost:5173
2. Enter Mermaid code in the editor, for example:
   ```mermaid
   graph TD
   A[Start] --> B[Process]
   B --> C[End]
   ```
3. Real-time preview will be shown in the right panel

### 2. Use AI Generation

1. Click the "AI Generate" button
2. Select an AI model (Kimi or DeepSeek)
3. Enter a natural language description, e.g., "Create a flowchart showing user login process"
4. Click the generate button

### 3. Export Charts

1. Select export format (PNG, SVG, JPG) in the preview panel
2. Choose theme and background color
3. Adjust DPI settings (if needed)
4. Click the export button

## Common Issues

### 1. Service Won't Start

- Check if ports are already in use
- Verify environment variables are configured correctly
- Confirm Node.js version meets requirements

### 2. AI Generation Fails

- Verify API keys are configured correctly
- Check network connection
- Review backend logs for detailed error messages

### 3. Chart Rendering Issues

- Verify Mermaid syntax is correct
- Try clearing browser cache
- Check browser console for error messages

## Next Steps

- Check [Features Overview](./features.md) to learn more about features
- Read [API Documentation](../api/backend.md) for interface details
- Reference [Development Guide](../development/architecture.md) to understand system architecture

## Getting Help

- Submit [GitHub Issues](https://github.com/yourusername/mermaid-general-pic/issues)
- Check [Troubleshooting Guide](./troubleshooting.md)
- Reference [FAQ](./faq.md)

## Language Switch

- [English Version](./getting-started.md)
- [中文版本](../../zh/guides/getting-started.md) 