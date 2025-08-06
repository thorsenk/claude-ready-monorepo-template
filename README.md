# Claude-Ready Monorepo Template

[![CI](https://github.com/your-username/claude-ready-monorepo-template/workflows/CI/badge.svg)](https://github.com/your-username/claude-ready-monorepo-template/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange.svg)](https://pnpm.io/)

A production-ready monorepo template optimized for Claude Code with modern frontend/backend stack, MCP integration, and agentic development workflows.

## 🚀 Getting Started in 60s

### Prerequisites
```bash
# Install pnpm globally
npm i -g pnpm

# Ensure you have Node 18 LTS (>=18.17.0) or Node 20 LTS (>=20.9.0) and Docker installed
node --version
docker --version
```

### Quick Start
```bash
# 1. Clone and setup
git clone --template <url> my-new-service
cd my-new-service
./scripts/postclone.sh

# 2. Install dependencies
pnpm install

# 3. Start development
pnpm dev

# 4. Open in browser
open http://localhost:3000       # web app
open http://localhost:3001/docs  # api docs
```

### Claude Code Setup
```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Initialize Claude
claude init

# Add MCP servers
claude mcp add --mcp-config .mcp.json
```

## 📁 Project Structure

```
my-template/
├─ apps/
│  ├─ web/          # Next.js 14 (App Router, TypeScript)
│  └─ api/          # NestJS or tRPC server
├─ packages/        # Shared UI, config, types
├─ .claude/
│  ├─ commands/
│  └─ settings.json
├─ .mcp.json
├─ CLAUDE.md
├─ env.example
└─ [other config files]
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui component kit
- **State**: TanStack Query / Zustand
- **Testing**: Vitest + Testing Library; Playwright for e2e
- **Linting**: eslint-plugin-tailwindcss + strict TypeScript

### Backend
- **Server**: NestJS (or Express + tRPC)
- **Database**: Prisma with PostgreSQL
- **Auth**: Clerk or Auth.js
- **Tests**: Jest + Supertest
- **DevOps**: Docker Compose for DBs; GitHub Actions CI

## 🎯 Claude Integration

This template is optimized for Claude Code with:

- **MCP Servers**: GitHub, Sentry, Figma integration
- **Slash Commands**: Pre-built commands for common workflows
- **Project Context**: Comprehensive CLAUDE.md with project-specific guidance
- **Tool Permissions**: Configured settings for safe automation

### MCP Configuration

The template includes a `.mcp.json` file with pre-configured servers:

```jsonc
{
  "mcpServers": {
    "github": {
      "type": "sse",
      "url": "https://mcp.github.com/sse",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/sse"
    }
  }
}
```

Connect to MCP servers with:
```bash
claude dev --mcp-config .mcp.json
```

### Available Commands

Custom slash commands live in `/.claude/commands/*.md`:

```bash
# Fix GitHub issues
claude /fix-github-issue #123

# Optimize performance
claude /optimize src/components/MyComponent.tsx

# Generate reports
claude /generate-report
```

## 🔧 Development Workflow

1. **Conventional commits** via **commitizen** → auto-changelog
2. **Lint-staged** + Husky pre-commit to run `turbo lint test typecheck`
3. **GitHub Actions**: matrix job (`pnpm install`, `turbo build test lint`) and deploy step
4. **VS Code** workspace settings: enable `eslint.format.enable`, configure `tailwindCSS.experimental.classRegex`

## 📦 Available Scripts

```bash
# Core development
pnpm dev        # ↪ apps/web + apps/api live-reload
pnpm build      # ↪ all packages via turbo
pnpm test       # ↪ vitest + jest matrix

# Lint / Type safety
pnpm lint       # ESLint + Prettier
pnpm typecheck  # TypeScript strict mode

# Database & DevOps
pnpm db:migrate # Run Prisma migrations
pnpm docker:up  # Start PostgreSQL + Redis
```

### Filtered Commands
```bash
pnpm test --filter apps/web          # Test only web app
pnpm build --filter packages/ui      # Build only UI package
pnpm lint --filter apps/api          # Lint only API app
```

## 🔐 Environment & Secrets

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/claude_template"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# External Services (Public)
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# External Services (Secret)
GITHUB_TOKEN="ghp_your-github-personal-access-token"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
FIGMA_ACCESS_TOKEN="your-figma-access-token"
```

### Security Best Practices

- **GitHub Actions**: Use encrypted secrets for sensitive values
- **Authentication**: SameSite=strict cookies, rotating JWT signing keys
- **CI/CD**: Dependabot security-update workflow enabled
- **Environment**: Never commit `.env.local` (git-ignored)

## 🚀 Deployment

### Frontend (Next.js)
- **Platform**: Vercel with automatic deployments
- **Preview**: PR deployments with preview URLs
- **Environment**: Staging and production environments

### Backend (NestJS)
- **Platform**: Docker containers on cloud platform
- **Database**: Managed PostgreSQL (Supabase, Railway)
- **Monitoring**: Sentry for error tracking

### CI/CD Pipeline
1. **Build**: Matrix build for all packages
2. **Test**: Run all tests in parallel
3. **Lint**: ESLint and Prettier checks
4. **Deploy**: Automatic deployment on main branch

## 🧪 Testing Strategy

### Unit Tests
- **Framework**: Vitest for frontend, Jest for backend
- **Coverage**: Minimum 80% code coverage
- **Pattern**: Arrange-Act-Assert (AAA)

### Integration Tests
- **API**: Supertest for endpoint testing
- **Database**: Test database with migrations
- **E2E**: Playwright for full user journeys

## 🔒 Security Features

### Authentication
- **Provider**: NextAuth.js or Clerk
- **Sessions**: Secure session management
- **OAuth**: GitHub, Google, or custom providers

### Data Protection
- **Validation**: Zod schemas for all inputs
- **Sanitization**: XSS protection with DOMPurify
- **CORS**: Proper CORS configuration
- **Rate Limiting**: API rate limiting middleware

## 📊 Monitoring & Observability

### Error Tracking
- **Sentry**: Error monitoring and performance tracking
- **Logging**: Structured logging with Winston
- **Alerts**: Automated alerting for critical errors

### Performance Monitoring
- **Metrics**: Core Web Vitals tracking
- **APM**: Application performance monitoring
- **Uptime**: Service availability monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `pnpm turbo lint test typecheck`
5. Commit with conventional commit message (`pnpm commit`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Use TypeScript strict mode
- Follow ESLint Airbnb configuration
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📚 Documentation

### Code Documentation
- Write clear comments for complex logic
- Use JSDoc for functions
- Document component props
- Maintain README files

### Project Documentation
- Keep project READMEs updated
- Document setup instructions
- Maintain changelogs
- Document architecture decisions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/claude-ready-monorepo-template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/claude-ready-monorepo-template/discussions)
- **Documentation**: [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

## 🗺️ Roadmap

- [ ] Add more MCP server integrations
- [ ] Expand slash command library
- [ ] Add more UI component examples
- [ ] Improve performance monitoring
- [ ] Add more deployment options

---

**Remember**: This template is designed for rapid iteration and agentic development. Use Claude's capabilities to automate repetitive tasks and focus on creative problem-solving!