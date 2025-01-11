# Mermaid Chart Generator - Frontend

English | [简体中文](./README.md)

Frontend interface for the Mermaid Chart Generator, built with Vue 3 + TypeScript.

## 📚 Table of Contents

- [Tech Stack](#tech-stack)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Components](#components)
- [State Management](#state-management)
- [API Services](#api-services)
- [Internationalization](#internationalization)
- [Testing Guide](#testing-guide)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [FAQ](#faq)

## 🛠️ Tech Stack

- Vue 3 - Rendering Framework
- TypeScript - Type System
- Element Plus - UI Component Library
- Pinia - State Management
- Vue Router - Routing Management
- Vue I18n - Internationalization
- Vite - Build Tool

## 🚀 Development Environment

```bash
# Install dependencies
pnpm install

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
├── assets/              # Static resources
│   ├── styles/         # Style files
│   └── images/         # Image resources
├── components/         # Reusable components
│   ├── Editor/        # Editor-related components
│   ├── History/       # History-related components
│   └── common/        # Common components
├── views/             # Page components
│   ├── Home.vue      # Main editing page
│   └── History.vue   # History page
├── stores/            # Pinia state management
│   └── mermaid.ts    # Mermaid-related state
├── services/          # API services
│   ├── api.ts        # API call encapsulation
│   └── types.ts      # Type definitions
├── i18n/              # Internationalization
│   ├── index.ts      # i18n configuration
│   └── messages.ts   # Translation files
├── utils/            # Utility functions
│   ├── mermaid.ts   # Mermaid-related utilities
│   └── ai.ts        # AI-related utilities
├── router/           # Route configuration
│   └── index.ts     # Route definitions
├── App.vue          # Root component
└── main.ts         # Entry file
```

## 🧩 Components

### 📝 Editor Component
`Editor.vue` - Mermaid Code Editor
- Monaco Editor Integration
- Syntax Highlighting
- Auto-completion
- Error Indication
- Keyboard Shortcuts

### 👁️ Preview Component
`Preview.vue` - Chart Preview Component
- Real-time Rendering
- Zoom Control
- Export Options
- Theme Switching
- Background Settings

### 📋 History Component
`History.vue` - History Record Component
- List Display
- Preview Functionality
- Code Recovery
- Batch Operations
- Search Filtering

### 🤖 AI-related Components
`AIPrompt.vue` - AI Input Component
- Model Selection
- Prompt Input
- Context Management
- Conversation History
- Error Handling

## 📦 State Management

Using Pinia for state management:

### Mermaid Store
```typescript
interface MermaidState {
  code: string;
  format: 'png' | 'svg' | 'jpg';
  dpi: number;
  theme: string;
  background: string;
  history: HistoryItem[];
  loading: boolean;
  error: Error | null;
}
```

### AI Store
```typescript
interface AIState {
  model: string;
  version: string;
  conversationId: string | null;
  history: ChatMessage[];
  loading: boolean;
}
```

## 🔌 API Services

### api.ts
```typescript
export const api = {
  // Mermaid-related
  getFormats: () => Promise<FormatResponse>,
  convertCode: (params: ConvertParams) => Promise<ConvertResponse>,
  uploadFile: (file: File, params: UploadParams) => Promise<UploadResponse>,
  
  // AI-related
  getModels: () => Promise<ModelResponse>,
  generateCode: (params: GenerateParams) => Promise<GenerateResponse>,
}
```

## 🌍 Internationalization

### Adding New Languages
1. Add translations in `messages.ts`:
```typescript
export const messages = {
  en: {
    editor: { ... },
    preview: { ... },
    history: { ... }
  },
  zh: {
    editor: { ... },
    preview: { ... },
    history: { ... }
  }
}
```

2. Add options to language selector:
```typescript
const languages = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '简体中文' }
]
```

## 🧪 Testing Guide

### Unit Testing
```bash
# Run all tests
pnpm test:unit

# Run specific test file
pnpm test:unit src/components/Editor.spec.ts

# Watch mode
pnpm test:unit:watch

# Generate coverage report
pnpm test:unit:coverage
```

### E2E Testing
```bash
# Open Cypress test interface
pnpm test:e2e

# Run all E2E tests
pnpm test:e2e:ci
```

### Test Examples

#### Component Testing
```typescript
import { mount } from '@vue/test-utils'
import Editor from '@/components/Editor.vue'

describe('Editor.vue', () => {
  it('renders editor with initial value', () => {
    const wrapper = mount(Editor, {
      props: {
        modelValue: 'graph TD;A-->B;'
      }
    })
    expect(wrapper.find('.monaco-editor').exists()).toBe(true)
  })
})
```

#### E2E Testing
```typescript
describe('Mermaid Editor', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should render editor and preview', () => {
    cy.get('.editor-container').should('be.visible')
    cy.get('.preview-container').should('be.visible')
  })
})
```

## 📖 Development Guide

### Code Standards
- ESLint Configuration
- Prettier Formatting
- TypeScript Strict Mode
- Vue 3 Composition API Style

### Git Workflow
- Main Branch: `main`
- Development Branch: `develop`
- Feature Branches: `feature/*`
- Bugfix Branches: `bugfix/*`
- Release Branches: `release/*`

### Commit Convention
```bash
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Testing
- chore: Build

## 📦 Deployment Guide

### Build
```bash
# Build production version
pnpm build
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_AI_API_KEY=your-api-key
```

### Docker Deployment
```bash
# Build image
docker build -t mermaid-frontend .

# Run container
docker run -d -p 80:80 mermaid-frontend
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

## ❓ FAQ

### Development Issues
1. **Editor Loading Failed**
   - Check Monaco Editor Configuration
   - Verify WebWorker Settings
   - Confirm Resource Loading

2. **Preview Not Updating**
   - Check Mermaid Configuration
   - Verify Code Syntax
   - Confirm Theme Settings

3. **AI Generation Failed**
   - Verify API Key
   - Check Network Requests
   - Confirm Model Parameters

### Deployment Issues
1. **Build Failed**
   - Clear Dependency Cache
   - Update Dependencies
   - Check TypeScript Errors

2. **Performance Issues**
   - Check Code Splitting
   - Optimize Resource Loading
   - Enable Caching Strategy

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details
``` 