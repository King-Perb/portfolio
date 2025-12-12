import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StackPage from "../page";

// Mock fetchGitHubStats
const mockFetchGitHubStats = vi.fn();
vi.mock("@/lib/github", () => ({
  fetchGitHubStats: () => mockFetchGitHubStats(),
}));

// Mock StackCard
vi.mock("@/components/stack/stack-card", () => ({
  StackCard: ({ language }: { language: string }) => (
    <div data-testid="stack-card">{language}</div>
  ),
}));

// Mock manual technologies
const mockManualTechnologies: Array<{ name: string; bytes?: number }> = [];
vi.mock("@/data/manual-technologies", () => ({
  get MANUAL_TECHNOLOGIES() {
    return mockManualTechnologies;
  },
}));

// Mock MobileNextSectionButton to avoid NavigationProvider dependency
vi.mock("@/components/navigation/mobile-next-section-button", () => ({
  MobileNextSectionButton: () => <div data-testid="mobile-next-section-button" />,
}));

describe("StackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  it("renders page title and subtitle", async () => {
    mockFetchGitHubStats.mockResolvedValueOnce({ languages: {} });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
    expect(screen.getByText(/Technologies and languages from my repositories/)).toBeInTheDocument();
  });

  it("displays languages from API", async () => {
    const mockLanguages = {
      TypeScript: 5000,
      JavaScript: 3000,
      Python: 2000,
    };

    mockFetchGitHubStats.mockResolvedValueOnce({ languages: mockLanguages });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("displays manual technologies in 'Other technologies' subsection", async () => {
    mockManualTechnologies.length = 0;
    mockManualTechnologies.push(
      { name: "Docker", bytes: 1000 },
      { name: "Kubernetes", bytes: 500 }
    );

    mockFetchGitHubStats.mockResolvedValueOnce({ languages: {} });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("Other technologies")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });

  it("displays both GitHub languages and manual technologies", async () => {
    mockManualTechnologies.length = 0;
    mockManualTechnologies.push(
      { name: "Docker", bytes: 1000 },
      { name: "AWS", bytes: 2000 }
    );

    const mockLanguages = {
      TypeScript: 5000,
      JavaScript: 3000,
    };

    mockFetchGitHubStats.mockResolvedValueOnce({ languages: mockLanguages });

    const component = await StackPage();
    render(component);

    // GitHub languages should be in main section
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();

    // Manual technologies should be in "Other technologies" subsection
    expect(screen.getByText("Other technologies")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("sorts languages by bytes (descending)", async () => {
    const mockLanguages = {
      Python: 2000,
      TypeScript: 5000,
      JavaScript: 3000,
    };

    mockFetchGitHubStats.mockResolvedValueOnce({ languages: mockLanguages });

    const component = await StackPage();
    const { container } = render(component);

    const stackCards = container.querySelectorAll('[data-testid="stack-card"]');
    expect(stackCards[0]).toHaveTextContent("TypeScript");
    expect(stackCards[1]).toHaveTextContent("JavaScript");
    expect(stackCards[2]).toHaveTextContent("Python");
  });

  it("displays empty state when no languages and no manual technologies", async () => {
    mockManualTechnologies.length = 0;
    mockFetchGitHubStats.mockResolvedValueOnce({ languages: {} });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("No stack data available.")).toBeInTheDocument();
    expect(screen.getByText(/Connect your GitHub account to see your tech stack/)).toBeInTheDocument();
  });

  it("handles API error gracefully", async () => {
    mockManualTechnologies.length = 0;
    mockFetchGitHubStats.mockRejectedValueOnce(new Error("API Error"));

    const component = await StackPage();
    render(component);

    // When API fails and no manual technologies, show empty state
    expect(screen.getByText("No stack data available.")).toBeInTheDocument();
  });

  it("handles non-ok response", async () => {
    mockManualTechnologies.length = 0;
    mockFetchGitHubStats.mockRejectedValueOnce(new Error("API Error"));

    const component = await StackPage();
    render(component);

    // When API fails and no manual technologies, show empty state
    expect(screen.getByText("No stack data available.")).toBeInTheDocument();
  });
});
