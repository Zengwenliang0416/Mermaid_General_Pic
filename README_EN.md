# Mermaid Chart Generator

English | [简体中文](./README.md)

Mermaid Chart Generator is a powerful web application designed to simplify the chart creation process. By integrating advanced AI technology with a user-friendly interface, it helps users quickly create various professional diagrams, including flowcharts, sequence diagrams, class diagrams, state diagrams, and more.

![logo](./imgs/logo.png)

## 📚 Documentation

For detailed documentation, please visit our [Documentation Center](./docs/en/README.md):

- [Quick Start](./docs/en/guides/getting-started.md)
- [Features Overview](./docs/en/guides/features.md)
- [API Documentation](./docs/en/api/backend.md)
- [Development Guide](./docs/en/development/architecture.md)
- [Deployment Guide](./docs/en/deployment/installation.md)
- [Troubleshooting](./docs/en/guides/troubleshooting.md)

## ✨ Features

### 🤖 AI-Assisted Generation
- Support for multiple AI models (Kimi, DeepSeek)
- Generate Mermaid code from natural language descriptions
- Maintain conversation context for continuous optimization
- Choose from different model versions

### 📊 Chart Editing
- Real-time preview of Mermaid diagrams
- Multiple theme support (default, dark, forest, neutral)
- Adjustable background color (transparent, white)
- Multiple export formats (PNG, SVG, JPG)
- Customizable DPI resolution

### 📝 Conversion History
- Automatic saving of all conversion records
- View historical charts
- Reload historical code
- Clear history option

### 🎨 Interface Features
- Responsive design with mobile support
- English/Chinese language switching
- Dark/Light theme switching
- Intuitive navigation bar

## 🚀 Quick Start

### Requirements
- Node.js >= 16
- npm >= 8 or pnpm >= 8

### Installation Steps

1. Clone the repository:
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

For more detailed information, please refer to the [complete documentation](./docs/en/README.md).

## 🤝 Contributing

We welcome all forms of contributions, including but not limited to:
- Submitting issues and suggestions
- Improving documentation
- Fixing bugs
- Adding new features

For detailed information, please refer to the [Contributing Guide](./docs/en/development/contributing.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details. 