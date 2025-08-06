# Generate Report Command

## Overview
Generate comprehensive project status reports including health metrics, performance data, and actionable insights.

## Usage
```bash
claude /generate-report [type]
```

## Report Types

### 1. Health Report (default)
Comprehensive project health assessment including:
- Build status and test coverage
- Dependency health and security
- Code quality metrics
- Performance benchmarks

### 2. Performance Report
Detailed performance analysis:
- Bundle size analysis
- API response times
- Database query performance
- User experience metrics

### 3. Security Report
Security assessment including:
- Dependency vulnerabilities
- Code security analysis
- Environment configuration
- Access control review

### 4. Technical Debt Report
Technical debt analysis:
- Code complexity metrics
- Deprecated dependencies
- Test coverage gaps
- Documentation status

## Report Generation Process

### Step 1: Data Collection
```bash
# Build and test status
pnpm build
pnpm test --coverage

# Dependency analysis
pnpm audit
pnpm outdated

# Performance metrics
pnpm build --analyze
npx lighthouse https://localhost:3000

# Git analysis
git log --oneline --since="1 week ago"
git status --porcelain
```

### Step 2: Analysis
1. **Build Analysis**
   - Compilation success/failure
   - TypeScript errors
   - Bundle size trends
   - Build time metrics

2. **Test Analysis**
   - Test coverage percentage
   - Failed tests
   - Test execution time
   - Missing test coverage

3. **Dependency Analysis**
   - Outdated packages
   - Security vulnerabilities
   - Unused dependencies
   - License compliance

4. **Code Quality Analysis**
   - ESLint errors/warnings
   - Prettier formatting issues
   - TypeScript strict mode compliance
   - Code complexity metrics

### Step 3: Report Generation

#### Health Report Template
```markdown
# Project Health Report
**Generated**: [Date]
**Project**: [Project Name]
**Branch**: [Current Branch]

## 🟢 Overall Status: [Healthy/Warning/Critical]

### Build Status
- ✅ Build successful
- ✅ TypeScript compilation: 0 errors
- ⚠️ Bundle size: 245KB (target: <250KB)

### Test Coverage
- ✅ Coverage: 87% (target: >80%)
- ⚠️ Missing coverage: utils/helpers.ts
- ✅ All tests passing: 156/156

### Dependencies
- ⚠️ 3 outdated packages
- ✅ No security vulnerabilities
- ✅ All licenses compliant

### Code Quality
- ✅ ESLint: 0 errors, 2 warnings
- ✅ Prettier: All files formatted
- ✅ TypeScript: Strict mode enabled

## 📊 Metrics Summary
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Test Coverage | 87% | >80% | ✅ |
| Bundle Size | 245KB | <250KB | ⚠️ |
| Build Time | 45s | <60s | ✅ |
| Dependencies | 156 | - | ✅ |

## 🎯 Recommendations
1. **High Priority**: Update outdated packages
2. **Medium Priority**: Add tests for utils/helpers.ts
3. **Low Priority**: Optimize bundle size

## 📈 Trends
- Test coverage improved by 5% this week
- Bundle size increased by 12KB due to new features
- Build time stable at 45s average
```

#### Performance Report Template
```markdown
# Performance Report
**Generated**: [Date]
**Environment**: [Development/Staging/Production]

## 🚀 Core Web Vitals
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| FCP | 1.2s | <1.5s | ✅ |
| LCP | 2.1s | <2.5s | ✅ |
| FID | 85ms | <100ms | ✅ |
| CLS | 0.08 | <0.1 | ✅ |

## 📦 Bundle Analysis
- **Total Size**: 245KB (gzipped)
- **JavaScript**: 180KB
- **CSS**: 45KB
- **Images**: 20KB

### Largest Dependencies
1. `react-dom`: 45KB
2. `lodash`: 25KB
3. `date-fns`: 15KB

## 🗄️ API Performance
| Endpoint | Avg Response | P95 | Status |
|----------|-------------|-----|--------|
| /api/users | 120ms | 180ms | ✅ |
| /api/posts | 95ms | 150ms | ✅ |
| /api/search | 250ms | 400ms | ⚠️ |

## 🎯 Optimization Opportunities
1. **Bundle Splitting**: Split vendor and app bundles
2. **Image Optimization**: Convert PNG to WebP
3. **API Caching**: Add Redis caching for /api/search
```

## Implementation Commands

### Health Check Commands
```bash
# Build and test
pnpm build
pnpm test --coverage

# Dependency check
pnpm audit
pnpm outdated

# Code quality
pnpm lint
pnpm typecheck

# Git status
git status --porcelain
git log --oneline --since="1 week ago"
```

### Performance Commands
```bash
# Bundle analysis
pnpm build --analyze

# Lighthouse audit
npx lighthouse https://localhost:3000 --output=json

# API testing
npx autocannon -c 10 -d 30 http://localhost:3001/api/users

# Database analysis
npx prisma studio
```

### Security Commands
```bash
# Security audit
pnpm audit
npm audit fix

# Dependency analysis
npx depcheck
npx license-checker

# Environment check
echo $NODE_ENV
echo $DATABASE_URL
```

## Report Output Formats

### 1. Markdown (Default)
- Human-readable format
- GitHub-compatible
- Easy to share and review

### 2. JSON
- Machine-readable
- API integration
- Automated processing

### 3. HTML
- Rich formatting
- Interactive charts
- Email-friendly

### 4. CSV
- Spreadsheet import
- Data analysis
- Trend tracking

## Automation Integration

### GitHub Actions
```yaml
name: Generate Report
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: claude /generate-report health
      - uses: actions/upload-artifact@v3
        with:
          name: health-report
          path: reports/
```

### Slack Integration
```bash
# Send report to Slack
claude /generate-report health | curl -X POST \
  -H 'Content-type: application/json' \
  --data '{"text":"'"$(cat report.md)"'"}' \
  $SLACK_WEBHOOK_URL
```

## Success Criteria
- [ ] Report generated successfully
- [ ] All metrics collected accurately
- [ ] Recommendations are actionable
- [ ] Report is well-formatted
- [ ] Historical data included (if available)

## Notes
- Reports should be reproducible
- Include context and explanations
- Focus on actionable insights
- Track trends over time
- Store reports for historical analysis