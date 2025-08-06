# Optimize Command

## Overview
Performance optimization command that analyzes a file and surfaces three specific performance improvements.

## Usage
```bash
claude /optimize <file-path>
```

## Analysis Process

### Step 1: File Analysis
1. Read and parse the target file
2. Identify file type (React component, API endpoint, utility function, etc.)
3. Analyze current performance characteristics
4. Identify potential bottlenecks and optimization opportunities

### Step 2: Performance Audit
1. **Bundle Size Analysis**
   - Check for unused imports
   - Identify large dependencies
   - Look for code splitting opportunities
   - Analyze tree-shaking potential

2. **Runtime Performance**
   - Identify expensive operations
   - Check for unnecessary re-renders
   - Look for memory leaks
   - Analyze algorithm complexity

3. **Network Performance**
   - Check API call optimization
   - Look for caching opportunities
   - Analyze data fetching patterns
   - Check for lazy loading opportunities

### Step 3: Generate Three Wins

#### Win #1: Quick Win (Low Effort, High Impact)
- **Focus**: Easy fixes with immediate impact
- **Examples**:
  - Remove unused imports
  - Add React.memo for expensive components
  - Implement basic caching
  - Fix obvious performance anti-patterns

#### Win #2: Medium Win (Moderate Effort, High Impact)
- **Focus**: Structural improvements
- **Examples**:
  - Implement proper memoization
  - Add code splitting
  - Optimize database queries
  - Implement proper error boundaries

#### Win #3: Strategic Win (High Effort, Maximum Impact)
- **Focus**: Architectural improvements
- **Examples**:
  - Refactor to use virtual scrolling
  - Implement advanced caching strategies
  - Add performance monitoring
  - Optimize bundle splitting

## Implementation Template

### For React Components
```typescript
// Before: Performance issues
import { useState, useEffect } from 'react'
import { heavyLibrary } from 'large-package'

export function ExpensiveComponent({ data }) {
  const [processed, setProcessed] = useState([])

  useEffect(() => {
    // Expensive operation on every render
    const result = heavyLibrary.process(data)
    setProcessed(result)
  }, [data])

  return <div>{/* render expensive data */}</div>
}

// After: Optimized version
import { useState, useEffect, useMemo, useCallback } from 'react'
import { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  // Memoize expensive calculations
  const processed = useMemo(() => {
    return data.map(item => ({
      id: item.id,
      name: item.name
    }))
  }, [data])

  // Memoize callbacks
  const handleClick = useCallback((id) => {
    // Handle click
  }, [])

  return <div>{/* render optimized data */}</div>
})
```

### For API Endpoints
```typescript
// Before: Performance issues
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany()
  const processed = users.map(user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }))
  res.json(processed)
})

// After: Optimized version
app.get('/api/users', async (req, res) => {
  // Add caching
  const cacheKey = 'users-list'
  const cached = await redis.get(cacheKey)

  if (cached) {
    return res.json(JSON.parse(cached))
  }

  // Optimize query with select
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    }
  })

  const processed = users.map(user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }))

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(processed))
  res.json(processed)
})
```

## Performance Metrics to Track

### Frontend Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: < 250KB (gzipped)

### Backend Metrics
- **Response Time**: < 200ms (p95)
- **Throughput**: > 1000 req/s
- **Error Rate**: < 0.1%
- **Memory Usage**: < 512MB
- **CPU Usage**: < 70%

## Tools for Analysis

### Frontend
```bash
# Bundle analysis
pnpm build
npx @next/bundle-analyzer

# Performance profiling
npx lighthouse https://localhost:3000

# React DevTools Profiler
# Chrome DevTools Performance tab
```

### Backend
```bash
# Load testing
npx autocannon -c 100 -d 30 http://localhost:3001/api/users

# Memory profiling
node --inspect app.js

# Database query analysis
npx prisma studio
```

## Common Optimization Patterns

### React Optimizations
1. **useMemo** for expensive calculations
2. **useCallback** for function props
3. **React.memo** for component memoization
4. **Code splitting** with dynamic imports
5. **Virtual scrolling** for large lists

### API Optimizations
1. **Database indexing** for slow queries
2. **Query optimization** with proper selects
3. **Caching** with Redis or similar
4. **Pagination** for large datasets
5. **Compression** middleware

### Bundle Optimizations
1. **Tree shaking** unused code
2. **Code splitting** by routes
3. **Dynamic imports** for heavy libraries
4. **Image optimization** with next/image
5. **CDN** for static assets

## Success Criteria
- [ ] Three specific optimization opportunities identified
- [ ] Each win has clear implementation steps
- [ ] Performance metrics are measurable
- [ ] Changes maintain functionality
- [ ] Tests still pass after optimization

## Notes
- Always measure before and after
- Test in production-like environment
- Consider user experience impact
- Document performance improvements
- Monitor for regressions