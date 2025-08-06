# Claude Code Project Context

## 🎯 Project Overview
This is a production-ready monorepo template optimized for Claude Code with modern frontend/backend stack, MCP integration, and agentic development workflows.

## 🚀 Commands & Scripts

### Core Development
```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm test             # Run all tests across the monorepo
pnpm lint             # Lint all packages with ESLint
pnpm typecheck        # Type check all TypeScript files
pnpm clean            # Clean all build artifacts
```

### Filtered Commands
```bash
pnpm test --filter apps/web          # Test only web app
pnpm build --filter packages/ui      # Build only UI package
pnpm lint --filter apps/api          # Lint only API app
pnpm dev --filter apps/web           # Dev only web app
```

### Database & DevOps
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services
```

## 🎨 Code Style & Standards

### TypeScript
- **Mode**: Strict TypeScript configuration
- **Modules**: ES modules (ESM) only
- **Target**: ES2022 for modern Node.js compatibility
- **Linting**: Airbnb TypeScript config with strict rules

### React/Next.js
- **Framework**: Next.js 14 with App Router
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: TanStack Query for server state, Zustand for client state

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod schemas for runtime type safety
- **Testing**: Jest + Supertest for API testing

## 🔧 Development Workflow

### TDD Approach
1. **Write failing test first** - Always start with a test that describes the desired behavior
2. **Implement minimal code** - Write just enough code to make the test pass
3. **Refactor** - Clean up the code while keeping tests green
4. **Repeat** - Continue the cycle for new features

### Git Workflow
1. **Branch naming**: `feature/description`, `fix/description`, `chore/description`
2. **Commits**: Use conventional commits with commitizen
3. **PRs**: Require passing CI and code review
4. **Merging**: Squash and merge to main

### Pre-commit Hooks
- **Lint-staged**: Run ESLint and Prettier on staged files
- **Husky**: Execute `turbo lint test typecheck` before commits
- **Type checking**: Ensure all TypeScript compiles correctly

## 🛠️ Tool Integration

### MCP Servers
- **GitHub**: Issue management and PR automation
- **Sentry**: Error tracking and performance monitoring
- **Figma**: Design system integration

### Claude Commands
- `/fix-github-issue #123` - Automated issue resolution workflow
- `/optimize <file>` - Performance optimization suggestions
- `/generate-report` - Generate project status reports

## 📁 Project Structure

### Apps
```
apps/
├─ web/              # Next.js frontend application
│  ├─ app/           # App Router pages
│  ├─ components/    # React components
│  ├─ lib/           # Utility functions
│  └─ types/         # TypeScript type definitions
└─ api/              # NestJS backend API
    ├─ src/
    │  ├─ modules/   # Feature modules
    │  ├─ common/    # Shared utilities
    │  └─ config/    # Configuration files
    └─ prisma/       # Database schema and migrations
```

### Packages
```
packages/
├─ ui/               # Shared UI components (shadcn/ui)
├─ config/           # Shared configuration (ESLint, TypeScript)
├─ types/            # Shared TypeScript types
└─ utils/            # Shared utility functions
```

## 🔐 Environment & Secrets

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/claude_template

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# External Services
GITHUB_TOKEN=ghp_xxx
SENTRY_AUTH_TOKEN=xxx
FIGMA_ACCESS_TOKEN=xxx

# Application
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Local Development
- Use `.env.local` for local environment variables
- Use `direnv` for automatic environment loading
- Never commit secrets to version control

## 🚀 Deployment Strategy

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

### Test Organization
```
__tests__/
├─ unit/             # Unit tests
├─ integration/      # Integration tests
├─ e2e/              # End-to-end tests
└─ fixtures/         # Test data and mocks
```

## 🔍 Performance & Optimization

### Frontend
- **Bundle Analysis**: Use `@next/bundle-analyzer`
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Static generation and ISR

### Backend
- **Database**: Query optimization with Prisma
- **Caching**: Redis for session and data caching
- **Compression**: Gzip compression middleware
- **Monitoring**: Performance metrics with Sentry

## 🛡️ Security Best Practices

### Authentication
- **Provider**: NextAuth.js or Clerk
- **Sessions**: Secure session management
- **OAuth**: GitHub, Google, or custom providers

### Data Protection
- **Validation**: Zod schemas for all inputs
- **Sanitization**: XSS protection with DOMPurify
- **CORS**: Proper CORS configuration
- **Rate Limiting**: API rate limiting middleware

### Secrets Management
- **Environment**: Use environment variables
- **CI/CD**: Secure secret injection
- **Rotation**: Regular secret rotation

## 📊 Monitoring & Observability

### Error Tracking
- **Sentry**: Error monitoring and performance tracking
- **Logging**: Structured logging with Winston
- **Alerts**: Automated alerting for critical errors

### Performance Monitoring
- **Metrics**: Core Web Vitals tracking
- **APM**: Application performance monitoring
- **Uptime**: Service availability monitoring

## 🔄 Maintenance & Updates

### Dependencies
- **Updates**: Regular dependency updates with Dependabot
- **Security**: Automated security vulnerability scanning
- **Compatibility**: Test compatibility before major updates

### Database
- **Migrations**: Version-controlled schema changes
- **Backups**: Automated database backups
- **Monitoring**: Database performance monitoring

## 🎯 Common Workflows

### Adding a New Feature
1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Add documentation
5. Create PR with description
6. Address review feedback
7. Merge after approval

### Bug Fixes
1. Create issue or identify existing one
2. Create fix branch
3. Write regression test
4. Implement fix
5. Verify fix works
6. Update documentation if needed
7. Create PR with fix description

### Performance Optimization
1. Identify bottleneck (profiling)
2. Write performance test
3. Implement optimization
4. Measure improvement
5. Document changes
6. Deploy with monitoring

## 🚨 Troubleshooting

### Common Issues
- **Build failures**: Check TypeScript errors and missing dependencies
- **Test failures**: Ensure database is running and seeded
- **Lint errors**: Run `pnpm lint:fix` to auto-fix issues
- **Type errors**: Run `pnpm typecheck` to identify issues

### Debug Commands
```bash
pnpm debug:web        # Debug web app with detailed logging
pnpm debug:api        # Debug API with detailed logging
pnpm logs             # View application logs
pnpm db:studio        # Open Prisma Studio for database inspection
```

## 📚 Resources & References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Claude Code Resources
- [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Settings Guide](https://docs.anthropic.com/en/docs/claude-code/settings)
- [MCP Integration](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Slash Commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands)

Remember: This template is designed for rapid iteration and agentic development. Use Claude's capabilities to automate repetitive tasks and focus on creative problem-solving!