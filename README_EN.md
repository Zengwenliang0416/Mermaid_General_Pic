# Mermaid Chart Generator

English | [简体中文](./README.md)

A powerful web application designed to simplify chart creation. By integrating advanced AI technology and a user-friendly interface, it helps users quickly create various professional diagrams, including flowcharts, sequence diagrams, class diagrams, and state diagrams.

![logo](./imgs/logo.png)

## 📚 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [API Documentation](#api-documentation)
- [Testing Guide](#testing-guide)
- [Deployment Guide](#deployment-guide)
- [FAQ](#faq)
- [Contributing](#contributing)

## ✨ Features

### 🤖 AI-Assisted Generation
- Support for multiple AI models (Kimi, DeepSeek)
- Generate Mermaid code from natural language descriptions
- Maintain conversation context for continuous optimization
- Multiple model versions available

### 📊 Chart Editing
- Real-time preview of Mermaid diagrams
- Multiple themes (default, dark, forest, neutral)
- Adjustable background colors (transparent, white)
- Multiple export formats (PNG, SVG, JPG)
- Customizable DPI resolution

### 📝 Conversion History
- Automatic saving of all conversion records
- View historical charts
- Reload historical code
- Clear history records

### 🎨 Interface Features
- Responsive design, mobile support
- English/Chinese language switching
- Dark/Light theme switching
- Intuitive navigation bar

## 🚀 Quick Start

### Requirements
- Node.js >= 16
- npm >= 8 or pnpm >= 8

### Installation Steps

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/mermaid-general-pic.git
   cd mermaid-general-pic
   ```

2. Install dependencies:
   ```bash
   # Frontend
   cd Mermaid_General_Pic-Web
   pnpm install
   
   # Backend
   cd ../Mermaid_General_Pic-Services
   pnpm install
   ```

3. Configure environment:
   ```bash
   # Frontend configuration
   cd Mermaid_General_Pic-Web
   cp .env.example .env
   
   # Backend configuration
   cd ../Mermaid_General_Pic-Services
   cp .env.example .env
   ```

4. Start services:
   ```bash
   # Frontend development server
   cd Mermaid_General_Pic-Web
   pnpm dev
   
   # Backend development server
   cd ../Mermaid_General_Pic-Services
   pnpm dev
   ```

## 📁 Project Structure

```
mermaid-general-pic/
├── Mermaid_General_Pic-Web/     # Frontend project
│   ├── src/                    # Source code
│   ├── tests/                  # Test files
│   └── README.md              # Frontend documentation
├── Mermaid_General_Pic-Services/ # Backend project
│   ├── src/                    # Source code
│   ├── tests/                  # Test files
│   └── README.md              # Backend documentation
└── README.md                   # Project documentation
```

For detailed project structure, refer to:
- [Frontend Structure](./Mermaid_General_Pic-Web/README_EN.md#project-structure)
- [Backend Structure](./Mermaid_General_Pic-Services/README_EN.md#project-structure)

## 📖 Development Guide

### Tech Stack
- Frontend: Vue 3 + TypeScript + Element Plus
- Backend: Node.js + Express + TypeScript
- AI Integration: Kimi API, DeepSeek API
- Chart Generation: Mermaid CLI

### Development Workflow
1. Create feature branch
2. Develop new feature
3. Write tests
4. Submit code
5. Code review
6. Merge to development branch

For detailed development guides, refer to:
- [Frontend Development Guide](./Mermaid_General_Pic-Web/README_EN.md#development-guide)
- [Backend Development Guide](./Mermaid_General_Pic-Services/README_EN.md#development-guide)

## 📚 API Documentation

### Basic APIs
- Get supported formats
- Convert Mermaid code
- Upload file conversion

### AI APIs
- Get available AI models
- AI generate Mermaid code

For detailed API documentation, refer to:
- [API Documentation](./Mermaid_General_Pic-Services/README_EN.md#api-documentation)

## 🧪 Testing Guide

### Frontend Testing
- Unit Testing (Vitest)
- Component Testing
- E2E Testing (Cypress)
- Performance Testing (Lighthouse)

### Backend Testing
- Unit Testing (Jest)
- Integration Testing
- Performance Testing
- API Testing

For detailed testing guides, refer to:
- [Frontend Testing Guide](./Mermaid_General_Pic-Web/README_EN.md#testing-guide)
- [Backend Testing Guide](./Mermaid_General_Pic-Services/README_EN.md#testing-guide)

## 📦 Deployment Guide

### Building Project
```bash
# Build frontend
cd Mermaid_General_Pic-Web
pnpm build

# Build backend
cd ../Mermaid_General_Pic-Services
pnpm build
```

### Deployment Checklist
- [ ] Environment Variables Configuration
- [ ] Dependencies Installation Complete
- [ ] Build Successful
- [ ] API Configuration Correct
- [ ] Static Resources Optimized
- [ ] Security Configuration
- [ ] Performance Testing
- [ ] Logging Configuration

For detailed deployment guides, refer to:
- [Frontend Deployment Guide](./Mermaid_General_Pic-Web/README_EN.md#deployment-guide)
- [Backend Deployment Guide](./Mermaid_General_Pic-Services/README_EN.md#deployment-guide)

## ❓ FAQ

### Development Related
1. Development environment configuration
2. Dependency installation failure
3. Compilation errors
4. API call failures

### Deployment Related
1. Build failures
2. Environment variable configuration
3. Static resource access
4. Performance optimization

For detailed FAQ, refer to:
- [Frontend FAQ](./Mermaid_General_Pic-Web/README_EN.md#faq)
- [Backend FAQ](./Mermaid_General_Pic-Services/README_EN.md#faq)

## 🤝 Contributing

We welcome all forms of contributions, including but not limited to:
- Submit issues and suggestions
- Improve documentation
- Fix bugs
- Add new features

### Contribution Steps
1. Fork project
2. Create feature branch
3. Submit changes
4. Push to branch
5. Create Pull Request

For detailed contribution guidelines, refer to:
- [Contributing Guidelines](./CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details 