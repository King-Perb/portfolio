# Implementation Plan: App Loading Screen with Lottie Animation

**Branch**: `001-app-loading-screen` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-app-loading-screen/spec.md`

## Summary

Implement a full-screen loading overlay with a Lottie animation that displays during initial application load. The loading screen must appear immediately on page navigation, display for a minimum configurable duration, and fade out smoothly once the app is ready. The feature uses the existing `@lottiefiles/dotlottie-react` library and integrates with the Next.js 15 App Router architecture.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), React 19.2.0  
**Primary Dependencies**: Next.js 16.0.7, `@lottiefiles/dotlottie-react` 0.17.10, React DOM 19.2.0  
**Storage**: N/A (client-side only component)  
**Testing**: Vitest 2.1.8, React Testing Library 16.1.0, Playwright 1.57.0 (for E2E)  
**Target Platform**: Web (Next.js App Router, client-side rendering)  
**Project Type**: Web application (Next.js single-page application)  
**Performance Goals**: Loading screen appears within 100ms, animation plays at 60fps, fade-out completes in 300ms  
**Constraints**: Must not cause layout shift, must unmount cleanly to prevent memory leaks, must be accessible (WCAG 2.1 AA)  
**Scale/Scope**: Single reusable component, used once per application session (initial load only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development ✅
- **Status**: PASS
- **Compliance**: Component already has comprehensive unit tests in `src/components/layout/__tests__/app-loading-screen.test.tsx`
- **Action Required**: Ensure tests pass and add E2E test for initial load experience

### II. TypeScript Strictness ✅
- **Status**: PASS
- **Compliance**: Component uses TypeScript with proper interface definitions (`AppLoadingScreenProps`)
- **Action Required**: Verify `npm run type:check` passes

### III. Feature Branch Workflow ✅
- **Status**: PASS
- **Compliance**: Working on feature branch `001-app-loading-screen`
- **Action Required**: Continue on feature branch, create PR when complete

### IV. Conventional Commits ✅
- **Status**: PASS
- **Compliance**: Will use `feat(layout):` prefix for commits
- **Action Required**: Follow conventional commit format

### V. Component-Based Architecture ✅
- **Status**: PASS
- **Compliance**: Component follows existing layout component patterns in `src/components/layout/`
- **Action Required**: Ensure component is reusable and well-documented

### VI. Performance Standards ✅
- **Status**: PASS
- **Compliance**: Uses optimized dotLottie format, portal rendering prevents layout shift
- **Action Required**: Verify Core Web Vitals (LCP, CLS) not negatively impacted

### VII. Accessibility Compliance ✅
- **Status**: PASS
- **Compliance**: Component includes `role="status"` and `aria-label="Loading application"`
- **Action Required**: Verify screen reader compatibility

**Overall Gate Status**: ✅ **PASS** - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-app-loading-screen/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A (no API)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── layout/
│       ├── app-loading-screen.tsx          # Main component (EXISTS)
│       └── __tests__/
│           └── app-loading-screen.test.tsx # Unit tests (EXISTS)
│
src/
└── app/
    └── layout.tsx                          # Root layout (needs integration)
```

**Structure Decision**: Single Next.js web application. Component exists at `src/components/layout/app-loading-screen.tsx` and needs to be integrated into the root layout (`src/app/layout.tsx`) to display on initial app load. No API or data layer required - pure client-side component.

## Complexity Tracking

> **No violations identified - all constitution principles satisfied**
