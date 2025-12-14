import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageList } from "../message-list";
import type { ChatMessage } from "@/types/chat";

// Mock MessageBubble
vi.mock("../message-bubble", () => ({
  MessageBubble: ({ message, isTyping }: { message: ChatMessage; isTyping?: boolean }) => (
    <div data-testid={`message-${message.id}`} data-typing={isTyping?.toString()}>
      {message.content}
    </div>
  ),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  USER_PROFILE: {
    name: "Miko",
    avatarUrl: "/portfolio-logo-small.png",
  },
}));

describe("MessageList", () => {
  const mockMessages: ChatMessage[] = [
    {
      id: "user-1",
      role: "user",
      content: "Hello",
      timestamp: new Date("2024-01-01T12:00:00Z"),
    },
    {
      id: "assistant-1",
      role: "assistant",
      content: "Hi there!",
      timestamp: new Date("2024-01-01T12:01:00Z"),
    },
  ];

  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      root = null;
      rootMargin = "";
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  });

  it("renders empty state when no messages", () => {
    render(<MessageList messages={[]} />);

    expect(screen.getByText("Miko AI")).toBeInTheDocument();
    expect(screen.getByText(/Ask me anything about the portfolio/i)).toBeInTheDocument();
  });

  it("renders messages when provided", () => {
    render(<MessageList messages={mockMessages} />);

    expect(screen.getByTestId("message-user-1")).toBeInTheDocument();
    expect(screen.getByTestId("message-assistant-1")).toBeInTheDocument();
  });

  it("shows typing indicator on last assistant message when isTyping is true", () => {
    render(<MessageList messages={mockMessages} isTyping={true} />);

    const lastMessage = screen.getByTestId("message-assistant-1");
    expect(lastMessage).toHaveAttribute("data-typing", "true");
  });

  it("shows typing indicator when typing but no assistant message exists", () => {
    const userOnlyMessages: ChatMessage[] = [
      {
        id: "user-1",
        role: "user",
        content: "Hello",
        timestamp: new Date(),
      },
    ];

    render(<MessageList messages={userOnlyMessages} isTyping={true} />);

    // Should show typing indicator with avatar
    const typingIndicator = screen.getByAltText("Miko AI");
    expect(typingIndicator).toBeInTheDocument();
  });

  // Note: Clear button was moved to ChatContainer, so it's no longer in MessageList

  it("applies correct scrollbar classes", () => {
    const { container } = render(<MessageList messages={mockMessages} />);

    const scrollContainer = container.querySelector(".scrollbar");
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass("scrollbar-thin");
  });

  it("renders messages in correct order", () => {
    render(<MessageList messages={mockMessages} />);

    const messages = screen.getAllByTestId(/^message-/);
    expect(messages[0]).toHaveTextContent("Hello");
    expect(messages[1]).toHaveTextContent("Hi there!");
  });
});
