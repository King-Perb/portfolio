import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverviewMetrics } from "../overview-metrics";

// Mock fetch globally
global.fetch = vi.fn();

describe("OverviewMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  it("renders mock metrics when GitHub API fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("API Error"));

    const component = await OverviewMetrics();
    const { container } = render(component);

    // Should render mock metrics (from MOCK_METRICS)
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders GitHub metrics when API succeeds", async () => {
    const mockStats = {
      commitsLastMonth: 42,
      totalRepos: 10,
      totalCommits: 500,
      repoDeployments: {
        "user/repo1": 5,
        "user/repo2": 3,
      },
      repos: [
        { stargazers_count: 5 },
        { stargazers_count: 3 },
        { stargazers_count: 2 },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const component = await OverviewMetrics();
    render(component);

    // Should render metrics from GitHub
    expect(screen.getByText("COMMITS")).toBeInTheDocument();
    expect(screen.getByText("PROJECTS")).toBeInTheDocument();
    expect(screen.getByText("TOTAL COMMITS")).toBeInTheDocument();
    expect(screen.getByText("DEPLOYMENTS")).toBeInTheDocument();
  });

  it("formats large numbers with 'k' suffix", async () => {
    const mockStats = {
      commitsLastMonth: 1500,
      totalRepos: 2500,
      totalCommits: 5000,
      repoDeployments: {
        "user/repo1": 100,
      },
      repos: [{ stargazers_count: 5000 }],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const component = await OverviewMetrics();
    render(component);

    // Check for formatted numbers
    expect(screen.getByText("1.5k")).toBeInTheDocument();
    expect(screen.getByText("2.5k")).toBeInTheDocument();
    expect(screen.getByText("5.0k")).toBeInTheDocument();
  });

  it("handles zero values correctly", async () => {
    const mockStats = {
      commitsLastMonth: 0,
      totalRepos: 0,
      repos: [],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const component = await OverviewMetrics();
    render(component);

    // Check for specific metric labels to ensure we're testing the right values
    expect(screen.getByText("COMMITS")).toBeInTheDocument();
    expect(screen.getByText("PROJECTS")).toBeInTheDocument();
    // Values should be 0 (may appear multiple times, so use getAllByText)
    const zeroValues = screen.getAllByText("0");
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  it("handles zero deployments gracefully", async () => {
    const mockStats = {
      commitsLastMonth: 10,
      totalRepos: 2,
      totalCommits: 100,
      repoDeployments: {},
      repos: [
        { stargazers_count: 5 },
        { stargazers_count: 3 },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const component = await OverviewMetrics();
    render(component);

    // Should not crash and should display metrics
    expect(screen.getByText("COMMITS")).toBeInTheDocument();
    expect(screen.getByText("PROJECTS")).toBeInTheDocument();
    expect(screen.getByText("TOTAL COMMITS")).toBeInTheDocument();
    expect(screen.getByText("DEPLOYMENTS")).toBeInTheDocument();
  });
});
