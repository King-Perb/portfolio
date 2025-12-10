import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectsPage from "../page";
import * as projectsService from "@/lib/projects-service";

// Mock the projects service
vi.mock("@/lib/projects-service", () => ({
  getProjectsPageProjects: vi.fn(),
}));

// Mock ProjectCard
vi.mock("@/components/projects/project-card", () => ({
  ProjectCard: ({ project }: { project: { title: string } }) => (
    <div data-testid="project-card">{project.title}</div>
  ),
}));

describe("ProjectsPage", () => {
  it("renders page title", async () => {
    vi.mocked(projectsService.getProjectsPageProjects).mockResolvedValueOnce([]);

    const component = await ProjectsPage();
    render(component);

    expect(screen.getByText("All Projects")).toBeInTheDocument();
  });

  it("displays project count", async () => {
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
      },
    ];

    vi.mocked(projectsService.getProjectsPageProjects).mockResolvedValueOnce(mockProjects);

    const component = await ProjectsPage();
    render(component);

    expect(screen.getByText("2 projects total")).toBeInTheDocument();
  });

  it("displays singular form for one project", async () => {
    const mockProjects = [{
      title: "Project 1",
      description: "Test project",
      tags: ["TypeScript"],
      stars: 0,
      forks: 0,
      status: "Active" as const,
      statusColor: "text-primary border-primary/20 bg-primary/10",
      source: "github" as const,
    }];

    vi.mocked(projectsService.getProjectsPageProjects).mockResolvedValueOnce(mockProjects);

    const component = await ProjectsPage();
    render(component);

    expect(screen.getByText("1 project total")).toBeInTheDocument();
  });

  it("renders all projects", async () => {
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
      },
      {
        title: "Project 3",
        description: "Test project 3",
        tags: ["Python"],
        stars: 0,
        forks: 0,
        status: "Active" as const,
        statusColor: "text-primary border-primary/20 bg-primary/10",
        source: "github" as const,
      },
    ];

    vi.mocked(projectsService.getProjectsPageProjects).mockResolvedValueOnce(mockProjects);

    const component = await ProjectsPage();
    render(component);

    expect(screen.getByText("Project 1")).toBeInTheDocument();
    expect(screen.getByText("Project 2")).toBeInTheDocument();
    expect(screen.getByText("Project 3")).toBeInTheDocument();
  });

  it("displays empty state when no projects", async () => {
    vi.mocked(projectsService.getProjectsPageProjects).mockResolvedValueOnce([]);

    const component = await ProjectsPage();
    render(component);

    expect(screen.getByText("No projects found.")).toBeInTheDocument();
  });
});
