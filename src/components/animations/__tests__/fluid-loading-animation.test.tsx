import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FluidLoadingAnimation } from "../fluid-loading-animation";

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

describe("FluidLoadingAnimation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the animation component", () => {
    render(<FluidLoadingAnimation />);

    const animation = screen.getByTestId("dotlottie-react");
    expect(animation).toBeInTheDocument();
  });

  it("uses default width and height when not provided", () => {
    render(<FluidLoadingAnimation />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveStyle({ width: "200px", height: "200px" });
  });

  it("uses custom width and height when provided", () => {
    render(<FluidLoadingAnimation width="300px" height="300px" />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveStyle({ width: "300px", height: "300px" });
  });

  it("uses numeric width and height when provided", () => {
    render(<FluidLoadingAnimation width={400} height={400} />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveStyle({ width: "400px", height: "400px" });
  });

  it("applies custom className when provided", () => {
    render(<FluidLoadingAnimation className="custom-class" />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("applies custom style when provided", () => {
    const customStyle = { position: "absolute" as const, top: "10px" };
    render(<FluidLoadingAnimation style={customStyle} />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveStyle({ position: "absolute", top: "10px" });
  });

  it("has pointer-events-none on container", () => {
    render(<FluidLoadingAnimation />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveStyle({ pointerEvents: "none" });
  });

  it("passes correct props to DotLottieReact", () => {
    render(<FluidLoadingAnimation />);

    const animation = screen.getByTestId("dotlottie-react");
    expect(animation).toHaveAttribute("data-src", "/Skull_and_Bone_Turnaround.lottie");
    expect(animation).toHaveAttribute("data-loop", "true");
    expect(animation).toHaveAttribute("data-autoplay", "true");
  });

  it("applies 100% width and height to DotLottieReact", () => {
    render(<FluidLoadingAnimation />);

    const animation = screen.getByTestId("dotlottie-react");
    expect(animation).toHaveStyle({ width: "100%", height: "100%" });
  });

  it("merges custom style with default pointer-events-none", () => {
    const customStyle = { zIndex: 10 };
    render(<FluidLoadingAnimation style={customStyle} />);

    const container = screen.getByTestId("dotlottie-react").parentElement;
    expect(container).toHaveStyle({
      pointerEvents: "none",
      zIndex: "10"
    });
  });
});
