import { vi } from "vitest";

// Mock fetch
export const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Helper to reset all mocks
export function resetMocks() {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue(null);
}

