# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial template setup
- Next.js 14 with App Router
- NestJS backend API
- Turborepo monorepo configuration
- Claude Code integration with MCP servers
- Comprehensive slash commands
- GitHub Actions CI/CD pipeline
- Docker Compose for local development
- TypeScript strict mode configuration
- ESLint and Prettier setup
- Testing setup with Vitest and Jest
- Database setup with Prisma and PostgreSQL
- Authentication with NextAuth.js
- Security best practices
- Performance monitoring setup
- Comprehensive documentation

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Claude-Ready Monorepo Template
- Complete development environment setup
- Production-ready configuration
- Comprehensive documentation and guides

---

## Release Process

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated changelog generation.

To create a new release:

```bash
# Update version and generate changelog
pnpm release

# Push changes and tags
git push --follow-tags origin main
```

## Version History

- **1.0.0**: Initial template release with full Claude Code integration