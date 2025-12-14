import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "../message-bubble";
import type { ChatMessage } from "@/types/chat";

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, sizes, className, priority }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
  }) => (
    <img src={src} alt={alt} data-fill={fill?.toString()} data-sizes={sizes} className={className} data-priority={priority?.toString()} />
  ),
}));

// Mock Avatar components
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="avatar-image" />
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>{children}</div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Bot: ({ className }: { className?: string }) => <svg data-testid="bot-icon" className={className} />,
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  USER_PROFILE: {
    name: "Miko",
    avatarUrl: "/portfolio-logo-small.png",
  },
}));

describe("MessageBubble", () => {
  const mockUserMessage: ChatMessage = {
    id: "user-1",
    role: "user",
    content: "Hello, how are you?",
    timestamp: new Date("2024-01-01T12:00:00Z"),
  };

  const mockAssistantMessage: ChatMessage = {
    id: "assistant-1",
    role: "assistant",
    content: "I'm doing well, thank you!",
    timestamp: new Date("2024-01-01T12:01:00Z"),
  };

  it("renders user message correctly", () => {
    render(<MessageBubble message={mockUserMessage} />);

    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("renders assistant message correctly", () => {
    render(<MessageBubble message={mockAssistantMessage} />);

    expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();
    expect(screen.getByAltText("AI Miko")).toBeInTheDocument();
  });

  it("aligns user message to the right", () => {
    const { container } = render(<MessageBubble message={mockUserMessage} />);

    const messageDiv = container.firstChild as HTMLElement;
    expect(messageDiv).toHaveClass("justify-end");
  });

  it("aligns assistant message to the left", () => {
    const { container } = render(<MessageBubble message={mockAssistantMessage} />);

    const messageDiv = container.firstChild as HTMLElement;
    expect(messageDiv).toHaveClass("justify-start");
  });

  it("applies user message styling", () => {
    render(<MessageBubble message={mockUserMessage} />);

    const content = screen.getByText("Hello, how are you?").parentElement;
    expect(content).toHaveClass("bg-primary/10", "text-primary");
  });

  it("applies assistant message styling", () => {
    render(<MessageBubble message={mockAssistantMessage} />);

    const content = screen.getByText("I'm doing well, thank you!").parentElement;
    expect(content).toHaveClass("bg-card/80", "text-foreground");
  });

  it("displays typing indicator when isTyping is true", () => {
    render(<MessageBubble message={mockAssistantMessage} isTyping={true} />);

    const dots = screen.getAllByRole("generic").filter(el =>
      el.className.includes("animate-bounce") && el.className.includes("bg-primary/50")
    );
    expect(dots.length).toBeGreaterThan(0);
  });

  it("shows 'Thinking...' when content is empty and isTyping is true", () => {
    const emptyMessage: ChatMessage = {
      id: "assistant-1",
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    render(<MessageBubble message={emptyMessage} isTyping={true} />);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("displays timestamp", () => {
    render(<MessageBubble message={mockUserMessage} />);

    // Timestamp should be rendered (format may vary)
    const timestamp = screen.getByText(/\d{1,2}:\d{2}\s*(AM|PM)?/i);
    expect(timestamp).toBeInTheDocument();
  });

  it("displays sources when provided", () => {
    const messageWithSources: ChatMessage = {
      id: "assistant-1",
      role: "assistant",
      content: "Here's some info",
      timestamp: new Date(),
      sources: ["Document 1", "Document 2"],
    };

    render(<MessageBubble message={messageWithSources} />);

    expect(screen.getByText("Document 1")).toBeInTheDocument();
    expect(screen.getByText("Document 2")).toBeInTheDocument();
  });

  it("does not render content bubble when content is empty and not typing", () => {
    const emptyMessage: ChatMessage = {
      id: "assistant-1",
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    render(<MessageBubble message={emptyMessage} />);

    expect(screen.queryByText("Thinking...")).not.toBeInTheDocument();
  });

  it("uses user avatar image for user messages", () => {
    render(<MessageBubble message={mockUserMessage} />);

    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toHaveAttribute("src", "/chat-user-pic.png");
    expect(avatarImage).toHaveAttribute("alt", "Miko");
  });

  it("uses AI avatar image for assistant messages", () => {
    render(<MessageBubble message={mockAssistantMessage} />);

    const avatarImage = screen.getByAltText("AI Miko");
    expect(avatarImage).toBeInTheDocument();
  });
});
