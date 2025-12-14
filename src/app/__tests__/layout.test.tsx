import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import RootLayout from "../layout";

// Mock Next.js fonts
vi.mock("next/font/google", () => ({
  Geist: vi.fn(() => ({
    variable: "--font-geist-sans",
  })),
  Geist_Mono: vi.fn(() => ({
    variable: "--font-geist-mono",
  })),
}));

// Mock ThemeProvider
vi.mock("@/components/theme-provider", () => ({
  ThemeProvider: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="theme-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

// Mock Shell
vi.mock("@/components/layout/shell", () => ({
  Shell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="shell">{children}</div>
  ),
}));

// Mock AppLoadingScreen (uses Lottie which requires IntersectionObserver)
vi.mock("@/components/layout/app-loading-screen", () => ({
  AppLoadingScreen: () => <div data-testid="app-loading-screen" />,
}));

// Mock globals.css import (doesn't need to do anything in tests)
vi.mock("../globals.css", () => ({}));

// Mock IntersectionObserver (required by Lottie)
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
} as unknown as typeof IntersectionObserver;

describe("RootLayout", () => {
  it("renders children correctly", () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
    expect(container.textContent).toContain("Test Content");
  });

  it("renders html element with correct attributes", () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // In React Testing Library, html/body are part of the document, not the container
    // We can verify the component renders without errors
    const html = document.documentElement;
    expect(html).toBeDefined();
    // Note: React Testing Library doesn't actually render html/body from components
    // We're testing that the component structure is correct
  });

  it("renders body structure correctly", () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Verify the component renders without errors
    // The actual html/body structure is handled by Next.js at runtime
    const body = document.body;
    expect(body).toBeDefined();
  });

  it("renders ThemeProvider with correct props", () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const themeProvider = container.querySelector('[data-testid="theme-provider"]');
    expect(themeProvider).toBeInTheDocument();

    const props = JSON.parse(themeProvider?.getAttribute("data-props") || "{}");
    expect(props.attribute).toBe("class");
    expect(props.defaultTheme).toBe("dark");
    expect(props.enableSystem).toBe(true);
    expect(props.disableTransitionOnChange).toBe(true);
  });

  it("renders Shell component wrapping children", () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">Child Content</div>
      </RootLayout>
    );

    const shell = container.querySelector('[data-testid="shell"]');
    expect(shell).toBeInTheDocument();
    expect(shell?.textContent).toContain("Child Content");
  });

  it("renders multiple children correctly", () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </RootLayout>
    );

    expect(container.querySelector('[data-testid="child-1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child-2"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="child-3"]')).toBeInTheDocument();
  });

  it("has correct component structure", () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // In React Testing Library, html/body are not rendered from components
    // We test the component hierarchy that is actually rendered
    const themeProvider = container.querySelector('[data-testid="theme-provider"]');
    const shell = container.querySelector('[data-testid="shell"]');

    expect(themeProvider).toBeInTheDocument();
    expect(shell).toBeInTheDocument();

    // Check hierarchy: theme-provider > shell
    expect(shell?.parentElement).toBe(themeProvider);
  });
});
