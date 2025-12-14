import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock OpenAI - create mocks that can be controlled
// Mock OpenAI before importing the route
vi.mock("openai", () => {
  // Create mocks inside the factory to avoid hoisting issues
  const threadCreate = vi.fn();
  const messageCreate = vi.fn();
  const runCreate = vi.fn();
  
  // Expose mocks on a global object so tests can access them
  interface OpenAIMocks {
    threadCreate: ReturnType<typeof vi.fn>;
    messageCreate: ReturnType<typeof vi.fn>;
    runCreate: ReturnType<typeof vi.fn>;
  }
  (global as typeof globalThis & { __openaiMocks?: OpenAIMocks }).__openaiMocks = {
    threadCreate,
    messageCreate,
    runCreate,
  };
  
  const MockOpenAI = vi.fn().mockImplementation(() => ({
    beta: {
      threads: {
        create: threadCreate,
        messages: {
          create: messageCreate,
        },
        runs: {
          create: runCreate,
        },
      },
    },
  }));
  
  return {
    default: MockOpenAI,
  };
});

// Import POST after mocking
import { POST } from "../route";

// Get the mocks from the global object
interface OpenAIMocks {
  threadCreate: ReturnType<typeof vi.fn>;
  messageCreate: ReturnType<typeof vi.fn>;
  runCreate: ReturnType<typeof vi.fn>;
}
const getMocks = (): OpenAIMocks => {
  const mocks = (global as typeof globalThis & { __openaiMocks?: OpenAIMocks }).__openaiMocks;
  if (!mocks) {
    throw new Error("OpenAI mocks not initialized");
  }
  return mocks;
};

describe("POST /api/ai-miko/chat", () => {
  let mocks: ReturnType<typeof getMocks>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.OPENAI_ASSISTANT_ID = "test-assistant-id";
    mocks = getMocks();
  });

  const createRequest = (body: unknown) => {
    return new NextRequest("http://localhost/api/ai-miko/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  it("returns 500 when OPENAI_API_KEY is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    const request = createRequest({ message: "Hello" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "OpenAI API key not configured" });
  });

  it("returns 500 when OPENAI_ASSISTANT_ID is not configured", async () => {
    delete process.env.OPENAI_ASSISTANT_ID;

    const request = createRequest({ message: "Hello" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "OpenAI Assistant ID not configured" });
  });

  it("creates a new thread when threadId is not provided", async () => {
    const mocks = getMocks();
    const mockThread = { id: "thread-123" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.run.completed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const request = createRequest({ message: "Hello" });
    const response = await POST(request);

    expect(mocks.threadCreate).toHaveBeenCalledOnce();
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    
    // Read the stream to verify thread ID is sent
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const { value } = await reader.read();
      const text = decoder.decode(value);
      expect(text).toContain("thread-123");
      reader.releaseLock();
    }
  });

  it("reuses existing thread when threadId is provided", async () => {
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.run.completed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const request = createRequest({ 
      message: "Hello", 
      threadId: "existing-thread-123" 
    });
    const response = await POST(request);

    expect(mocks.threadCreate).not.toHaveBeenCalled();
    expect(mocks.messageCreate).toHaveBeenCalledWith("existing-thread-123", {
      role: "user",
      content: "Hello",
    });
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("adds conversation history to new thread", async () => {
    const mockThread = { id: "thread-123" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.run.completed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const conversationHistory = [
      { id: "1", role: "user" as const, content: "Hi", timestamp: new Date() },
      { id: "2", role: "assistant" as const, content: "Hello!", timestamp: new Date() },
    ];

    const request = createRequest({ 
      message: "How are you?",
      conversationHistory,
    });
    const response = await POST(request);

    // Consume the stream to ensure all async operations complete
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
      reader.releaseLock();
    }

    // Should add conversation history messages
    expect(mocks.messageCreate).toHaveBeenCalledTimes(3); // 2 history + 1 new
    expect(mocks.messageCreate).toHaveBeenNthCalledWith(1, "thread-123", {
      role: "user",
      content: "Hi",
    });
    expect(mocks.messageCreate).toHaveBeenNthCalledWith(2, "thread-123", {
      role: "assistant",
      content: "Hello!",
    });
  });

  it("streams message deltas from OpenAI", async () => {
    const mockThread = { id: "thread-123" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.message.delta",
          data: {
            delta: {
              content: [
                {
                  type: "text",
                  text: { value: "Hello" },
                },
              ],
            },
          },
        };
        yield {
          event: "thread.message.delta",
          data: {
            delta: {
              content: [
                {
                  type: "text",
                  text: { value: " there" },
                },
              ],
            },
          },
        };
        yield {
          event: "thread.run.completed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const request = createRequest({ message: "Hi" });
    const response = await POST(request);

    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const chunks: string[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value));
      }

      const streamContent = chunks.join("");
      expect(streamContent).toContain('"content":"Hello"');
      expect(streamContent).toContain('"content":" there"');
      expect(streamContent).toContain("[DONE]");
    }
  });

  it("handles string text deltas", async () => {
    const mockThread = { id: "thread-123" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.message.delta",
          data: {
            delta: {
              content: [
                {
                  type: "text",
                  text: "Hello", // String instead of object
                },
              ],
            },
          },
        };
        yield {
          event: "thread.run.completed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const request = createRequest({ message: "Hi" });
    const response = await POST(request);

    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const chunks: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value));
      }
      const text = chunks.join("");
      expect(text).toContain('"content":"Hello"');
      reader.releaseLock();
    }
  });

  it("handles run failure", async () => {
    const mockThread = { id: "thread-123" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.run.failed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const request = createRequest({ message: "Hi" });
    const response = await POST(request);

    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const chunks: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value));
      }
      const text = chunks.join("");
      expect(text).toContain("error");
      reader.releaseLock();
    }

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles OpenAI API errors gracefully", async () => {
    const mockThread = { id: "thread-123" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    mocks.messageCreate.mockRejectedValueOnce(new Error("API Error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const request = createRequest({ message: "Hi" });
    const response = await POST(request);

    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const chunks: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value));
      }
      const text = chunks.join("");
      expect(text).toContain("error");
      reader.releaseLock();
    }

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles invalid request body", async () => {
    const request = new NextRequest("http://localhost/api/ai-miko/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to process chat message" });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("sends thread ID in stream when creating new thread", async () => {
    const mockThread = { id: "new-thread-456" };
    mocks.threadCreate.mockResolvedValueOnce(mockThread);
    
    const mockRun = {
      [Symbol.asyncIterator]: async function* () {
        yield {
          event: "thread.run.completed",
          data: {},
        };
      },
    };
    mocks.runCreate.mockResolvedValueOnce(mockRun as unknown as AsyncIterable<unknown>);

    const request = createRequest({ message: "Hello" });
    const response = await POST(request);

    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      const { value } = await reader.read();
      const text = decoder.decode(value);
      const threadData = JSON.parse(text.replace("data: ", ""));
      expect(threadData.threadId).toBe("new-thread-456");
      reader.releaseLock();
    }
  });
});

