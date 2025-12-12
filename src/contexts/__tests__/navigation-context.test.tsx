import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { NavigationProvider, useNavigation } from "../navigation-context";
import { ANIMATION_PHASE, ANIMATION_CONFIG } from "@/components/layout/sidebar/constants";

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
}));

// Test component that uses the navigation context
function TestComponent() {
  const { triggerNavigation, animationPhase, isAnimating } = useNavigation();

  return (
    <div>
      <button onClick={() => triggerNavigation("/projects")} data-testid="trigger-btn">
        Navigate
      </button>
      <div data-testid="animation-phase">{animationPhase}</div>
      <div data-testid="is-animating">{isAnimating.toString()}</div>
    </div>
  );
}

describe("NavigationContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("provides initial idle state", () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    expect(screen.getByTestId("animation-phase")).toHaveTextContent(ANIMATION_PHASE.IDLE);
    expect(screen.getByTestId("is-animating")).toHaveTextContent("false");
  });

  it("triggers navigation and updates animation phase", async () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const button = screen.getByTestId("trigger-btn");

    act(() => {
      button.click();
    });

    // Should immediately move to MOVING_RIGHT (synchronous state update)
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByTestId("animation-phase")).toHaveTextContent(ANIMATION_PHASE.MOVING_RIGHT);
    expect(screen.getByTestId("is-animating")).toHaveTextContent("true");
  });

  it("calls router.push after navigation delay", () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const button = screen.getByTestId("trigger-btn");

    act(() => {
      button.click();
    });

    // Should not have called push yet
    expect(mockPush).not.toHaveBeenCalled();

    // Fast-forward to navigation delay
    act(() => {
      vi.advanceTimersByTime(ANIMATION_CONFIG.NAVIGATION_DELAY);
    });

    expect(mockPush).toHaveBeenCalledWith("/projects");
  });

  it("does not trigger navigation if already on target route", () => {
    mockPathname.mockReturnValue("/projects");

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const button = screen.getByTestId("trigger-btn");
    button.click();

    // Should remain idle
    expect(screen.getByTestId("animation-phase")).toHaveTextContent(ANIMATION_PHASE.IDLE);
    expect(mockPush).not.toHaveBeenCalled();

    // Reset for other tests
    mockPathname.mockReturnValue("/");
  });

  it("does not start new animation if one is already in progress", () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const button = screen.getByTestId("trigger-btn");

    // First click
    act(() => {
      button.click();
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByTestId("animation-phase")).toHaveTextContent(ANIMATION_PHASE.MOVING_RIGHT);

    // Advance timers to trigger the first router.push
    act(() => {
      vi.advanceTimersByTime(ANIMATION_CONFIG.NAVIGATION_DELAY);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);

    // Second click while animating (should be ignored)
    act(() => {
      button.click();
    });

    // Should still be in MOVING_RIGHT, not restart
    expect(screen.getByTestId("animation-phase")).toHaveTextContent(ANIMATION_PHASE.MOVING_RIGHT);
    // Should still be only 1 call
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("isAnimating returns true when not idle", () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const button = screen.getByTestId("trigger-btn");

    act(() => {
      button.click();
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByTestId("is-animating")).toHaveTextContent("true");
  });

  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNavigation must be used within a NavigationProvider");

    consoleSpy.mockRestore();
  });
});
