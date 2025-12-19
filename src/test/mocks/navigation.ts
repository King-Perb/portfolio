/**
 * Shared navigation mocks for tests
 * Reduces code duplication across test files
 *
 * IMPORTANT: When using these mocks, you MUST call vi.mock("next/navigation", ...)
 * at the top level of your test file BEFORE importing any modules that depend on
 * next/navigation. Vitest hoists mocks, so vi.mock cannot be called inside functions.
 *
 * @example
 * ```ts
 * import { vi } from "vitest";
 * import { createNextNavigationMocks } from "@/test/mocks/navigation";
 *
 * // Set up mocks BEFORE imports
 * const { mockUsePathname, mockRouter, mocks } = createNextNavigationMocks("/");
 * vi.mock("next/navigation", () => mocks);
 *
 * // Now import modules that use next/navigation
 * import { MyComponent } from "./my-component";
 * ```
 */

import { vi } from "vitest";

/**
 * Creates a mock usePathname hook that can be controlled per test
 */
export function createMockUsePathname(initialPath = "/") {
  const mockUsePathname = vi.fn(() => initialPath);
  return {
    mockUsePathname,
    mock: () => ({
      usePathname: () => mockUsePathname(),
    }),
  };
}

/**
 * Creates a mock useRouter hook with all standard methods
 */
export function createMockUseRouter() {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };
  return {
    mockRouter,
    mock: () => ({
      useRouter: () => mockRouter,
    }),
  };
}

/**
 * Creates complete next/navigation mocks with controllable pathname
 *
 * @example
 * ```ts
 * import { vi } from "vitest";
 * import { createNextNavigationMocks } from "@/test/mocks/navigation";
 *
 * // IMPORTANT: Call vi.mock BEFORE importing any modules that use next/navigation
 * const { mockUsePathname, mockRouter, mocks } = createNextNavigationMocks("/");
 * vi.mock("next/navigation", () => mocks);
 *
 * // Now import modules that use next/navigation
 * import { MyComponent } from "./my-component";
 * ```
 */
export function createNextNavigationMocks(initialPath = "/") {
  const { mockUsePathname } = createMockUsePathname(initialPath);
  const { mockRouter } = createMockUseRouter();

  return {
    mockUsePathname,
    mockRouter,
    mocks: {
      usePathname: () => mockUsePathname(),
      useRouter: () => mockRouter,
      useSearchParams: () => new URLSearchParams(),
    },
  };
}
