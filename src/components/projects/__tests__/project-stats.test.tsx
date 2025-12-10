import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectStats } from "../project-stats";
import type { Project } from "@/types";

describe("ProjectStats", () => {
  const createMockProject = (overrides: Partial<Project> = {}): Project => ({
    title: "Test Project",
    description: "Test description",
    tags: ["TypeScript"],
    stars: 0,
    forks: 0,
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    source: "github",
    ...overrides,
  });

  it("renders stars and forks for GitHub projects", () => {
    const project = createMockProject({
      source: "github",
      stars: 42,
      forks: 10,
    });

    render(<ProjectStats project={project} />);

    expect(screen.getByTitle("Stars")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByTitle("Forks")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("does not render stars and forks for manual projects", () => {
    const project = createMockProject({
      source: "manual",
      stars: 0,
      forks: 0,
    });

    render(<ProjectStats project={project} />);

    expect(screen.queryByTitle("Stars")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Forks")).not.toBeInTheDocument();
  });

  it("renders commit count when available and greater than 0", () => {
    const project = createMockProject({
      commitCount: 150,
    });

    render(<ProjectStats project={project} />);

    expect(screen.getByTitle("Total commits")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("does not render commit count when undefined", () => {
    const project = createMockProject({
      commitCount: undefined,
    });

    render(<ProjectStats project={project} />);

    expect(screen.queryByTitle("Total commits")).not.toBeInTheDocument();
  });

  it("does not render commit count when 0", () => {
    const project = createMockProject({
      commitCount: 0,
    });

    render(<ProjectStats project={project} />);

    expect(screen.queryByTitle("Total commits")).not.toBeInTheDocument();
  });

  it("renders deployment count when available and greater than 0", () => {
    const project = createMockProject({
      deploymentCount: 5,
    });

    render(<ProjectStats project={project} />);

    expect(screen.getByTitle("Total deployments")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not render deployment count when undefined", () => {
    const project = createMockProject({
      deploymentCount: undefined,
    });

    render(<ProjectStats project={project} />);

    expect(screen.queryByTitle("Total deployments")).not.toBeInTheDocument();
  });

  it("does not render deployment count when 0", () => {
    const project = createMockProject({
      deploymentCount: 0,
    });

    render(<ProjectStats project={project} />);

    expect(screen.queryByTitle("Total deployments")).not.toBeInTheDocument();
  });

  it("renders all stats for GitHub project with commits and deployments", () => {
    const project = createMockProject({
      source: "github",
      stars: 100,
      forks: 25,
      commitCount: 500,
      deploymentCount: 10,
    });

    render(<ProjectStats project={project} />);

    expect(screen.getByTitle("Stars")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByTitle("Forks")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByTitle("Total commits")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByTitle("Total deployments")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders only commits and deployments for manual project", () => {
    const project = createMockProject({
      source: "manual",
      commitCount: 200,
      deploymentCount: 3,
    });

    render(<ProjectStats project={project} />);

    expect(screen.queryByTitle("Stars")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Forks")).not.toBeInTheDocument();
    expect(screen.getByTitle("Total commits")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByTitle("Total deployments")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
