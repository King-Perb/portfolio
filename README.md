# Portfolio - Developer Dashboard

A high-performance "Developer Dashboard" portfolio built with Next.js 15, TypeScript, and Tailwind CSS v4. Features GitHub integration, comprehensive test coverage, and a modern "Hacker Mode" aesthetic.

## Features

- **GitHub Integration**: Automatically fetches and displays repositories, commits, deployments, and language statistics
- **Project Management**: Unified configuration for GitHub project overrides (tags, images, descriptions, featured status)
- **Manual Projects**: Support for non-GitHub projects (WordPress sites, client work, etc.)
- **Technology Stack**: Auto-detected from GitHub repositories + manual technology configuration
- **Project Stats**: Display commits, deployments, stars, and forks for each project
- **Comprehensive Testing**: Full test coverage with Vitest and React Testing Library
- **CI/CD**: Pre-push hooks and GitHub Actions for automated quality checks

## Project Structure

```
src/
├── app/              # Next.js App Router pages and routes
│   ├── api/          # API routes (GitHub integration)
│   ├── design/       # Design system showcase
│   └── __tests__/    # Page tests
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   ├── layout/       # Layout components (Sidebar, Shell, etc.)
│   ├── projects/     # Project-related components
│   └── ui/           # shadcn/ui components
├── data/             # Configuration and data sources
│   ├── github-project-overrides.ts  # Unified GitHub project config
│   ├── manual-projects.ts           # Non-GitHub projects
│   └── manual-technologies.ts       # Additional technologies
├── hooks/            # Custom React hooks
│   └── __tests__/    # Hook tests
├── lib/              # Utilities and constants
│   └── __tests__/    # Utility tests
└── types/            # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# GitHub API Configuration
GITHUB_TOKEN=your_personal_access_token_here
# Get your token from: https://github.com/settings/tokens
# Required scopes: repo (for private repos), public_repo (for public repos only)

# Optional: Base URL for server-side API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Default for local dev
```

**Note:** See `doc/implementation_plan.md` for detailed setup instructions.

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Type checking
npm run type:check

# Linting
npm run lint

# Build for production
npm run build
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** lucide-react
- **Animation:** framer-motion
- **Testing:** Vitest + React Testing Library
- **GitHub API:** Octokit

## Testing

The project includes comprehensive test coverage across multiple levels:

### Unit & Component Tests (Vitest)
- **Unit Tests**: Utilities, hooks, and service functions
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: API routes and page components
- **Coverage**: Excludes UI components (shadcn/ui), data-only files, and type definitions

Run `npm run test:coverage` to see detailed coverage reports.

### End-to-End Tests (Playwright)
- **E2E Tests**: Full browser testing for critical user flows
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: Responsive design testing on mobile viewports
- **Test Coverage**: Navigation, project interactions, mobile navigation, responsive design

Run `npm run test:e2e` to execute E2E tests. Use `npm run test:e2e:ui` for the interactive UI mode.

## Project Configuration

### GitHub Project Overrides

Configure GitHub projects in `src/data/github-project-overrides.ts`:

```typescript
"owner/repo-name": {
  tags: ["Technology1", "Technology2"],
  featuredImage: "/screenshots/project.jpg",
  description: "Custom description",
  clickUrl: "https://example.com",
  featured: true,
  excluded: false,
}
```

### Manual Projects

Add non-GitHub projects in `src/data/manual-projects.ts`:

```typescript
{
  title: "Project Name",
  description: "Project description",
  tags: ["Technology1", "Technology2"],
  liveUrl: "https://example.com",
  screenshot: "/screenshots/project.jpg",
  source: "manual",
  featured: true,
}
```

### Manual Technologies

Add technologies not detected from GitHub in `src/data/manual-technologies.ts`:

```typescript
{ name: "Docker", bytes: 1000 },
{ name: "Kubernetes", bytes: 500 },
```

## Project Rules

See `.cursor/rules/` for AI-assisted development rules and `doc/implementation_plan.md` for coding standards, component structure, and best practices.

## CI/CD

The project includes:

- **Pre-push Hooks**: Automatically run lint, type-check, tests, and build before pushing
- **GitHub Actions**: CI workflow for lint, type-check, tests, and build
- **Branch Protection**: Requires passing CI checks and PR reviews before merging to main

See `doc/GIT_WORKFLOW.md` for detailed workflow information.
