import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OverviewPage from "../page";

// Mock child components
vi.mock("@/components/dashboard/overview-metrics", () => ({
  OverviewMetrics: () => <div data-testid="overview-metrics">Overview Metrics</div>,
}));

vi.mock("@/components/dashboard/projects-grid", () => ({
  ProjectsGrid: () => <div data-testid="projects-grid">Projects Grid</div>,
}));

vi.mock("@/components/dashboard/easter-egg-button", () => ({
  EasterEggButton: () => <div data-testid="easter-egg-button">Easter Egg Button</div>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className?: string }) => (
    <hr data-testid="separator" className={className} />
  ),
}));

vi.mock("@/components/navigation/mobile-next-section-button", () => ({
  MobileNextSectionButton: () => <div data-testid="mobile-next-section-button" />,
}));

describe("OverviewPage", () => {
  it("renders page title and subtitle", () => {
    render(<OverviewPage />);

    expect(screen.getByText("Activity Overview")).toBeInTheDocument();
    expect(screen.getByText("Tracking contributions and status updates.")).toBeInTheDocument();
  });

  it("renders OverviewMetrics component", () => {
    render(<OverviewPage />);

    expect(screen.getByTestId("overview-metrics")).toBeInTheDocument();
  });

  it("renders EasterEggButton component", () => {
    render(<OverviewPage />);

    expect(screen.getByTestId("easter-egg-button")).toBeInTheDocument();
  });

  it("renders Separator component", () => {
    render(<OverviewPage />);

    const separator = screen.getByTestId("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass("my-2", "opacity-50");
  });

  it("renders Featured Projects section", () => {
    render(<OverviewPage />);

    expect(screen.getByText("Featured Projects")).toBeInTheDocument();
    expect(screen.getByTestId("projects-grid")).toBeInTheDocument();
  });

  it("renders MobileNextSectionButton component", () => {
    render(<OverviewPage />);

    expect(screen.getByTestId("mobile-next-section-button")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(<OverviewPage />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("flex", "flex-col", "gap-8", "fade-in-bottom", "md:pb-8");
  });
});
