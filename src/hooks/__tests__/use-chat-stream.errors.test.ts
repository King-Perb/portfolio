import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatStream } from "../use-chat-stream";
import { mockFetch, resetMocks } from "./use-chat-stream.setup";

describe("useChatStream - Error Handling", () => {
  beforeEach(() => {
    resetMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles API errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      const errorMessages = result.current.messages.filter(m =>
        m.content.includes("error") || m.content.includes("Sorry")
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles non-ok response", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      const errorMessages = result.current.messages.filter(m =>
        m.content.includes("error") || m.content.includes("Sorry")
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it("handles AbortError silently", async () => {
    const mockReader = {
      read: vi.fn().mockRejectedValueOnce(new DOMException("Aborted", "AbortError")),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    await act(async () => {
      await result.current.sendMessage("Hello");
      result.current.stopGeneration();
    });

    // Should not add error message for AbortError
    await waitFor(() => {
      expect(result.current.isTyping).toBe(false);
    });
  });

  it("handles error responses from OpenAI", async () => {
    const encoder = new TextEncoder();
    let readCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        readCount++;
        if (readCount === 1) {
          return Promise.resolve({ done: false, value: encoder.encode('data: {"error":"API Error","details":"Rate limit exceeded"}\n\n') });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
      cancel: vi.fn(),
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      const errorMessages = result.current.messages.filter(m =>
        m.content.includes("Error") || m.content.includes("API Error")
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
