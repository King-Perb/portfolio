import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StackPage from "../page";

// Mock fetch globally
global.fetch = vi.fn();

// Mock StackCard
vi.mock("@/components/stack/stack-card", () => ({
  StackCard: ({ language }: { language: string }) => (
    <div data-testid="stack-card">{language}</div>
  ),
}));

describe("StackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  it("renders page title and subtitle", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ languages: {} }),
    });

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

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ languages: mockLanguages }),
    });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("sorts languages by bytes (descending)", async () => {
    const mockLanguages = {
      Python: 2000,
      TypeScript: 5000,
      JavaScript: 3000,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ languages: mockLanguages }),
    });

    const component = await StackPage();
    const { container } = render(component);

    const stackCards = container.querySelectorAll('[data-testid="stack-card"]');
    expect(stackCards[0]).toHaveTextContent("TypeScript");
    expect(stackCards[1]).toHaveTextContent("JavaScript");
    expect(stackCards[2]).toHaveTextContent("Python");
  });

  it("displays empty state when no languages", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ languages: {} }),
    });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("No stack data available.")).toBeInTheDocument();
    expect(screen.getByText(/Connect your GitHub account to see your tech stack/)).toBeInTheDocument();
  });

  it("handles API error gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("API Error"));

    const component = await StackPage();
    render(component);

    expect(screen.getByText("No stack data available.")).toBeInTheDocument();
  });

  it("handles non-ok response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const component = await StackPage();
    render(component);

    expect(screen.getByText("No stack data available.")).toBeInTheDocument();
  });
});

