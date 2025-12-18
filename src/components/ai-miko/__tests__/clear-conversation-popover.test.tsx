import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ClearConversationPopover } from "../clear-conversation-popover";

// Mock Popover components - simplified controlled component
let mockOpenState = false;
let mockOnOpenChange: ((open: boolean) => void) | null = null;

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children, open, onOpenChange }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    mockOpenState = open;
    mockOnOpenChange = onOpenChange;
    return (
      <div data-testid="popover" data-open={open.toString()}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ __popoverOpen?: boolean; __popoverOnOpenChange?: (open: boolean) => void }>, {
              __popoverOpen: open,
              __popoverOnOpenChange: onOpenChange,
            });
          }
          return child;
        })}
      </div>
    );
  },
  PopoverTrigger: ({ children, asChild, __popoverOpen, __popoverOnOpenChange }: {
    children: React.ReactNode;
    asChild?: boolean;
    __popoverOpen?: boolean;
    __popoverOnOpenChange?: (open: boolean) => void;
  }) => {
    const handleClick = () => {
      const currentOpen = __popoverOpen ?? mockOpenState;
      const onOpenChange = __popoverOnOpenChange ?? mockOnOpenChange;
      if (onOpenChange) {
        onOpenChange(!currentOpen);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onClick?: () => void; "data-testid"?: string }>, {
        onClick: handleClick,
        "data-testid": "popover-trigger"
      });
    }

    return (
      <div
        data-testid="popover-trigger"
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {children}
      </div>
    );
  },
  PopoverContent: ({ children, align, __popoverOpen }: {
    children: React.ReactNode;
    align?: string;
    __popoverOpen?: boolean;
  }) => {
    const isOpen = __popoverOpen ?? mockOpenState;
    return isOpen ? (
      <div data-testid="popover-content" data-align={align}>
        {children}
      </div>
    ) : null;
  },
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

describe("ClearConversationPopover", () => {
  beforeEach(() => {
    // Reset any state
    vi.clearAllMocks();
  });

  it("renders trigger button", () => {
    const onClear = vi.fn();
    render(<ClearConversationPopover onClear={onClear} />);

    expect(screen.getByText("Clear conversation")).toBeInTheDocument();
  });

  it("opens popover when trigger is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ClearConversationPopover onClear={onClear} />);

    const trigger = screen.getByText("Clear conversation");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    });
  });

  it("displays confirmation message in popover", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ClearConversationPopover onClear={onClear} />);

    const trigger = screen.getByText("Clear conversation");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Clear conversation?")).toBeInTheDocument();
      expect(screen.getByText(/This will permanently delete all messages/i)).toBeInTheDocument();
    });
  });

  it("calls onClear when Clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ClearConversationPopover onClear={onClear} />);

    const trigger = screen.getByText("Clear conversation");
    await user.click(trigger);

    await waitFor(async () => {
      const clearButton = screen.getByText("Clear");
      await user.click(clearButton);
    });

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("closes popover when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ClearConversationPopover onClear={onClear} />);

    const trigger = screen.getByText("Clear conversation");
    await user.click(trigger);

    await waitFor(async () => {
      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();
    });

    expect(onClear).not.toHaveBeenCalled();
  });

  it("does not call onClear when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ClearConversationPopover onClear={onClear} />);

    const trigger = screen.getByText("Clear conversation");
    await user.click(trigger);

    await waitFor(async () => {
      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);
    });

    expect(onClear).not.toHaveBeenCalled();
  });
});
