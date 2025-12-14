import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "../chat-input";

// Mock Button and Textarea components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, type, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, onKeyDown, placeholder, disabled, className, ref }: {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    ref?: React.Ref<HTMLTextAreaElement>;
  }) => (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Send: ({ className }: { className?: string }) => <svg data-testid="send-icon" className={className} />,
  Square: ({ className }: { className?: string }) => <svg data-testid="stop-icon" className={className} />,
}));

describe("ChatInput", () => {
  const mockOnSendMessage = vi.fn();
  const mockOnStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textarea with placeholder", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    expect(textarea).toBeInTheDocument();
  });

  it("renders custom placeholder when provided", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
  });

  it("renders Send button by default", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    expect(screen.getByTestId("send-icon")).toBeInTheDocument();
    expect(screen.getByText("Send message")).toBeInTheDocument();
  });

  it("renders Stop button when isTyping is true", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} onStop={mockOnStop} isTyping={true} />);

    expect(screen.getByTestId("stop-icon")).toBeInTheDocument();
    expect(screen.getByText("Stop generating")).toBeInTheDocument();
  });

  it("calls onSendMessage when form is submitted with message", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    await user.type(textarea, "Hello");

    const form = textarea.closest("form");
    if (form) {
      await user.click(screen.getByRole("button"));
    }

    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello");
  });

  it("does not call onSendMessage when message is empty", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("trims message before sending", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    await user.type(textarea, "  Hello World  ");

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello World");
  });

  it("calls onStop when Stop button is clicked", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} onStop={mockOnStop} isTyping={true} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnStop).toHaveBeenCalledTimes(1);
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("sends message on Enter key press", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    await user.type(textarea, "Hello{Enter}");

    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello");
  });

  it("does not send message on Shift+Enter", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    await user.type(textarea, "Hello");
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("disables textarea when isTyping is true", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isTyping={true} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    expect(textarea).toBeDisabled();
  });

  it("disables textarea when disabled prop is true", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    expect(textarea).toBeDisabled();
  });

  it("disables button when message is empty and not typing", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("enables button when message is not empty", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText("Message Miko AI...");
    await user.type(textarea, "Hello");

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("applies correct styling classes to Stop button", () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} onStop={mockOnStop} isTyping={true} />);

    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-500/10");
    expect(button.className).toContain("border-red-500/20");
    expect(button.className).toContain("text-red-500");
  });
});

