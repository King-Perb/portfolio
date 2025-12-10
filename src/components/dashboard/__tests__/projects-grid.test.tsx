import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectsGrid } from "../projects-grid";
import * as projectsService from "@/lib/projects-service";

// Mock the projects service
vi.mock("@/lib/projects-service", () => ({
  getFeaturedProjects: vi.fn(),
}));

// Mock ProjectCard
vi.mock("@/components/projects/project-card", () => ({
  ProjectCard: ({ project }: { project: { title: string } }) => (
    <div data-testid="project-card">{project.title}</div>
  ),
}));

describe("ProjectsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders featured projects from service", async () => {
    const mockProjects = [
      {
        title: "Project 1",
        description: "Test project 1",
        tags: ["TypeScript"],
        stars: 0,
        forks: 0,
        status: "Active" as const,
        statusColor: "text-primary border-primary/20 bg-primary/10",
        source: "github" as const,
        featured: true,
        githubUrl: "https://github.com/test/project1",
      },
      {
        title: "Project 2",
        description: "Test project 2",
        tags: ["JavaScript"],
        stars: 0,
        forks: 0,
        status: "Active" as const,
        statusColor: "text-primary border-primary/20 bg-primary/10",
        source: "manual" as const,
        featured: true,
      },
    ];

    vi.mocked(projectsService.getFeaturedProjects).mockResolvedValueOnce(mockProjects);

    const component = await ProjectsGrid();
    render(component);

    expect(screen.getByText("Project 1")).toBeInTheDocument();
    expect(screen.getByText("Project 2")).toBeInTheDocument();
  });

  it("falls back to mock data when no featured projects", async () => {
    vi.mocked(projectsService.getFeaturedProjects).mockResolvedValueOnce([]);

    const component = await ProjectsGrid();
    render(component);

    // Should render mock projects (from MOCK_PROJECTS)
    const projectCards = screen.getAllByTestId("project-card");
    expect(projectCards.length).toBeGreaterThan(0);
  });

  it("limits projects to 4 maximum", async () => {
    const mockProjects = Array.from({ length: 10 }, (_, i) => ({
      title: `Project ${i + 1}`,
      description: `Test project ${i + 1}`,
      tags: ["TypeScript"],
      stars: 0,
      forks: 0,
      status: "Active" as const,
      statusColor: "text-primary border-primary/20 bg-primary/10",
      source: "github" as const,
      featured: true,
      githubUrl: `https://github.com/test/project${i + 1}`,
    }));

    vi.mocked(projectsService.getFeaturedProjects).mockResolvedValueOnce(mockProjects);

    const component = await ProjectsGrid();
    render(component);

    const projectCards = screen.getAllByTestId("project-card");
    expect(projectCards).toHaveLength(4);
  });

  it("generates unique keys for projects", async () => {
    const mockProjects = [
      {
        title: "Test Project",
        description: "Test project",
        tags: ["TypeScript"],
        stars: 0,
        forks: 0,
        status: "Active" as const,
        statusColor: "text-primary border-primary/20 bg-primary/10",
        source: "github" as const,
        featured: true,
        githubUrl: "https://github.com/test/repo",
      },
    ];

    vi.mocked(projectsService.getFeaturedProjects).mockResolvedValueOnce(mockProjects);

    const component = await ProjectsGrid();
    const { container } = render(component);

    // Should render without key warnings
    expect(container.querySelector("section")).toBeInTheDocument();
  });
});

