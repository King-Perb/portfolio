import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatStream } from "../use-chat-stream";
import type { ChatMessage } from "@/types/chat";
import { mockFetch, mockLocalStorage, resetMocks } from "./use-chat-stream.setup";

describe("useChatStream - Messaging", () => {
  beforeEach(() => {
    resetMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends message and adds user message to state", async () => {
    const mockReader = {
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
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
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/ai-miko/chat", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.stringContaining("Hello"),
    }));

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
      expect(result.current.messages[0].content).toBe("Hello");
      expect(result.current.messages[0].role).toBe("user");
    });
  });

  it("sets isTyping to true when sending message", async () => {
    const mockReader = {
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
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

    act(() => {
      result.current.sendMessage("Hello");
    });

    expect(result.current.isTyping).toBe(true);
  });

  it("processes streaming response and updates assistant message", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {"content":"Hello"}\n\n'),
      encoder.encode('data: {"content":" there"}\n\n'),
      encoder.encode("data: [DONE]\n\n"),
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
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

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    await act(async () => {
      await result.current.sendMessage("Hi");
    });

    await waitFor(() => {
      const assistantMessages = result.current.messages.filter(m => m.role === "assistant");
      expect(assistantMessages.length).toBeGreaterThan(0);
      expect(assistantMessages[0].content).toBe("Hello there");
    });
  });

  it("handles thread ID from server response", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      encoder.encode('data: {"threadId":"thread-456"}\n\n'),
      encoder.encode("data: [DONE]\n\n"),
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: chunks[chunkIndex++] });
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

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    await act(async () => {
      await result.current.sendMessage("Hi");
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "ai-miko-thread-id",
        "thread-456"
      );
    });
  });

  it("sends thread ID in request when available", async () => {
    // Set up mock BEFORE rendering hook, so it's available when useEffect runs
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "ai-miko-thread-id") {
        return "existing-thread-123";
      }
      if (key === "ai-miko-conversation") {
        return null;
      }
      return null;
    });

    const mockReader = {
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
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

    // Wait for localStorage.getItem to be called (hook loads thread ID in useEffect)
    await waitFor(() => {
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("ai-miko-thread-id");
    }, { timeout: 2000 });

    // The hook's useEffect that loads from localStorage runs after mount.
    // React batches state updates, so we need to wait for the state update to be applied.
    // The hook saves threadId back to localStorage in another useEffect when it changes.
    // Wait for that save to happen as a signal that the state has been updated.
    await waitFor(() => {
      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const threadIdSaved = setItemCalls.some(
        call => call[0] === "ai-miko-thread-id" && call[1] === "existing-thread-123"
      );
      if (!threadIdSaved) {
        throw new Error("Thread ID not yet saved to localStorage");
      }
    }, { timeout: 2000 });

    // The useCallback depends on threadId, so it will be recreated when threadId changes.
    // We need to wait for React to process the state update and recreate the callback.
    // Give React a few ticks to ensure the callback has been recreated with the new threadId.
    await act(async () => {
      // Wait for React to process state updates and re-render
      await new Promise(resolve => setTimeout(resolve, 10));
      // Force another tick to ensure useCallback has been re-evaluated
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const fetchCall = mockFetch.mock.calls[0];
    const body = fetchCall?.[1]?.body ? JSON.parse(fetchCall[1].body) : null;
    if (body) {
      expect(body.threadId).toBe("existing-thread-123");
    } else {
      throw new Error("Fetch was not called with expected parameters");
    }
  });

  it("stops generation and sets isTyping to false", async () => {
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        return new Promise(() => {}); // Never resolves
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

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      // Wait for initial hydration
    });

    act(() => {
      result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.isTyping).toBe(true);
    });

    act(() => {
      result.current.stopGeneration();
    });

    expect(result.current.isTyping).toBe(false);
  });

  it("clears messages and thread ID", async () => {
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Hello",
        timestamp: new Date(),
      },
    ];

    const { result } = renderHook(() => useChatStream(initialMessages));

    await waitFor(() => {
      // Wait for initial hydration
    });

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("ai-miko-conversation");
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("ai-miko-thread-id");
  });
});
