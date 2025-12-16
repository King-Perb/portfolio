import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatContainer } from "../chat-container";
import type { ChatMessage } from "@/types/chat";
import { useChatStream } from "@/hooks/use-chat-stream";

// Mock useChatStream hook
vi.mock("@/hooks/use-chat-stream", () => ({
  useChatStream: vi.fn(),
}));

// Mock child components
vi.mock("../message-list", () => ({
  MessageList: ({ messages, isTyping }: { messages: ChatMessage[]; isTyping: boolean }) => (
    <div data-testid="message-list">
      {messages.length === 0 ? "No messages" : `${messages.length} messages`}
      {isTyping && <span data-testid="typing">Typing...</span>}
    </div>
  ),
}));

vi.mock("../chat-input", () => ({
  ChatInput: ({
    onSendMessage,
    onStop,
    isTyping,
    disabled
  }: {
    onSendMessage: (msg: string) => void;
    onStop: () => void;
    isTyping: boolean;
    disabled: boolean;
  }) => (
    <div data-testid="chat-input">
      <button
        data-testid="send-button"
        onClick={() => onSendMessage("test message")}
        disabled={disabled}
      >
        {isTyping ? "Stop" : "Send"}
      </button>
      {isTyping && (
        <button data-testid="stop-button" onClick={onStop}>
          Stop
        </button>
      )}
    </div>
  ),
}));

vi.mock("../clear-conversation-popover", () => ({
  ClearConversationPopover: ({ onClear }: { onClear: () => void }) => (
    <button data-testid="clear-button" onClick={onClear}>
      Clear conversation
    </button>
  ),
}));

describe("ChatContainer", () => {
  const mockMessages: ChatMessage[] = [];
  const mockIsTyping = false;
  const mockSendMessage = vi.fn();
  const mockStopGeneration = vi.fn();
  const mockClearMessages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockMessages.length = 0;

    vi.mocked(useChatStream).mockReturnValue({
      messages: mockMessages,
      isTyping: mockIsTyping,
      sendMessage: mockSendMessage,
      stopGeneration: mockStopGeneration,
      clearMessages: mockClearMessages,
    });
  });

  it("renders message list and chat input", () => {
    render(<ChatContainer />);

    expect(screen.getByTestId("message-list")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });

  it("renders starter bubbles when there are unused prompts", () => {
    render(<ChatContainer />);

    const bubbles = screen.getAllByTestId("miko-starter-bubble");
    expect(bubbles.length).toBeGreaterThanOrEqual(1);
    expect(bubbles.length).toBeLessThanOrEqual(3);
  });

  it("sends starter prompt message and hides bubble when clicked (via sendMessage)", async () => {
    render(<ChatContainer />);

    const bubbles = screen.getAllByTestId("miko-starter-bubble");
    const firstBubble = bubbles[0];
    const text = firstBubble.textContent;

    expect(text).toBeTruthy();

    firstBubble.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(text, {
      source: "starter-prompt",
      promptId: expect.any(String),
    });
  });

  it("does not render clear button when there are no messages", () => {
    render(<ChatContainer />);

    expect(screen.queryByTestId("clear-button")).not.toBeInTheDocument();
  });

  it("renders clear button when there are messages", () => {
    const messagesWithContent: ChatMessage[] = [{
      id: "1",
      role: "user",
      content: "Hello",
      timestamp: new Date(),
    }];

    vi.mocked(useChatStream).mockReturnValueOnce({
      messages: messagesWithContent,
      isTyping: false,
      sendMessage: mockSendMessage,
      stopGeneration: mockStopGeneration,
      clearMessages: mockClearMessages,
    });

    render(<ChatContainer />);

    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
  });

  it("passes messages to MessageList", () => {
    const messagesWithContent: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Hello",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "assistant",
        content: "Hi there!",
        timestamp: new Date(),
      }
    ];

    vi.mocked(useChatStream).mockReturnValueOnce({
      messages: messagesWithContent,
      isTyping: false,
      sendMessage: mockSendMessage,
      stopGeneration: mockStopGeneration,
      clearMessages: mockClearMessages,
    });

    render(<ChatContainer />);

    expect(screen.getByText("2 messages")).toBeInTheDocument();
  });

  it("passes isTyping to MessageList and ChatInput", () => {
    vi.mocked(useChatStream).mockReturnValueOnce({
      messages: mockMessages,
      isTyping: true,
      sendMessage: mockSendMessage,
      stopGeneration: mockStopGeneration,
      clearMessages: mockClearMessages,
    });

    render(<ChatContainer />);

    expect(screen.getByTestId("typing")).toBeInTheDocument();
    expect(screen.getByTestId("stop-button")).toBeInTheDocument();
  });

  it("passes initialMessages to useChatStream", () => {
    const initialMessages: ChatMessage[] = [
      {
        id: "initial-1",
        role: "user",
        content: "Initial message",
        timestamp: new Date(),
      },
    ];

    render(<ChatContainer initialMessages={initialMessages} />);

    expect(useChatStream).toHaveBeenCalledWith(initialMessages);
  });

  it("uses empty array as default initialMessages", () => {
    render(<ChatContainer />);

    expect(useChatStream).toHaveBeenCalledWith([]);
  });

  it("passes sendMessage handler to ChatInput", () => {
    render(<ChatContainer />);

    const sendButton = screen.getByTestId("send-button");
    sendButton.click();

    expect(mockSendMessage).toHaveBeenCalledWith("test message");
  });

  it("passes stopGeneration handler to ChatInput", () => {
    vi.mocked(useChatStream).mockReturnValueOnce({
      messages: mockMessages,
      isTyping: true,
      sendMessage: mockSendMessage,
      stopGeneration: mockStopGeneration,
      clearMessages: mockClearMessages,
    });

    render(<ChatContainer />);

    const stopButton = screen.getByTestId("stop-button");
    stopButton.click();

    expect(mockStopGeneration).toHaveBeenCalled();
  });

  it("passes clearMessages handler to ClearConversationPopover", () => {
    const messagesWithContent: ChatMessage[] = [{
      id: "1",
      role: "user",
      content: "Hello",
      timestamp: new Date(),
    }];

    vi.mocked(useChatStream).mockReturnValueOnce({
      messages: messagesWithContent,
      isTyping: false,
      sendMessage: mockSendMessage,
      stopGeneration: mockStopGeneration,
      clearMessages: mockClearMessages,
    });

    render(<ChatContainer />);

    const clearButton = screen.getByTestId("clear-button");
    clearButton.click();

    expect(mockClearMessages).toHaveBeenCalled();
  });

  it("applies correct styling classes", () => {
    const { container } = render(<ChatContainer />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "flex-col", "flex-1", "min-h-0");
  });
});
