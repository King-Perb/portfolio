import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { PageTransitionLine } from "../page-transition-line";
import { ANIMATION_PHASE } from "../sidebar/constants";
import * as ReactDOM from "react-dom";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, style, initial, animate, transition }: {
      children: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
      initial?: Record<string, unknown>;
      animate?: Record<string, unknown>;
      transition?: Record<string, unknown>;
    }) => (
      <div
        className={className}
        style={style}
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
      >
        {children}
      </div>
    ),
  },
}));

// Mock FluidLoadingAnimation
vi.mock("@/components/animations/fluid-loading-animation", () => ({
  FluidLoadingAnimation: () => <div data-testid="fluid-animation">Loading</div>,
}));

// Mock createPortal - define mock function inside factory
vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof ReactDOM>("react-dom");
  return {
    ...actual,
    createPortal: vi.fn((element) => element),
  };
});

describe("PageTransitionLine", () => {
  let mockCreatePortal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.body
    document.body.innerHTML = "";
    // Get the mocked createPortal function
    mockCreatePortal = vi.mocked(ReactDOM.createPortal);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when animationPhase is IDLE", () => {
    const { container } = render(<PageTransitionLine animationPhase={ANIMATION_PHASE.IDLE} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders portal when mounted and animating", async () => {
    // Component uses startTransition which might delay mounting
    render(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_RIGHT} />);

    // Wait for startTransition to complete
    await new Promise(resolve => setTimeout(resolve, 10));

    // Component should render after mount effect
    expect(mockCreatePortal).toHaveBeenCalled();
  });

  it("creates portal to document.body", async () => {
    render(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_RIGHT} />);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockCreatePortal).toHaveBeenCalledWith(
      expect.anything(),
      document.body
    );
  });

  it("renders overlay and line when animating", async () => {
    render(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_RIGHT} />);

    await new Promise(resolve => setTimeout(resolve, 10));

    // Portal should be called with the transition element
    expect(mockCreatePortal).toHaveBeenCalled();
  });

  it("handles MOVING_RIGHT phase", async () => {
    render(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_RIGHT} />);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockCreatePortal).toHaveBeenCalled();
  });

  it("handles MOVING_BACK phase", async () => {
    render(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_BACK} />);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockCreatePortal).toHaveBeenCalled();
  });

  it("handles phase transitions", async () => {
    const { rerender } = render(<PageTransitionLine animationPhase={ANIMATION_PHASE.IDLE} />);

    // Should not render when idle
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockCreatePortal).not.toHaveBeenCalled();

    // Change to MOVING_RIGHT
    rerender(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_RIGHT} />);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockCreatePortal).toHaveBeenCalled();

    // Change to MOVING_BACK
    rerender(<PageTransitionLine animationPhase={ANIMATION_PHASE.MOVING_BACK} />);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockCreatePortal).toHaveBeenCalledTimes(2);

    // Back to IDLE
    rerender(<PageTransitionLine animationPhase={ANIMATION_PHASE.IDLE} />);
    await new Promise(resolve => setTimeout(resolve, 10));
    // Should not render new portal when idle
  });
});
