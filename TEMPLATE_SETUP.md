# Template Setup Guide

This guide will help you set up and use the Claude-Ready Monorepo Template.

## 🚀 Quick Start

### 1. Create Repository from Template

```bash
# Using GitHub CLI
gh repo create my-new-project --template your-username/claude-ready-monorepo-template

# Or clone and setup manually
git clone https://github.com/your-username/claude-ready-monorepo-template.git my-new-project
cd my-new-project
./scripts/postclone.sh
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp env.example .env.local

# Edit with your values
nano .env.local
```

### 4. Start Development

```bash
# Start database services
pnpm docker:up

# Start development servers
pnpm dev
```

## 📁 Project Structure

```
my-new-project/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Shared utilities
│   └── config/           # Shared configuration
├── .claude/              # Claude Code configuration
├── .github/              # GitHub Actions workflows
├── scripts/              # Setup and utility scripts
└── docs/                 # Documentation
```

## 🔧 Configuration

### Environment Variables

Required environment variables in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/claude_template"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# External Services
GITHUB_TOKEN="your-github-token"
SENTRY_AUTH_TOKEN="your-sentry-token"
FIGMA_ACCESS_TOKEN="your-figma-token"
```

### Claude Code Setup

1. **Install Claude Code CLI**:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Initialize Claude**:
   ```bash
   claude init
   ```

3. **Add MCP Servers**:
   ```bash
   claude mcp add --mcp-config .mcp.json
   ```

## 🛠️ Available Scripts

### Development
```bash
pnpm dev              # Start all apps in development
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm typecheck        # Type check all TypeScript
```

### Database
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

### Docker
```bash
pnpm docker:up        # Start database services
pnpm docker:down      # Stop database services
pnpm docker:logs      # View service logs
```

### Git Workflow
```bash
pnpm commit           # Interactive commit with commitizen
pnpm release          # Create new release with standard-version
```

## 🎯 Claude Integration

### Available Commands

```bash
# Fix GitHub issues
claude /fix-github-issue #123

# Optimize performance
claude /optimize src/components/MyComponent.tsx

# Generate reports
claude /generate-report health
```

### MCP Servers

The template includes MCP servers for:
- **GitHub**: Issue management and PR automation
- **Sentry**: Error tracking and performance monitoring
- **Figma**: Design system integration

### Project Context

The `CLAUDE.md` file provides comprehensive context including:
- Project structure and conventions
- Available commands and scripts
- Development workflows
- Code style guidelines
- Testing strategies

## 🧪 Testing

### Frontend Testing
```bash
# Unit tests
pnpm test --filter @claude-template/web

# E2E tests
pnpm test:e2e --filter @claude-template/web

# Coverage
pnpm test:coverage --filter @claude-template/web
```

### Backend Testing
```bash
# Unit tests
pnpm test --filter @claude-template/api

# E2E tests
pnpm test:e2e --filter @claude-template/api

# Coverage
pnpm test:cov --filter @claude-template/api
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Docker)
1. Build Docker image
2. Deploy to your preferred cloud platform
3. Set production environment variables

### Database
- Use managed PostgreSQL (Supabase, Railway, etc.)
- Set up automated backups
- Configure connection pooling

## 📊 Monitoring

### Error Tracking
- Sentry integration for error monitoring
- Performance tracking and alerting
- User session replay

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance

## 🔒 Security

### Authentication
- NextAuth.js for session management
- JWT tokens for API authentication
- OAuth providers (GitHub, Google, etc.)

### Data Protection
- Input validation with Zod
- XSS protection
- CORS configuration
- Rate limiting

## 📚 Documentation

### Code Documentation
- JSDoc comments for functions
- README files for each package
- API documentation with Swagger

### Project Documentation
- Architecture decisions
- Setup guides
- Troubleshooting guides

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Add documentation
5. Create PR
6. Address review feedback
7. Merge after approval

### Code Standards
- TypeScript strict mode
- ESLint with Airbnb config
- Prettier formatting
- Conventional commits

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

**Database Connection Issues**
```bash
# Check Docker services
pnpm docker:logs

# Reset database
pnpm docker:down
pnpm docker:up
pnpm db:migrate
```

**TypeScript Errors**
```bash
# Check for type errors
pnpm typecheck

# Regenerate types
pnpm db:generate
```

### Getting Help

1. Check the `CLAUDE.md` file for project-specific guidance
2. Review the troubleshooting section
3. Check GitHub Issues for known problems
4. Create a new issue with detailed information

## 🎉 Next Steps

After setup, you can:

1. **Customize the UI**: Modify components in `packages/ui/`
2. **Add API endpoints**: Create new controllers in `apps/api/src/`
3. **Add pages**: Create new routes in `apps/web/app/`
4. **Set up authentication**: Configure NextAuth.js providers
5. **Add database models**: Extend the Prisma schema
6. **Deploy**: Set up CI/CD pipelines

Happy coding with Claude! 🤖