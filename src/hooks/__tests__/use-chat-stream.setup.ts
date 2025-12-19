import { vi } from "vitest";

// Mock fetch
export const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Ensure window exists (create stub if in non-DOM environment)
// Note: For full browser API support, ensure Vitest runs with a DOM environment
// (e.g., jsdom or happy-dom) via vitest.config.ts: environment: 'jsdom'
if (!globalThis.window) {
  globalThis.window = {} as Window & typeof globalThis;
}

Object.defineProperty(globalThis.window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Helper to reset all mocks
export function resetMocks() {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue(null);
}
