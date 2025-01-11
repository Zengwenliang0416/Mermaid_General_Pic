# Contributing Guide

## How to Contribute

### Code of Conduct
- Respect all contributors
- Engage in friendly technical discussions
- Accept constructive criticism
- Focus on project's best interests
- Follow community guidelines

### Ways to Contribute
- Submit Issues
- Submit Pull Requests
- Improve Documentation
- Answer Questions
- Participate in Discussions
- Share the Project

## Development Process

### Getting Started
1. Fork the repository
2. Clone locally
```bash
git clone https://github.com/your-username/project-name.git
```
3. Add upstream remote
```bash
git remote add upstream https://github.com/original-owner/project-name.git
```
4. Create development branch
```bash
git checkout -b feature/your-feature
```

### Development Guidelines
- Follow project code standards
- Keep code clean
- Write necessary comments
- Update relevant documentation
- Add necessary tests
- Ensure tests pass

### Commit Guidelines
- Use standardized commit messages
```
<type>(<scope>): <subject>

<body>

<footer>
```
- Type categories:
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation
  - style: Formatting
  - refactor: Code restructure
  - test: Testing
  - chore: Maintenance
- One commit per change
- Keep commit messages clear

### Branch Management
- master: Main branch
- develop: Development branch
- feature/*: Feature branches
- bugfix/*: Bug fix branches
- release/*: Release branches
- hotfix/*: Emergency fix branches

## Pull Request Process

### Pre-submission Checklist
1. Code style check
```bash
pnpm lint
```
2. Run tests
```bash
pnpm test
```
3. Update documentation
4. Resolve conflicts
5. Squash commits
6. Update branch

### Submission Steps
1. Push to remote branch
```bash
git push origin feature/your-feature
```
2. Create Pull Request
3. Fill PR description
4. Wait for CI checks
5. Wait for code review
6. Address feedback

### PR Description Template
```markdown
## Description
Brief description of your changes

## Motivation and Context
Why is this change needed

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests

## Documentation
- [ ] API Documentation Updated
- [ ] Usage Guide Updated
- [ ] Development Guide Updated

## Screenshots (if applicable)
```

## Code Review

### Review Focus
- Code quality
- Test coverage
- Documentation completeness
- Performance impact
- Security concerns
- Backward compatibility

### Feedback Guidelines
- Clear problem statements
- Improvement suggestions
- Risk identification
- Positive reinforcement
- Constructive approach
- Timely responses

### Revision Process
1. Receive feedback
2. Discuss solutions
3. Modify code
4. Submit changes
5. Request re-review
6. Merge code

## Release Process

### Version Guidelines
- Follow Semantic Versioning
  - Major: Incompatible API changes
  - Minor: Backward-compatible features
  - Patch: Backward-compatible fixes

### Release Steps
1. Create release branch
```bash
git checkout -b release/v1.0.0
```
2. Update version number
3. Update changelog
4. Run tests
5. Create release PR
6. Merge to main branch
7. Create tag
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

### Changelog
- Record all significant changes
- Categorize by type
- Note breaking changes
- Credit contributors
- Link related Issues and PRs

## Issue Reporting

### Issue Guidelines
- Use Issue templates
- Provide detailed information
- Clear problem description
- Reproduction steps
- Environment details
- Relevant logs

### Issue Template
```markdown
## Problem Description
Describe the issue you're facing

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
Describe what you expected to happen

## Actual Behavior
Describe what actually happened

## Environment
- OS:
- Browser:
- Version:
- Other relevant info:

## Additional Information
Screenshots or logs
```

### Issue Categories
- bug: Program errors
- feature: Feature requests
- docs: Documentation related
- question: Usage questions
- enhancement: Improvement suggestions

## Community Participation

### Communication Channels
- GitHub Discussions
- Issue discussions
- Mailing lists
- Community meetings
- Technical blogs
- Social media

### Contribution Recognition
- Contributors list
- Version acknowledgments
- Community roles
- Technical sharing
- Project showcases

### Community Governance
- Decision process
- Role definitions
- Promotion mechanism
- Dispute resolution
- Code of conduct

## Language Switch

- [English Version](./contributing.md)
- [中文版本](../../zh/development/contributing.md) 