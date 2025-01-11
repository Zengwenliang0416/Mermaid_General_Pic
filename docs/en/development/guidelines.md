# Development Guidelines

## General Guidelines

### Basic Principles
- Use English for code and documentation
- Follow DRY (Don't Repeat Yourself) principle
- Follow KISS (Keep It Simple, Stupid) principle
- Follow YAGNI (You Aren't Gonna Need It) principle
- Self-test before code submission

### Naming Conventions
- Use meaningful English names, avoid pinyin and Chinese
- Avoid abbreviations (except for conventional ones)
- Use PascalCase for class names
- Use camelCase for variables and functions
- Use UPPERCASE with underscores for constants
- Use kebab-case for file names
- Use PascalCase for component names

### Comment Guidelines
- Use JSDoc standard for comments
- Public interfaces must be documented
- Complex business logic needs explanation
- Special handling needs reason explanation
- Temporary code needs future plan notes
- Comments should be concise and clear

## Frontend Development Guidelines

### Vue Component Guidelines
- Component files end with .vue
- Use PascalCase for component names
- Structure: template/script/style order
- Sort component properties alphabetically
- Use Composition API
- Extract reusable composables
- Components should have single responsibility

### TypeScript Guidelines
- Explicitly declare types, avoid any
- Use interface for object types
- Use type for union and intersection types
- Use enum for enumeration types
- Use generics appropriately for code reuse
- Export type definitions to types directory

### Style Guidelines
- Use SCSS preprocessor
- Follow BEM naming convention
- Avoid deep nesting (max 3 levels)
- Use variables for theme colors
- Use relative units for responsive layout
- Add comments for critical styles

### State Management Guidelines
- Split stores by feature modules
- Define store types with TypeScript
- Use actions for async operations
- Use mutations for sync operations
- Use getters for derived state
- Avoid overusing global state

## Backend Development Guidelines

### Code Organization
- Follow MVC architecture pattern
- Organize code by feature modules
- Separate business logic and data access
- Use dependency injection for services
- Extract common code to utilities
- Maintain clear code structure

### API Design Guidelines
- Follow RESTful design principles
- Use semantic HTTP methods
- Use plural nouns for URLs
- Include version in URL
- Return consistent response format
- Use HTTP status codes appropriately

### Error Handling Guidelines
- Use global error handling middleware
- Define unified error types
- Distinguish business and system errors
- Log detailed error information
- Return friendly error messages
- Provide error tracking information

### Database Guidelines
- Use migrations for schema management
- Use underscore naming for fields
- Add comments for necessary fields
- Design indexes for performance
- Store large fields in separate tables
- Log critical operations

## Testing Guidelines

### Unit Testing
- Use Jest as testing framework
- Follow AAA (Arrange-Act-Assert) pattern
- Test one functionality per case
- Use mocks to isolate dependencies
- Achieve 80% test coverage
- Keep test code clean

### Integration Testing
- Test critical business flows
- Test external service integration
- Test database operations
- Test concurrent scenarios
- Test error cases
- Test performance metrics

### E2E Testing
- Use Cypress for E2E testing
- Test core functionality flows
- Test user interaction scenarios
- Test browser compatibility
- Test responsive layouts
- Test performance experience

## Version Control Guidelines

### Git Usage Guidelines
- Follow Git Flow workflow
- Clear branch naming conventions
- Meaningful commit messages
- Handle conflicts promptly
- Sync with main branch regularly
- Maintain appropriate commit granularity

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```
- type: feat/fix/docs/style/refactor/test/chore
- scope: area of change
- subject: brief description
- body: detailed description
- footer: breaking changes/closes issues

### Branch Management
- master: main branch, stable version
- develop: development branch
- feature/*: feature branches
- bugfix/*: bug fix branches
- release/*: release branches
- hotfix/*: emergency fix branches

## Documentation Guidelines

### Documentation Requirements
- README.md project description
- CHANGELOG.md version history
- API documentation and examples
- Architecture design documents
- Deployment documentation
- Usage documentation

### Documentation Content
- Clear document structure
- Highlight important information
- Complete example code
- Clear and simple diagrams
- Detailed step instructions
- Regular updates and maintenance

## Security Guidelines

### Development Security
- Follow secure development lifecycle
- Update dependencies regularly
- Code security review
- Vulnerability scanning
- Penetration testing
- Emergency response plan

### Data Security
- Encrypt sensitive data storage
- Encrypt data transmission
- Access control
- Data backup strategy
- Log security management
- Data destruction process

## Language Switch

- [English Version](./guidelines.md)
- [中文版本](../../zh/development/guidelines.md) 