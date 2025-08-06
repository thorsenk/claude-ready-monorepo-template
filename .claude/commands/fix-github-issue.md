# Fix GitHub Issue Command

## Overview
Automated workflow to fix GitHub issues with a systematic 8-step approach.

## Usage
```bash
claude /fix-github-issue #123
```

## 8-Step Repair Recipe

### Step 1: Issue Analysis
1. Fetch issue details using GitHub MCP
2. Analyze issue description, labels, and comments
3. Identify the root cause and affected components
4. Determine priority and complexity

### Step 2: Environment Setup
1. Ensure development environment is ready
2. Check out the correct branch (usually `main` or `develop`)
3. Install/update dependencies: `pnpm install`
4. Verify database and services are running

### Step 3: Test Reproduction
1. Write a failing test that reproduces the issue
2. Follow TDD approach - test should fail initially
3. Document the expected vs actual behavior
4. Add test to appropriate test suite

### Step 4: Root Cause Investigation
1. Use debugging tools to trace the issue
2. Check logs and error messages
3. Identify the exact line/component causing the problem
4. Document findings for future reference

### Step 5: Implementation
1. Write minimal code to fix the issue
2. Follow established coding patterns
3. Ensure type safety and linting compliance
4. Add necessary documentation

### Step 6: Testing & Validation
1. Run the new test - should now pass
2. Run full test suite: `pnpm test`
3. Run linting: `pnpm lint`
4. Run type checking: `pnpm typecheck`
5. Test manually if needed

### Step 7: Documentation & Cleanup
1. Update relevant documentation
2. Add comments explaining the fix
3. Update changelog if needed
4. Clean up any temporary debugging code

### Step 8: Pull Request Creation
1. Create feature branch: `git checkout -b fix/issue-123`
2. Commit changes with conventional commit message
3. Push branch and create PR
4. Add issue reference in PR description
5. Request review from team members

## Example Workflow

```bash
# 1. Analyze issue
gh issue view 123

# 2. Setup environment
pnpm install
pnpm db:migrate

# 3. Create test
# Write failing test in appropriate test file

# 4. Implement fix
# Write minimal code to make test pass

# 5. Validate
pnpm test
pnpm lint
pnpm typecheck

# 6. Commit and PR
git add .
git commit -m "fix: resolve issue #123 - [brief description]"
git push origin fix/issue-123
gh pr create --title "Fix #123: [description]" --body "Closes #123"
```

## Success Criteria
- [ ] Issue is fully resolved
- [ ] Tests pass and cover the fix
- [ ] Code follows project standards
- [ ] Documentation is updated
- [ ] PR is created and ready for review
- [ ] Issue is linked to PR

## Common Patterns

### Frontend Issues
- Check component props and state
- Verify API calls and error handling
- Test responsive design and accessibility
- Validate form inputs and validation

### Backend Issues
- Check API endpoint logic
- Verify database queries and migrations
- Test authentication and authorization
- Validate input sanitization

### Performance Issues
- Profile the bottleneck
- Implement caching strategies
- Optimize database queries
- Add performance monitoring

## Error Handling
If any step fails:
1. Document the failure
2. Rollback changes if necessary
3. Create a new issue for the blocking problem
4. Update the original issue with progress

## Notes
- Always follow TDD approach
- Keep commits atomic and focused
- Use conventional commit messages
- Test thoroughly before creating PR
- Consider impact on other features