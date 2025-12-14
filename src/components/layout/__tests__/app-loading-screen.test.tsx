import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppLoadingScreen } from "../app-loading-screen";

// Mock DotLottieReact
vi.mock("@lottiefiles/dotlottie-react", () => ({
  DotLottieReact: ({ src, loop, autoplay, style }: {
    src: string;
    loop: boolean;
    autoplay: boolean;
    style: React.CSSProperties;
  }) => (
    <div
      data-testid="dotlottie-react"
      data-src={src}
      data-loop={loop.toString()}
      data-autoplay={autoplay.toString()}
      style={style}
    />
  ),
}));

describe("AppLoadingScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Set document.readyState to loading so component doesn't immediately hide
    Object.defineProperty(document, "readyState", {
      writable: true,
      value: "loading",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the loading screen initially", () => {
    render(<AppLoadingScreen />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toBeInTheDocument();
    expect(loadingScreen).toHaveClass("opacity-100");
  });

  it("displays the Lottie animation", () => {
    render(<AppLoadingScreen />);

    const animation = screen.getByTestId("dotlottie-react");
    expect(animation).toBeInTheDocument();
    expect(animation).toHaveAttribute("data-src", "/Skull_and_Bone_Turnaround.lottie");
    expect(animation).toHaveAttribute("data-loop", "true");
    expect(animation).toHaveAttribute("data-autoplay", "true");
  });

  it("has correct accessibility attributes", () => {
    render(<AppLoadingScreen />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toHaveAttribute("aria-label", "Loading application");
  });

  it("applies fixed positioning and full screen coverage", () => {
    render(<AppLoadingScreen />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toHaveClass("fixed", "inset-0", "z-[999999]");
  });

  it("centers the animation on screen", () => {
    render(<AppLoadingScreen />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toHaveClass("flex", "items-center", "justify-center");
  });

  it("has responsive animation size", () => {
    render(<AppLoadingScreen />);

    const animationContainer = screen.getByTestId("dotlottie-react").parentElement;
    expect(animationContainer).toHaveClass("w-64", "h-64", "md:w-80", "md:h-80");
  });

  it("uses default minimum display time when not provided", () => {
    render(<AppLoadingScreen />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toBeInTheDocument();
    // Component should be visible initially
    expect(loadingScreen).toHaveClass("opacity-100");
  });

  it("accepts custom minimum display time", () => {
    render(<AppLoadingScreen minimumDisplayTime={2000} />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toBeInTheDocument();
    expect(loadingScreen).toHaveClass("opacity-100");
  });

  it("has transition classes for fade-out", () => {
    render(<AppLoadingScreen />);

    const loadingScreen = screen.getByRole("status");
    expect(loadingScreen).toHaveClass("transition-opacity", "duration-300");
  });
});
