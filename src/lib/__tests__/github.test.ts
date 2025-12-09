import { describe, it, expect } from "vitest";
import { transformRepoToProject } from "../github";
import type { Octokit } from "@octokit/rest";

// Type alias for the repo type used in transformRepoToProject
type GitHubRepo = Awaited<ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>>["data"][0];

describe("transformRepoToProject", () => {
  // Create a minimal mock repo with only the fields we actually use
  // Using type assertion since we only need the fields used by transformRepoToProject
  const mockRepo = {
    id: 1,
    name: "test-repo",
    full_name: "user/test-repo",
    description: "A test repository",
    html_url: "https://github.com/user/test-repo",
    homepage: "https://example.com",
    stargazers_count: 42,
    forks_count: 10,
    updated_at: new Date().toISOString(),
    language: "TypeScript",
    languages_url: "https://api.github.com/repos/user/test-repo/languages",
    private: false,
  } as GitHubRepo;

  it("should transform GitHub repo to Project with correct basic fields", () => {
    const languages = ["TypeScript", "JavaScript"];
    const project = transformRepoToProject(mockRepo, languages);

    expect(project.title).toBe("test-repo");
    expect(project.description).toBe("A test repository");
    expect(project.stars).toBe(42);
    expect(project.forks).toBe(10);
    expect(project.githubUrl).toBe("https://github.com/user/test-repo");
    expect(project.liveUrl).toBe("https://example.com");
    expect(project.source).toBe("github");
    expect(project.tags).toEqual(languages);
  });

  it("should use default description when repo has no description", () => {
    const repoWithoutDescription = {
      ...mockRepo,
      description: null,
    } as GitHubRepo;
    const project = transformRepoToProject(repoWithoutDescription, []);

    expect(project.description).toBe("No description available");
  });

  it("should set status to Active for recently updated repos", () => {
    const recentRepo = {
      ...mockRepo,
      updated_at: new Date().toISOString(), // Today
    } as GitHubRepo;
    const project = transformRepoToProject(recentRepo, []);

    expect(project.status).toBe("Active");
  });

  it("should set status to Archived for repos not updated in over a year", () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago

    const oldRepo = {
      ...mockRepo,
      updated_at: oldDate.toISOString(),
    } as GitHubRepo;
    const project = transformRepoToProject(oldRepo, []);

    expect(project.status).toBe("Archived");
  });

  it("should set status to Maintained for repos updated 6-12 months ago", () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 8); // 8 months ago

    const maintainedRepo = {
      ...mockRepo,
      updated_at: sixMonthsAgo.toISOString(),
    } as GitHubRepo;
    const project = transformRepoToProject(maintainedRepo, []);

    expect(project.status).toBe("Maintained");
  });

  it("should set status to Beta for repos with 'beta' in description", () => {
    const betaRepo = {
      ...mockRepo,
      description: "This is a beta project",
      updated_at: new Date().toISOString(),
    } as GitHubRepo;
    const project = transformRepoToProject(betaRepo, []);

    expect(project.status).toBe("Beta");
  });

  it("should set status to Beta for repos with 'wip' in description", () => {
    const wipRepo = {
      ...mockRepo,
      description: "WIP project - work in progress",
      updated_at: new Date().toISOString(),
    } as GitHubRepo;
    const project = transformRepoToProject(wipRepo, []);

    expect(project.status).toBe("Beta");
  });

  it("should limit tags to 5 languages", () => {
    const manyLanguages = ["Lang1", "Lang2", "Lang3", "Lang4", "Lang5", "Lang6", "Lang7"];
    const project = transformRepoToProject(mockRepo, manyLanguages);

    expect(project.tags.length).toBe(5);
  });

  it("should handle repos without homepage", () => {
    const repoWithoutHomepage = {
      ...mockRepo,
      homepage: null,
    } as GitHubRepo;
    const project = transformRepoToProject(repoWithoutHomepage, []);

    expect(project.liveUrl).toBeUndefined();
  });

  it("should set featured to false by default", () => {
    const project = transformRepoToProject(mockRepo, []);

    expect(project.featured).toBe(false);
  });
});

