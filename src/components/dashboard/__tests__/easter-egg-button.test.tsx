import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EasterEggButton } from "../easter-egg-button";

// Mock Dialog components - simplified to work with the component structure
let dialogOnOpenChange: ((open: boolean) => void) | null = null;

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => {
    dialogOnOpenChange = onOpenChange;

    const childrenArray = React.Children.toArray(children);
    const trigger = childrenArray.find((child): child is React.ReactElement => {
      if (!React.isValidElement(child)) return false;
      if (typeof child.type === 'function' && child.type.name === "DialogTrigger") return true;
      if (child.props && typeof child.props === 'object' && child.props !== null && 'asChild' in child.props) return true;
      return false;
    });
    const content = childrenArray.find((child): child is React.ReactElement =>
      React.isValidElement(child) &&
      typeof child.type === 'function' && child.type.name === "DialogContent"
    );

    return (
      <div data-testid="dialog" data-open={open.toString()}>
        {trigger}
        {open && content}
        <button onClick={() => onOpenChange(false)} data-testid="dialog-close-button">
          Close
        </button>
      </div>
    );
  },
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    const handleClick = () => {
      if (dialogOnOpenChange) {
        dialogOnOpenChange(true);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { onClick: handleClick } as Partial<unknown>);
    }
    return (
      <div data-testid="dialog-trigger" onClick={handleClick}>
        {children}
      </div>
    );
  },
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" data-classname={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-title" data-classname={className}>
      {children}
    </div>
  ),
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, className, variant, ...props }: { children: React.ReactNode; className?: string; variant?: string; [key: string]: unknown }) => (
    <button className={className} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-triangle-icon" className={className} />
  ),
}));

describe("EasterEggButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dialogOnOpenChange = null;
  });

  it("renders the button with correct text and icon", () => {
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i);
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
  });

  it("renders button with correct styling classes", () => {
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      expect(button).toHaveClass("border-[var(--neon-red)]/30");
      expect(button).toHaveClass("text-[var(--neon-red)]");
      expect(button).toHaveClass("font-mono");
    }
  });

  it("opens dialog when button is clicked", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    // Dialog should be open
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("data-open", "true");
  });

  it("displays dialog content when open", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    // Dialog content should be visible
    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
  });

  it("displays correct dialog title", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    const title = screen.getByTestId("dialog-title");
    expect(title).toHaveTextContent("Portfolio Presentation");
  });

  it("displays video player in dialog", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    if (video) {
      expect(video).toHaveAttribute("src", "/Portfolio_Presentation.mp4");
      expect(video).toHaveAttribute("controls");
      expect(video).toHaveAttribute("autoPlay");
    }
  });

  it("closes dialog when onOpenChange is called", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    // Open dialog
    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    let dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("data-open", "true");

    // Close dialog via close button
    const closeButton = screen.getByTestId("dialog-close-button");
    await user.click(closeButton);

    dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("data-open", "false");
  });

  it("renders dialog with correct className", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    const content = screen.getByTestId("dialog-content");
    expect(content).toHaveAttribute("data-classname", "max-w-4xl bg-card/95 backdrop-blur border-primary/20");
  });

  it("video container has correct styling", async () => {
    const user = userEvent.setup();
    render(<EasterEggButton />);

    const button = screen.getByText(/don't click this/i).closest("button");
    expect(button).toBeInTheDocument();
    if (button) {
      await user.click(button);
    }

    // Video should be in a container with aspect-video class
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    if (video) {
      const container = video.closest(".aspect-video");
      expect(container).toBeInTheDocument();
    }
  });
});
