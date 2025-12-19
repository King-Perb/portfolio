import { describe, it, expect, vi } from "vitest";
import { redirect } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import Home from "../page";

// Mock child components
vi.mock("@/components/dashboard/overview-metrics", () => ({
  OverviewMetrics: () => <div data-testid="overview-metrics">Overview Metrics</div>,
}));

vi.mock("@/components/dashboard/projects-grid", () => ({
  ProjectsGrid: () => <div data-testid="projects-grid">Projects Grid</div>,
}));

vi.mock("@/components/dashboard/easter-egg-button", () => ({
  EasterEggButton: () => <button data-testid="easter-egg-button">Don&apos;t Click This</button>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className?: string }) => (
    <hr data-testid="separator" data-classname={className} />
  ),
}));

// Mock MobileNextSectionButton to avoid NavigationProvider dependency
vi.mock("@/components/navigation/mobile-next-section-button", () => ({
  MobileNextSectionButton: () => <div data-testid="mobile-next-section-button" />,
}));

describe("Home Page", () => {
  it("redirects to /ai-miko", () => {
    Home();
    expect(redirect).toHaveBeenCalledWith("/ai-miko");
  });
});
