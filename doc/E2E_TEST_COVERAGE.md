# E2E Test Coverage Guide

## Overview

E2E (End-to-End) test coverage is different from unit test coverage. Instead of measuring code lines executed, E2E coverage focuses on:

1. **Route/Page Coverage**: Which pages are tested
2. **User Flow Coverage**: Which critical user journeys are tested
3. **Feature Coverage**: Which features have E2E tests
4. **Cross-browser/Device Coverage**: Which browsers and devices are tested

## Code Coverage for E2E Tests

### ⚠️ Important: E2E vs Unit Test Coverage

**Code coverage is NOT standard practice for E2E tests.** Here's why:

1. **Different Purposes:**
   - **Unit/Component Tests (Vitest)**: Test individual functions/components → Code coverage is valuable
   - **E2E Tests (Playwright)**: Test user journeys → Route/flow coverage is valuable

2. **Why Code Coverage for E2E is Rare:**
   - E2E tests are already slow (seconds to minutes per test)
   - Code coverage instrumentation adds significant overhead
   - E2E tests should focus on user journeys, not line-by-line coverage
   - Unit tests are better suited for ensuring code paths are tested

3. **Best Practice:**
   - ✅ **Use Vitest coverage** for unit/component tests (`npm run test:coverage`)
   - ✅ **Use route/flow coverage** for E2E tests (this script)
   - ❌ **Don't use code coverage for E2E tests** (unnecessary complexity)

### Option 1: Playwright Code Coverage (Not Recommended)

Playwright *can* collect code coverage, but it's **not standard practice** because:
- Requires complex Next.js instrumentation
- Significantly slows down already-slow E2E tests
- Provides little value (you already have Vitest coverage)
- Most teams avoid it

**If you really need it** (rare cases):
1. Install coverage tools
2. Configure Next.js webpack for coverage
3. Enable in Playwright config
4. Expect 2-3x slower test execution

**Recommendation**: Skip this. Use Vitest coverage for code coverage instead.

### Option 2: Route/Flow Coverage Analysis (Recommended ✅)

Use the provided coverage analysis script to track:
- Which routes are tested
- Which user flows are covered
- Coverage gaps

**Run the analysis:**
```bash
npm run test:e2e:coverage
```

This generates a report showing:
- ✅ Covered routes with test counts
- ❌ Missing route coverage
- 📁 All test files
- 💡 Recommendations

## Ensuring Comprehensive Coverage

### 1. Route Coverage Checklist

Ensure every route has at least one E2E test:

- [ ] `/` (Home/Overview)
- [ ] `/overview`
- [ ] `/projects`
- [ ] `/stack`
- [ ] `/contact`
- [ ] `/ai-miko`
- [ ] `/design`

### 2. Critical User Flows

Test these essential user journeys:

#### Navigation Flows
- [ ] Desktop sidebar navigation
- [ ] Mobile menu navigation
- [ ] Page transition animations
- [ ] Direct URL navigation
- [ ] Browser back/forward buttons

#### Feature Flows
- [ ] AI Miko chat interaction
- [ ] Project card interactions
- [ ] Contact form submission
- [ ] Metrics display and updates
- [ ] Responsive design breakpoints

#### Error Flows
- [ ] 404 page handling
- [ ] Network error handling
- [ ] API error handling
- [ ] Invalid form submissions

### 3. Cross-Device/Browser Coverage

Test on multiple configurations:

- [ ] Desktop Chrome
- [ ] Mobile Chrome (Pixel 5)
- [ ] Desktop Firefox (optional)
- [ ] Desktop Safari/WebKit (optional)
- [ ] Mobile Safari (optional)

### 4. Test Organization Best Practices

#### File Structure
```
e2e/
  ├── navigation.spec.ts          # Navigation flows
  ├── page-transition-animation.spec.ts
  ├── mobile-nav.spec.ts
  ├── homepage.spec.ts            # Home page specific
  ├── overview-metrics.spec.ts    # Metrics feature
  ├── projects.spec.ts             # Projects page
  ├── project-card.spec.ts        # Project interactions
  ├── stack.spec.ts               # Stack page
  ├── contact.spec.ts             # Contact page
  ├── ai-miko.spec.ts             # AI chat feature
  └── responsive.spec.ts          # Responsive design
```

#### Test Naming Conventions
- Use descriptive test names: `should navigate to projects page via sidebar`
- Group related tests with `test.describe()`
- Use `test.beforeEach()` for common setup

### 5. Coverage Metrics to Track

#### Route Coverage
```typescript
// Track in your test files
test('should load /projects page', async ({ page }) => {
  await page.goto('/projects');
  // ... assertions
});
```

#### User Flow Coverage
```typescript
test('should complete full chat flow', async ({ page }) => {
  // 1. Navigate to chat
  // 2. Send message
  // 3. Receive response
  // 4. Verify interaction
});
```

#### Feature Coverage
- Each major feature should have at least one E2E test
- Critical features should have multiple tests covering edge cases

## Running Coverage Analysis

### Quick Check
```bash
npm run test:e2e:coverage
```

### Full Test Suite
```bash
npm run test:e2e
```

### Interactive Mode
```bash
npm run test:e2e:ui
```

## Coverage Goals

### Minimum Coverage (MVP)
- ✅ All routes tested
- ✅ Critical user flows tested
- ✅ Desktop and mobile tested

### Good Coverage
- ✅ All routes tested
- ✅ All critical user flows tested
- ✅ Error scenarios tested
- ✅ Multiple browsers/devices tested

### Excellent Coverage
- ✅ All routes tested with multiple scenarios
- ✅ All user flows tested (happy path + edge cases)
- ✅ Error scenarios comprehensively tested
- ✅ Performance scenarios tested
- ✅ Accessibility scenarios tested
- ✅ All major browsers/devices tested

## Identifying Coverage Gaps

### 1. Run Coverage Analysis
```bash
npm run test:e2e:coverage
```

### 2. Review Missing Routes
The report will show routes without tests.

### 3. Review Test Files
Check if all features are covered:
- Navigation features
- Interactive components
- Forms and submissions
- API integrations
- Animations and transitions

### 4. Check User Flows
Ensure critical paths are tested:
- User registration/login (if applicable)
- Main feature usage
- Error recovery
- Data persistence

## Continuous Improvement

### Regular Reviews
- Run coverage analysis weekly
- Review coverage reports in PR reviews
- Update coverage goals as app grows

### Test Maintenance
- Update tests when routes change
- Add tests for new features
- Remove obsolete tests
- Refactor tests for maintainability

### Coverage Tracking
Consider tracking coverage metrics over time:
- Route coverage percentage
- Test count per route
- Test execution time
- Test stability (flakiness)

## Code Coverage Strategy: E2E vs Unit Tests

### Unit/Component Tests (Vitest) → Code Coverage ✅

**Use Vitest coverage for code coverage:**
```bash
npm run test:coverage
```

This shows:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

**Why it works well:**
- Fast execution
- Tests individual functions/components
- Code coverage metrics are meaningful
- Already configured in `vitest.config.ts`

### E2E Tests (Playwright) → Route/Flow Coverage ✅

**Use route/flow coverage for E2E tests:**
```bash
npm run test:e2e:coverage
```

This shows:
- Which routes are tested
- Which user flows are covered
- Coverage gaps

**Why this is better:**
- Focuses on what matters for E2E (user journeys)
- No performance overhead
- Easier to understand and maintain
- Standard industry practice

### Summary

| Test Type | Tool | Coverage Type | Command |
|-----------|------|---------------|---------|
| Unit/Component | Vitest | Code Coverage | `npm run test:coverage` |
| E2E | Playwright | Route/Flow Coverage | `npm run test:e2e:coverage` |

**Don't mix them up:**
- ❌ Don't use code coverage for E2E tests (unnecessary, slow)
- ✅ Use code coverage for unit tests (valuable, fast)
- ✅ Use route/flow coverage for E2E tests (valuable, appropriate)

## Tools and Resources

### Playwright Documentation
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Coverage](https://playwright.dev/docs/code-coverage) (advanced, rarely used)

### Vitest Coverage
- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- Already configured in `vitest.config.ts`
- Run with: `npm run test:coverage`

### Coverage Analysis
- Use `npm run test:e2e:coverage` for E2E route/flow analysis
- Use `npm run test:coverage` for unit test code coverage

### Test Organization
- Group related tests in describe blocks
- Use page object models for complex pages
- Create reusable test utilities

## Example: Adding Coverage for a New Route

When adding a new route (e.g., `/blog`):

1. **Create test file**: `e2e/blog.spec.ts`
2. **Add route to coverage script**: Update `KNOWN_ROUTES` in `scripts/check-e2e-coverage.ts`
3. **Write tests**:
   ```typescript
   test.describe('Blog Page', () => {
     test('should load blog page', async ({ page }) => {
       await page.goto('/blog');
       await expect(page).toHaveURL('/blog');
     });

     test('should display blog posts', async ({ page }) => {
       await page.goto('/blog');
       // ... assertions
     });
   });
   ```
4. **Run coverage check**: `npm run test:e2e:coverage`
5. **Verify**: Ensure new route appears in "Covered Routes"

## Summary

### E2E Test Coverage (Route/Flow Based)
E2E test coverage is about ensuring:
- ✅ All routes are tested
- ✅ Critical user flows work end-to-end
- ✅ Features behave correctly across browsers/devices
- ✅ Error scenarios are handled gracefully

**Use:** `npm run test:e2e:coverage` (route/flow analysis)

### Unit Test Coverage (Code Based)
Unit test coverage is about ensuring:
- ✅ All functions/components are tested
- ✅ All code paths are exercised
- ✅ Edge cases are covered
- ✅ Logic is thoroughly tested

**Use:** `npm run test:coverage` (code coverage with Vitest)

### Key Takeaway

**Code coverage is NOT standard practice for E2E tests.** The industry standard is:
- **Unit tests** → Code coverage (Vitest) ✅
- **E2E tests** → Route/flow coverage (Playwright) ✅

You already have the right setup! Use Vitest for code coverage and the route/flow analysis script for E2E coverage.
