import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AIMikoPage from "../page";

// Mock ChatContainer
vi.mock("@/components/ai-miko/chat-container", () => ({
  ChatContainer: () => <div data-testid="chat-container">Chat Container</div>,
}));

describe("AIMikoPage", () => {
  it("renders ChatContainer component", () => {
    render(<AIMikoPage />);

    expect(screen.getByTestId("chat-container")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(<AIMikoPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("flex", "flex-col", "flex-1", "min-h-0", "fade-in-bottom");
  });
});
