import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatStream } from "../use-chat-stream";
import type { ChatMessage } from "@/types/chat";
import { mockFetch, mockLocalStorage, resetMocks } from "./use-chat-stream.setup";

describe("useChatStream - Initialization", () => {
  beforeEach(() => {
    resetMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with empty messages when no initialMessages provided", () => {
    const { result } = renderHook(() => useChatStream());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isTyping).toBe(false);
  });

  it("initializes with initialMessages", () => {
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Hello",
        timestamp: new Date("2024-01-01"),
      },
    ];

    const { result } = renderHook(() => useChatStream(initialMessages));

    expect(result.current.messages).toEqual(initialMessages);
  });

  it("loads messages from localStorage after hydration", async () => {
    const storedMessages: ChatMessage[] = [
      {
        id: "stored-1",
        role: "user",
        content: "Stored message",
        timestamp: new Date("2024-01-01"),
      },
    ];

    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "ai-miko-conversation") {
        return JSON.stringify(storedMessages);
      }
      return null;
    });

    const { result } = renderHook(() => useChatStream());

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    expect(result.current.messages[0].content).toBe("Stored message");
  });

  it("loads thread ID from localStorage after hydration", async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "ai-miko-thread-id") {
        return "thread-123";
      }
      return null;
    });

    renderHook(() => useChatStream());

    await waitFor(() => {
      // Thread ID is internal, but we can verify it's loaded by checking localStorage calls
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("ai-miko-thread-id");
    });
  });

  it("saves messages to localStorage when they change", async () => {
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
      await result.current.sendMessage("New message");
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "ai-miko-conversation",
        expect.stringContaining("New message")
      );
    });
  });
});

