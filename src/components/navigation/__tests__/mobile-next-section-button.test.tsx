import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNextSectionButton } from "../mobile-next-section-button";
import { NAV_ITEMS } from "@/lib/constants";

// Mock usePathname
const mockUsePathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock NavigationContext
const mockTriggerNavigation = vi.fn();
let mockIsAnimating = false;

vi.mock("@/contexts/navigation-context", () => ({
  useNavigation: () => ({
    triggerNavigation: mockTriggerNavigation,
    isAnimating: mockIsAnimating,
  }),
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    className?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons - need to include all icons used in NAV_ITEMS
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  return {
    ...actual,
    ArrowRight: ({ className }: { className?: string }) => (
      <svg data-testid="arrow-right-icon" className={className} />
    ),
  };
});

describe("MobileNextSectionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    mockIsAnimating = false;
  });

  it("renders button with next section label when not on last page", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNextSectionButton />);

    const button = screen.getByText(NAV_ITEMS[1].label);
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("arrow-right-icon")).toBeInTheDocument();
  });

  it("renders button with next section label when on Contact page", () => {
    const contactIndex = NAV_ITEMS.findIndex(item => item.href === "/contact");
    mockUsePathname.mockReturnValue("/contact");
    render(<MobileNextSectionButton />);

    // Contact is not the last item anymore (AI Miko is after it)
    // So it should show the next item (AI Miko)
    const nextItem = NAV_ITEMS[contactIndex + 1];
    const button = screen.getByText(nextItem.label);
    expect(button).toBeInTheDocument();
  });

  it("calls triggerNavigation with correct href when clicked", async () => {
    const user = userEvent.setup();
    mockUsePathname.mockReturnValue("/");
    render(<MobileNextSectionButton />);

    const button = screen.getByText(NAV_ITEMS[1].label);
    await user.click(button);

    expect(mockTriggerNavigation).toHaveBeenCalledWith(NAV_ITEMS[1].href);
    expect(mockTriggerNavigation).toHaveBeenCalledTimes(1);
  });

  it("calls triggerNavigation with next section href when on Contact page", async () => {
    const user = userEvent.setup();
    const contactIndex = NAV_ITEMS.findIndex(item => item.href === "/contact");
    mockUsePathname.mockReturnValue("/contact");
    render(<MobileNextSectionButton />);

    const nextItem = NAV_ITEMS[contactIndex + 1];
    const button = screen.getByText(nextItem.label);
    await user.click(button);

    expect(mockTriggerNavigation).toHaveBeenCalledWith(nextItem.href);
  });

  it("does not render when pathname is not in NAV_ITEMS", () => {
    mockUsePathname.mockReturnValue("/unknown-route");
    const { container } = render(<MobileNextSectionButton />);

    expect(container.firstChild).toBeNull();
  });

  it("disables button when animation is in progress", () => {
    mockIsAnimating = true;
    mockUsePathname.mockReturnValue("/");
    render(<MobileNextSectionButton />);

    const button = screen.getByText(NAV_ITEMS[1].label);
    expect(button).toBeDisabled();
  });

  it("renders with correct styling classes", () => {
    mockUsePathname.mockReturnValue("/");
    render(<MobileNextSectionButton />);

    const button = screen.getByText(NAV_ITEMS[1].label);
    expect(button).toHaveClass("border-primary/30");
    expect(button).toHaveClass("text-primary");
    expect(button).toHaveClass("font-mono");
  });

  it("renders only on mobile (md:hidden)", () => {
    mockUsePathname.mockReturnValue("/");
    const { container } = render(<MobileNextSectionButton />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("md:hidden");
  });

  it("shows correct next section for each page", () => {
    NAV_ITEMS.forEach((item, index) => {
      if (index === NAV_ITEMS.length - 1) return; // Skip last item

      mockUsePathname.mockReturnValue(item.href);
      const { unmount } = render(<MobileNextSectionButton />);

      const nextItem = NAV_ITEMS[index + 1];
      expect(screen.getByText(nextItem.label)).toBeInTheDocument();
      unmount();
    });
  });

  it("shows Overview button when on last page (AI Miko)", () => {
    const lastIndex = NAV_ITEMS.length - 1;
    mockUsePathname.mockReturnValue(NAV_ITEMS[lastIndex].href);
    render(<MobileNextSectionButton />);

    // Should show Overview (first item) when on last page
    const button = screen.getByText(NAV_ITEMS[0].label);
    expect(button).toBeInTheDocument();
  });
});

