# Contributing to Claude-Ready Monorepo Template

Thank you for considering contributing to this template! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

### 1. Report Issues
- Use the issue templates provided
- Search existing issues before creating new ones
- Include reproduction steps for bugs
- Provide clear use cases for feature requests

### 2. Improve Documentation
- Fix typos or unclear instructions
- Add missing examples or clarifications
- Update outdated information
- Improve setup guides

### 3. Enhance Examples
- Add new example implementations
- Improve existing example code
- Add more comprehensive test cases
- Enhance configuration examples

### 4. Submit Code Improvements
- Fix bugs in template code
- Add new features that benefit all users
- Improve performance or security
- Update dependencies

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 LTS or 20 LTS
- pnpm 8.x
- Git

### Getting Started
```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/claude-ready-monorepo-template.git
cd claude-ready-monorepo-template

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the template
pnpm build
```

### Testing Your Changes
```bash
# Test the template by creating a new project
cd ../
git clone --template ./claude-ready-monorepo-template test-project
cd test-project
./scripts/postclone.sh
pnpm install
pnpm dev
```

## 📝 Coding Guidelines

### Code Style
- Follow the existing TypeScript and ESLint configurations
- Use conventional commit messages
- Write tests for new functionality
- Update documentation for changes

### Commit Messages
Follow the conventional commit format:
```
type(scope): description

Examples:
feat: add health check endpoints
fix: resolve database connection issue
docs: update setup instructions
chore: update dependencies
```

### File Structure
- Keep examples in `examples/` directory
- Put documentation in `docs/` directory  
- Scripts go in `scripts/` directory
- Configuration files in project root

## 🔍 Code Review Process

### Pull Request Guidelines
1. **Create focused PRs** - One feature/fix per PR
2. **Write clear descriptions** - Explain what and why
3. **Update documentation** - Include relevant docs updates
4. **Add tests** - Cover new functionality
5. **Follow templates** - Use the PR template provided

### Review Criteria
- Code quality and style consistency
- Documentation completeness
- Test coverage
- Backward compatibility
- Security considerations

## 🧪 Testing Standards

### Required Tests
- Unit tests for utilities and functions
- Integration tests for complex workflows
- Example code should be runnable
- Documentation should be accurate

### Test Commands
```bash
pnpm test          # Run all tests
pnpm test:unit     # Unit tests only
pnpm test:integration  # Integration tests
pnpm lint          # Code linting
pnpm typecheck     # TypeScript checking
```

## 📚 Documentation Standards

### Documentation Requirements
- Clear, concise writing
- Working code examples
- Up-to-date instructions
- Proper markdown formatting

### Example Structure
```markdown
# Feature Name

## Overview
Brief description of the feature

## Setup
Step-by-step setup instructions

## Usage
Code examples with explanations

## Configuration
Available options and defaults
```

## 🏷️ Issue Labels

### Bug Reports
- `bug` - Something isn't working
- `critical` - Blocking issue
- `needs-reproduction` - Cannot reproduce

### Enhancements
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `performance` - Performance improvements

### Process
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention needed
- `question` - Further information requested

## 📋 Release Process

### Version Management
- Follow semantic versioning (semver)
- Update CHANGELOG.md for releases
- Tag releases appropriately

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Tag created
- [ ] Release notes written

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

### Communication
- Use clear, professional language
- Ask questions when unsure
- Provide context in discussions
- Be patient with response times

## ❓ Getting Help

### Resources
- Check existing documentation
- Search through issues
- Look at example implementations
- Review ADRs in `docs/adr/`

### Where to Ask
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Request Comments** - Code-specific questions

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing! Your help makes this template better for everyone. 🚀