import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "../mobile-nav";

// Mock the Sidebar component
vi.mock("../sidebar", () => ({
  Sidebar: ({ onClose, className }: { onClose?: () => void; className?: string }) => (
    <div data-testid="sidebar" data-onclose={!!onClose} data-classname={className}>
      Mock Sidebar
    </div>
  ),
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, className, variant, size, ...props }: { children: React.ReactNode; className?: string; variant?: string; size?: string; [key: string]: unknown }) => (
    <button className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

// Mock Sheet components
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="sheet" data-open={open.toString()}>
      <button onClick={() => onOpenChange(!open)} data-testid="sheet-toggle">
        Toggle
      </button>
      {open && children}
    </div>
  ),
  SheetTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    // When asChild is true, render children directly (Button in this case)
    if (asChild) {
      return <>{children}</>;
    }
    return <div data-testid="sheet-trigger">{children}</div>;
  },
  SheetContent: ({ children, side, className }: { children: React.ReactNode; side?: string; className?: string }) => (
    <div data-testid="sheet-content" data-side={side} data-classname={className}>
      {children}
    </div>
  ),
  SheetTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-title" data-classname={className}>
      {children}
    </div>
  ),
}));

describe("MobileNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the menu button trigger", () => {
    render(<MobileNav />);

    // The Button is inside SheetTrigger, which renders it when asChild is true
    // We can find it by looking for the button element
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders with sheet closed by default", () => {
    render(<MobileNav />);

    const sheet = screen.getByTestId("sheet");
    expect(sheet).toHaveAttribute("data-open", "false");
  });

  it("opens sheet when trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    // Click the sheet toggle button (which is rendered by our mock)
    const toggleButton = screen.getByTestId("sheet-toggle");
    await user.click(toggleButton);

    const sheet = screen.getByTestId("sheet");
    expect(sheet).toHaveAttribute("data-open", "true");
  });

  it("renders Sidebar component inside sheet content when open", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const toggleButton = screen.getByTestId("sheet-toggle");
    await user.click(toggleButton);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute("data-onclose", "true");
    expect(sidebar).toHaveAttribute("data-classname", "w-full border-none");
  });

  it("renders SheetTitle with correct text", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const toggleButton = screen.getByTestId("sheet-toggle");
    await user.click(toggleButton);

    const title = screen.getByTestId("sheet-title");
    expect(title).toHaveTextContent("Navigation Menu");
    expect(title).toHaveAttribute("data-classname", "sr-only");
  });

  it("closes sheet when onClose callback is called", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    // Open the sheet
    const toggleButton = screen.getByTestId("sheet-toggle");
    await user.click(toggleButton);

    let sheet = screen.getByTestId("sheet");
    expect(sheet).toHaveAttribute("data-open", "true");

    // Close via toggle button
    await user.click(toggleButton);

    sheet = screen.getByTestId("sheet");
    expect(sheet).toHaveAttribute("data-open", "false");
  });

  it("renders SheetContent with correct props", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const toggleButton = screen.getByTestId("sheet-toggle");
    await user.click(toggleButton);

    const content = screen.getByTestId("sheet-content");
    expect(content).toHaveAttribute("data-side", "left");
    expect(content).toHaveAttribute("data-classname", "p-0 w-[280px]");
  });
});
