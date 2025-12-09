# Testing

This project uses [Vitest](https://vitest.dev/) for unit and integration testing, along with [React Testing Library](https://testing-library.com/react) for component testing.

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `src/lib/__tests__/` - Tests for service layer and utility functions
- `src/components/__tests__/` - Tests for React components
- `src/test/setup.ts` - Global test setup and mocks

## What's Tested

### Service Layer (`projects-service.ts`)
- ✅ Combining manual and GitHub projects
- ✅ Handling API failures gracefully
- ✅ Sorting projects by last updated date
- ✅ Filtering featured projects
- ✅ Edge cases (empty arrays, missing data)

### Components (`ProjectCard`)
- ✅ Rendering project information
- ✅ Conditional rendering (screenshots, links)
- ✅ GitHub stats display
- ✅ Link attributes and accessibility

### Utilities (`github.ts`)
- ✅ Repository to project transformation
- ✅ Status determination logic
- ✅ Date-based status calculations
- ✅ Tag limiting

## Adding New Tests

When adding new features, consider:
1. **Service functions** - Test business logic, error handling, edge cases
2. **Components** - Test rendering, user interactions, accessibility
3. **Utilities** - Test data transformations, calculations, validations

## Best Practices

- Keep tests focused and isolated
- Mock external dependencies (APIs, Next.js features)
- Test user-facing behavior, not implementation details
- Use descriptive test names that explain what is being tested










