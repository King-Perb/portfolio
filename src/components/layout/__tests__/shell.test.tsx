import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Shell } from "../shell";

// Mock child components
vi.mock("../sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar">Mock Sidebar</div>,
}));

vi.mock("../mobile-nav", () => ({
  MobileNav: () => <div data-testid="mobile-nav">Mock MobileNav</div>,
}));

describe("Shell", () => {
  it("renders children in main content area", () => {
    render(
      <Shell>
        <div data-testid="test-content">Test Content</div>
      </Shell>
    );
    
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders mobile navigation in mobile top bar", () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
  });

  it("renders desktop sidebar", () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders portfolio title in mobile top bar", () => {
    render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    
    expect(screen.getByText("MIKO'S PORTFOLIO")).toBeInTheDocument();
  });

  it("renders main element with correct structure", () => {
    const { container } = render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("flex-1", "overflow-y-auto");
  });

  it("renders container with max-width in main content", () => {
    const { container } = render(
      <Shell>
        <div>Content</div>
      </Shell>
    );
    
    const containerDiv = container.querySelector("main > div");
    expect(containerDiv).toHaveClass("container", "max-w-5xl", "mx-auto");
  });

  it("renders multiple children correctly", () => {
    render(
      <Shell>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </Shell>
    );
    
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });
});

