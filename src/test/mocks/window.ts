/**
 * Shared window property mocks for tests
 * Reduces code duplication across test files
 */

import { vi } from "vitest";

/**
 * Mocks window.open with a controllable mock function
 */
export function mockWindowOpen() {
  const mockOpen = vi.fn();
  Object.defineProperty(globalThis.window, "open", {
    writable: true,
    value: mockOpen,
  });
  return mockOpen;
}

/**
 * Mocks window.innerWidth with a controllable value
 */
export function mockWindowInnerWidth(width: number) {
  Object.defineProperty(globalThis.window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

/**
 * Mocks window.localStorage with a controllable mock
 */
export function mockWindowLocalStorage() {
  const storage: Record<string, string> = {};
  const mockStorage = {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };

  Object.defineProperty(globalThis.window, "localStorage", {
    writable: true,
    configurable: true,
    value: mockStorage,
  });

  return mockStorage;
}

/**
 * Mocks window.getComputedStyle
 */
export function mockWindowGetComputedStyle(styles: Partial<CSSStyleDeclaration> = {}) {
  const mockGetComputedStyle = vi.fn((element: Element) => {
    const defaultStyles: Partial<CSSStyleDeclaration> = {
      color: "rgb(0, 0, 0)",
      boxShadow: "none",
      ...styles,
    };
    return defaultStyles as CSSStyleDeclaration;
  });

  Object.defineProperty(globalThis.window, "getComputedStyle", {
    writable: true,
    configurable: true,
    value: mockGetComputedStyle,
  });

  return mockGetComputedStyle;
}
