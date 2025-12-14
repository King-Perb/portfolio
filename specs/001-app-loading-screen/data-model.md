# Data Model: App Loading Screen with Lottie Animation

**Feature**: App Loading Screen with Lottie Animation  
**Date**: 2025-12-14  
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature is a pure UI component with minimal data requirements. The component manages its own internal state and does not interact with external data sources or APIs.

## Component State Model

### AppLoadingScreen Component State

```typescript
interface AppLoadingScreenState {
  isMounted: boolean;      // Client-side mount state (controls Lottie vs placeholder)
  isVisible: boolean;      // Controls fade-out animation (opacity)
  shouldRender: boolean;   // Controls DOM presence (prevents memory leaks)
}
```

**State Transitions**:
1. **Server Render**: `isMounted=false, isVisible=true, shouldRender=true` (shows placeholder)
2. **Client Hydrated**: `isMounted=true, isVisible=true, shouldRender=true` (shows Lottie)
3. **Fading Out**: `isMounted=true, isVisible=false, shouldRender=true`
4. **Unmounted**: `isMounted=true, isVisible=false, shouldRender=false`

**Key Design**: The loading screen container renders on BOTH server and client, but the Lottie animation only renders after hydration (client). This prevents hydration mismatch while ensuring the loading screen is visible immediately.

### Component Props

```typescript
interface AppLoadingScreenProps {
  minimumDisplayTime?: number; // Optional, defaults to 1500ms
}
```

**Validation Rules**:
- `minimumDisplayTime` must be a positive number (if provided)
- Default value: 1500 milliseconds

## Configuration Model

### Animation Configuration

```typescript
interface AnimationConfig {
  src: string;           // Path to Lottie file (e.g., "/Skull_and_Bone_Turnaround.lottie")
  loop: boolean;         // Always true for loading screen
  autoplay: boolean;     // Always true for loading screen
}
```

**Current Configuration**:
- `src`: `/Skull_and_Bone_Turnaround.lottie`
- `loop`: `true`
- `autoplay`: `true`

### Timing Configuration

```typescript
interface TimingConfig {
  minimumDisplayTime: number;  // Default: 1500ms
  fadeOutDuration: number;     // Fixed: 300ms (matches CSS transition)
  unmountDelay: number;        // Fixed: 300ms (matches fade-out duration)
}
```

**Validation**:
- `minimumDisplayTime` >= 0 (enforced by `Math.max(0, ...)`)
- `fadeOutDuration` and `unmountDelay` are constants

## Event Model

### Window Load Event

The component listens to the `window.load` event to determine when the application has finished loading.

**Event Flow**:
1. Component mounts
2. Records start time: `startTime = Date.now()`
3. Waits for `window.load` event OR checks `document.readyState === "complete"`
4. On load: calculates `elapsed = Date.now() - startTime`
5. Calculates `remainingTime = Math.max(0, minimumDisplayTime - elapsed)`
6. After `remainingTime`: triggers fade-out
7. After fade-out animation: unmounts component

## No External Data Sources

This component does not:
- Fetch data from APIs
- Read from localStorage/sessionStorage
- Interact with databases
- Require authentication
- Store persistent state

## Accessibility Data

### ARIA Attributes

```typescript
interface AriaAttributes {
  role: "status";                    // Indicates loading state
  "aria-label": "Loading application"; // Screen reader announcement
}
```

**Semantic HTML**:
- Uses `role="status"` for live region
- Provides descriptive `aria-label` for screen readers
- No form inputs or interactive elements

## Summary

The data model is minimal and focused on component-internal state management. All data is ephemeral and exists only during the component lifecycle. No persistence or external data integration is required.

