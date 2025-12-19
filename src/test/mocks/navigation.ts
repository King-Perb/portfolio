/**
 * Shared navigation mocks for tests
 * Reduces code duplication across test files
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

/**
 * Sets up next/navigation mocks globally (for use in setup files)
 */
export function setupNextNavigationMocks(initialPath = "/") {
  const { mocks } = createNextNavigationMocks(initialPath);
  vi.mock("next/navigation", () => mocks);
  return mocks;
}
