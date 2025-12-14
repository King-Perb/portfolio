import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypingIndicator } from "../typing-indicator";

// Mock Avatar components
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Bot: ({ className }: { className?: string }) => (
    <svg data-testid="bot-icon" className={className} />
  ),
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  USER_PROFILE: {
    name: "Miko",
    avatarUrl: "/portfolio-logo-small.png",
  },
}));

describe("TypingIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders avatar with correct image", () => {
    render(<TypingIndicator />);

    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute("src", "/portfolio-logo-small.png");
    expect(avatarImage).toHaveAttribute("alt", "AI Miko");
  });

  it("renders avatar fallback with bot icon", () => {
    render(<TypingIndicator />);

    const avatarFallback = screen.getByTestId("avatar-fallback");
    expect(avatarFallback).toBeInTheDocument();
    expect(avatarFallback).toHaveClass("bg-primary/10", "text-primary");

    const botIcon = screen.getByTestId("bot-icon");
    expect(botIcon).toBeInTheDocument();
  });

  it("renders three animated dots", () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll(".animate-bounce");
    expect(dots).toHaveLength(3);
  });

  it("applies correct animation delays to dots", () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll(".animate-bounce");

    // Check for animation delay classes
    const firstDot = dots[0] as HTMLElement;
    const secondDot = dots[1] as HTMLElement;
    const thirdDot = dots[2] as HTMLElement;

    expect(firstDot).toHaveClass("[animation-delay:-0.3s]");
    expect(secondDot).toHaveClass("[animation-delay:-0.15s]");
    // Third dot has no delay (default)
  });

  it("renders dots with correct styling", () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll(".h-2.w-2.bg-primary\\/50.rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it("renders message bubble container", () => {
    const { container } = render(<TypingIndicator />);

    const bubble = container.querySelector(".bg-card\\/80.border.border-primary\\/20.rounded-2xl");
    expect(bubble).toBeInTheDocument();
  });

  it("applies correct layout classes", () => {
    const { container } = render(<TypingIndicator />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "gap-4", "px-4", "py-6");
  });

  it("renders avatar with correct styling", () => {
    render(<TypingIndicator />);

    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("h-8", "w-8", "border", "border-primary/20", "shrink-0");
  });
});
