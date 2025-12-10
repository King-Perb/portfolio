import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock child components
vi.mock("@/components/dashboard/overview-metrics", () => ({
  OverviewMetrics: () => <div data-testid="overview-metrics">Overview Metrics</div>,
}));

vi.mock("@/components/dashboard/projects-grid", () => ({
  ProjectsGrid: () => <div data-testid="projects-grid">Projects Grid</div>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className?: string }) => (
    <hr data-testid="separator" data-classname={className} />
  ),
}));

describe("Home Page", () => {
  it("renders the page title and description", () => {
    render(<Home />);

    expect(screen.getByText("Activity Overview")).toBeInTheDocument();
    expect(screen.getByText("Tracking contributions and status updates.")).toBeInTheDocument();
  });

  it("renders OverviewMetrics component", () => {
    render(<Home />);

    expect(screen.getByTestId("overview-metrics")).toBeInTheDocument();
  });

  it("renders ProjectsGrid component", () => {
    render(<Home />);

    expect(screen.getByTestId("projects-grid")).toBeInTheDocument();
  });

  it("renders separator between metrics and projects", () => {
    render(<Home />);

    const separator = screen.getByTestId("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-classname", "my-2 opacity-50");
  });

  it("renders Featured Projects section heading", () => {
    render(<Home />);

    expect(screen.getByText("Featured Projects")).toBeInTheDocument();
  });

  it("renders all sections in correct order", () => {
    render(<Home />);

    const heading = screen.getByText("Activity Overview");
    const metrics = screen.getByTestId("overview-metrics");
    const separator = screen.getByTestId("separator");
    const featuredHeading = screen.getByText("Featured Projects");
    const projects = screen.getByTestId("projects-grid");

    // Check that elements are in the DOM
    expect(heading).toBeInTheDocument();
    expect(metrics).toBeInTheDocument();
    expect(separator).toBeInTheDocument();
    expect(featuredHeading).toBeInTheDocument();
    expect(projects).toBeInTheDocument();
  });
});
