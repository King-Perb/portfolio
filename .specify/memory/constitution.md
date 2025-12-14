<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
- Initial constitution creation from template
- Principles extracted from existing .cursor/rules/ files
- Templates: ✅ plan-template.md (Constitution Check section exists), ✅ spec-template.md (aligned), ✅ tasks-template.md (aligned)
- Command files: ✅ All command files reviewed - no agent-specific references found
- Follow-up: None
-->

# Portfolio Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

All code changes MUST be accompanied by tests. The workflow is strictly enforced:

1. **Type and Linter Checks First**: Run `npm run type:check` and `npm run lint` - fix all errors before proceeding
2. **Build Verification**: Ensure `npm run build` succeeds
3. **Test Updates**: Update or add tests for all code changes
4. **Test Execution**: Run `npm test` to verify all tests pass
5. **E2E When Applicable**: Run `npm run test:e2e` for navigation, routing, or critical user flow changes

**Test Coverage Requirements**:
- Component tests: `src/components/**/__tests__/*.test.tsx`
- Service/utility tests: `src/lib/__tests__/*.test.ts`
- API route tests: `src/app/api/**/__tests__/*.test.ts`
- Page tests: `src/app/**/__tests__/*.test.tsx`
- Hook tests: `src/hooks/__tests__/*.test.ts`
- E2E tests: `e2e/*.spec.ts` (Playwright)

**Rationale**: Ensures code quality, prevents regressions, and maintains confidence in refactoring.

### II. TypeScript Strictness

TypeScript MUST be used with strict mode enabled. No `any` types allowed except in exceptional circumstances with explicit justification.

**Requirements**:
- All files must have proper type definitions
- Interfaces and types must be defined in `src/types/`
- Type checking must pass: `npm run type:check`
- No implicit any types

**Rationale**: Type safety prevents runtime errors and improves code maintainability.

### III. Feature Branch Workflow (NON-NEGOTIABLE)

NEVER commit directly to `main`. All changes MUST be made on feature branches and merged via pull requests.

**Branch Naming**:
- `feature/<description>`: New features
- `fix/<description>`: Bug fixes
- `refactor/<description>`: Code refactoring
- `docs/<description>`: Documentation updates
- `test/<description>`: Test additions/improvements

**Workflow**:
1. Check current branch before any commit
2. If on `main`, create feature branch first
3. Make changes on feature branch
4. Create pull request for review
5. All CI checks must pass before merge

**Rationale**: Protects production code, enables code review, and maintains clean git history.

### IV. Conventional Commits

All commit messages MUST follow the Conventional Commits specification.

**Format**: `<type>(<scope>): <subject>`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes**: `components`, `layout`, `api`, `config`, `docs`, `workflows`, `types`, `styles`

**Requirements**:
- Use imperative, present tense
- Maximum 72 characters for subject
- Include body for complex changes
- Reference issues in footer when applicable

**Rationale**: Enables automated changelog generation and clear project history.

### V. Component-Based Architecture

Components MUST be reusable, well-documented, and follow established patterns.

**Structure**:
- UI components: `src/components/ui/` (shadcn/ui)
- Feature components: `src/components/[feature]/`
- Layout components: `src/components/layout/`
- All components must have TypeScript interfaces
- Components should be self-contained and testable

**Requirements**:
- Use shadcn/ui for base components
- Follow existing component patterns
- Document component props and usage
- Keep components focused and single-purpose

**Rationale**: Promotes reusability, maintainability, and consistent UI patterns.

### VI. Performance Standards

The application MUST meet Core Web Vitals targets and performance benchmarks.

**Targets**:
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

**Requirements**:
- Lazy load components and routes when appropriate
- Optimize images and assets
- Minimize bundle size
- Use Next.js optimizations (Image, Link, etc.)

**Rationale**: Ensures excellent user experience and SEO performance.

### VII. Accessibility Compliance

All features MUST be accessible and comply with WCAG 2.1 Level AA standards.

**Requirements**:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast ratios meet WCAG standards
- Screen reader compatibility

**Rationale**: Ensures the application is usable by all users, regardless of abilities.

## Development Workflow

### Code Review Process

All changes MUST be reviewed before merging to `main`:

1. Create feature branch
2. Implement changes with tests
3. Ensure all checks pass (lint, type-check, test, build)
4. Create pull request
5. At least one approval required
6. All CI checks must pass
7. Update `doc/implementation_plan.md` before merging

### Quality Gates

Before any code is merged:

- ✅ TypeScript compilation passes
- ✅ ESLint passes with no errors
- ✅ All unit/component tests pass
- ✅ E2E tests pass (when applicable)
- ✅ Build succeeds
- ✅ Gitleaks scan passes (security)
- ✅ Implementation plan updated

### Implementation Plan Updates

**MANDATORY**: After each commit, update `doc/implementation_plan.md` with:
- Feature additions (components, pages, routes)
- Bug fixes and resolutions
- Refactoring changes
- Test additions
- Configuration changes
- API changes

**Rationale**: Maintains project documentation and provides context for future development.

## Technology Stack

**Framework**: Next.js 15 (App Router)
**Language**: TypeScript (strict mode)
**Styling**: Tailwind CSS v4
**UI Components**: shadcn/ui
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E)
**API**: Octokit for GitHub integration
**Animation**: framer-motion
**Icons**: lucide-react

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. All development decisions MUST align with these principles.

### Amendment Process

1. **Proposal**: Document the proposed change and rationale
2. **Review**: Review impact on existing code and practices
3. **Version Update**: Increment version according to semantic versioning:
   - **MAJOR**: Backward incompatible changes or principle removals
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording improvements, typo fixes
4. **Update Templates**: Ensure all `.specify/templates/` files reflect changes
5. **Documentation**: Update relevant documentation files

### Compliance

- All PRs must verify compliance with constitution principles
- Code reviews must check adherence to principles
- CI/CD pipelines enforce quality gates
- Complexity must be justified against principles

### Development Guidance

For runtime development guidance, refer to:
- `.cursor/rules/` for AI-assisted development rules
- `doc/implementation_plan.md` for project structure and patterns
- `doc/GIT_WORKFLOW.md` for detailed git workflow
- `README.md` for setup and configuration

**Version**: 1.0.0 | **Ratified**: 2025-01-09 | **Last Amended**: 2025-01-09
