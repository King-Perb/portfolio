# Research: App Loading Screen with Lottie Animation

**Feature**: App Loading Screen with Lottie Animation  
**Date**: 2025-12-14  
**Phase**: Phase 0 - Research & Decisions

## Research Questions & Decisions

### RQ-001: Animation Format Choice

**Question**: What animation format should be used for the loading screen?

**Decision**: Use dotLottie format (`.lottie` file extension) via `@lottiefiles/dotlottie-react`

**Rationale**:
- dotLottie is an optimized, compressed format that reduces file size compared to JSON Lottie files
- The `@lottiefiles/dotlottie-react` library is actively maintained and compatible with React 19
- Already available in project dependencies
- Supports efficient loading and playback

**Alternatives Considered**:
- JSON Lottie files: Larger file size, slower loading
- CSS animations: Less flexible, harder to maintain complex animations
- GIF: Poor quality, large file size, no programmatic control
- Video: Large file size, harder to loop seamlessly

---

### RQ-002: Rendering Strategy

**Question**: How should the loading screen be rendered to ensure it covers all content?

**Decision**: Render directly in root layout with fixed positioning (NO portal)

**Rationale**:
- React Portal requires `document.body` which only exists on client
- Using portal causes hydration mismatch: server renders nothing, client renders loading screen
- Direct rendering in layout ensures same HTML on server and client
- Fixed positioning with high z-index (999999) covers all content including navigation
- Component placement BEFORE Shell in layout ensures proper render order

**IMPORTANT - Why Not Portal**:
- `createPortal(element, document.body)` fails on server (no document)
- This causes the loading screen to only appear AFTER React hydrates on client
- Defeats the purpose of a loading screen (should be first thing visible)

**Alternatives Rejected**:
- React Portal: Causes hydration mismatch, loading screen appears too late
- CSS-only overlay: Less flexible, harder to manage state
- Next.js loading.tsx: Only works for route segments, not initial app load

---

### RQ-003: Minimum Display Time Strategy

**Question**: How should minimum display time be implemented?

**Decision**: Track elapsed time from component mount and ensure minimum duration is met even if page loads quickly

**Rationale**:
- Prevents jarring flash on fast connections
- Makes the loading screen feel intentional rather than accidental
- Improves perceived polish and professionalism
- Configurable via props for flexibility

**Implementation Approach**:
- Record start time on mount
- When `window.load` event fires, calculate elapsed time
- If elapsed < minimum, wait for remaining time before dismissing
- If elapsed >= minimum, dismiss immediately

**Alternatives Considered**:
- Fixed delay: Doesn't account for actual load time, could delay unnecessarily
- No minimum: Could flash too quickly on fast connections

---

### RQ-004: State Management Approach

**Question**: How should component state be managed for visibility and mounting?

**Decision**: Use three-state approach: `mounted`, `isVisible`, `shouldRender`

**Rationale**:
- `mounted`: Prevents hydration mismatches in Next.js (client-side only)
- `isVisible`: Controls fade-out animation (opacity transition)
- `shouldRender`: Controls DOM presence (prevents memory leaks)

**State Flow**:
1. Component mounts → `mounted = true`, `isVisible = true`, `shouldRender = true`
2. Load completes + minimum time elapsed → `isVisible = false` (fade out)
3. After fade-out animation (300ms) → `shouldRender = false` (unmount from DOM)

**Alternatives Considered**:
- Single state: Less control over animation timing
- Two states: Could cause hydration issues or memory leaks

---

### RQ-005: Integration Point

**Question**: Where should the loading screen be integrated in the Next.js app?

**Decision**: Integrate in root layout (`src/app/layout.tsx`) as a client component

**Rationale**:
- Root layout is the entry point for all pages
- Ensures loading screen appears on initial app load
- Client component needed for `window` event listeners and portal rendering
- Matches Next.js 15 App Router patterns

**Alternatives Considered**:
- Page-level component: Would only show on specific pages, not initial load
- Middleware: Not appropriate for client-side UI
- Custom `_app` wrapper: Not applicable to App Router

---

### RQ-006: Accessibility Implementation

**Question**: How should accessibility be implemented for the loading screen?

**Decision**: Use `role="status"` and `aria-label="Loading application"`

**Rationale**:
- `role="status"` is appropriate for loading indicators that don't require user action
- `aria-label` provides clear announcement for screen readers
- Follows WCAG 2.1 Level AA guidelines
- Minimal implementation that doesn't interfere with animation

**Alternatives Considered**:
- `role="alert"`: Too aggressive, interrupts user unnecessarily
- `aria-live="polite"`: Less semantic than `role="status"`
- No ARIA: Would fail accessibility requirements

---

### RQ-007: Animation File Selection

**Question**: Which Lottie animation should be used?

**Decision**: Use `Skull_and_Bone_Turnaround.lottie` (currently in use)

**Rationale**:
- Already available in `public/` directory
- Matches portfolio branding/aesthetic
- File size is reasonable for initial load
- Alternative (`Fluid_Loading_Animation.lottie`) available if needed

**Alternatives Considered**:
- `Fluid_Loading_Animation.lottie`: Could be used for variety or A/B testing
- Custom animation: Would require design work and additional file creation

---

## Technical Dependencies

### Required Libraries
- `@lottiefiles/dotlottie-react`: ^0.17.10 (already installed)
- `react`: ^19.2.0 (already installed)
- `react-dom`: ^19.2.0 (already installed)

### Animation Files
- `public/Skull_and_Bone_Turnaround.lottie` (primary)
- `public/Fluid_Loading_Animation.lottie` (alternative)

### No Additional Dependencies Required
All necessary libraries are already in the project.

---

## Performance Considerations

1. **File Size**: dotLottie format minimizes animation file size
2. **Loading**: Animation loads from `public/` directory (served statically)
3. **Rendering**: Portal rendering prevents layout shift
4. **Memory**: Component unmounts completely after dismissal (no memory leaks)
5. **Animation Performance**: dotLottie library optimized for 60fps playback

---

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **React 19**: Compatible with latest React features
- **Next.js 15**: Uses App Router patterns
- **No Polyfills Required**: All features are natively supported

---

## Summary

All research questions have been resolved. The implementation approach uses existing dependencies and follows Next.js 15 App Router best practices. The component is ready for integration into the root layout.

