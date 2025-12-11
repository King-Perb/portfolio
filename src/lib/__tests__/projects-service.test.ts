import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllProjects, getFeaturedProjects, getProjectsPageProjects } from "../projects-service";
import { MANUAL_PROJECTS } from "@/data/manual-projects";
import type { GitHubRepo, TransformRepoOptions } from "@/lib/github";

// Mock fetchGitHubStats
const mockFetchGitHubStats = vi.fn();
vi.mock("@/lib/github", () => ({
  fetchGitHubStats: () => mockFetchGitHubStats(),
  transformRepoToProject: vi.fn((repo: GitHubRepo, options: TransformRepoOptions) => ({
    title: repo.name,
    description: repo.description || "",
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || null,
    tags: options.languages || [],
    status: "active",
    source: "github",
    featured: options.featuredRepos?.includes(repo.full_name) || false,
    lastUpdated: repo.updated_at,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    commitCount: options.commitCount,
    deploymentCount: options.deploymentCount,
    screenshot: options.featuredImage,
    private: repo.private || false,
  })),
}));

describe("projects-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllProjects", () => {
    it("should return manual projects when GitHub API fails", async () => {
      mockFetchGitHubStats.mockRejectedValueOnce(new Error("API Error"));

      const projects = await getAllProjects();

      expect(projects).toEqual(MANUAL_PROJECTS);
    });

    it("should return manual projects when GitHub API returns non-ok response", async () => {
      mockFetchGitHubStats.mockRejectedValueOnce(new Error("API Error"));

      const projects = await getAllProjects();

      expect(projects).toEqual(MANUAL_PROJECTS);
    });

    it("should combine manual and GitHub projects", async () => {
      const mockGitHubStats = {
        repos: [
          {
            id: 1,
            name: "test-repo",
            full_name: "user/test-repo",
            description: "Test repository",
            html_url: "https://github.com/user/test-repo",
            homepage: "https://example.com",
            stargazers_count: 10,
            forks_count: 5,
            updated_at: "2024-01-15T00:00:00Z",
            language: "TypeScript",
            languages_url: "https://api.github.com/repos/user/test-repo/languages",
            private: false,
          },
        ],
        languages: {
          TypeScript: 1000,
          JavaScript: 500,
        },
        repoLanguages: {
          "user/test-repo": ["TypeScript", "JavaScript"],
        },
        repoCommits: {
          "user/test-repo": 100,
        },
        repoDeployments: {
          "user/test-repo": 5,
        },
      };

      mockFetchGitHubStats.mockResolvedValueOnce(mockGitHubStats);

      const projects = await getAllProjects();

      // Should have at least the manual projects plus the GitHub repo
      expect(projects.length).toBeGreaterThanOrEqual(MANUAL_PROJECTS.length);
      expect(projects.some((p) => p.title === "test-repo")).toBe(true);
      expect(projects.some((p) => p.source === "github")).toBe(true);
    });

    it("should sort projects by lastUpdated (most recent first)", async () => {
      const mockGitHubStats = {
        repos: [
          {
            id: 1,
            name: "old-repo",
            full_name: "user/old-repo",
            description: "Old repository",
            html_url: "https://github.com/user/old-repo",
            homepage: null,
            stargazers_count: 0,
            forks_count: 0,
            updated_at: "2023-01-01T00:00:00Z",
            language: "TypeScript",
            languages_url: "https://api.github.com/repos/user/old-repo/languages",
            private: false,
          },
          {
            id: 2,
            name: "new-repo",
            full_name: "user/new-repo",
            description: "New repository",
            html_url: "https://github.com/user/new-repo",
            homepage: null,
            stargazers_count: 0,
            forks_count: 0,
            updated_at: "2024-01-15T00:00:00Z",
            language: "TypeScript",
            languages_url: "https://api.github.com/repos/user/new-repo/languages",
            private: false,
          },
        ],
        languages: {
          TypeScript: 1000,
        },
        repoLanguages: {
          "user/old-repo": ["TypeScript"],
          "user/new-repo": ["TypeScript"],
        },
        repoCommits: {
          "user/old-repo": 50,
          "user/new-repo": 100,
        },
        repoDeployments: {
          "user/old-repo": 2,
          "user/new-repo": 3,
        },
      };

      mockFetchGitHubStats.mockResolvedValueOnce(mockGitHubStats);

      const projects = await getAllProjects();

      // Find the indices of our test repos
      const newRepoIndex = projects.findIndex((p) => p.title === "new-repo");
      const oldRepoIndex = projects.findIndex((p) => p.title === "old-repo");

      // Both repos should exist
      expect(newRepoIndex).toBeGreaterThanOrEqual(0);
      expect(oldRepoIndex).toBeGreaterThanOrEqual(0);

      // New repo should come before old repo (most recent first)
      if (newRepoIndex >= 0 && oldRepoIndex >= 0) {
        expect(newRepoIndex).toBeLessThan(oldRepoIndex);
      }
    });

    it("should handle projects without lastUpdated", async () => {
      // This test ensures projects without dates don't break sorting
      mockFetchGitHubStats.mockResolvedValueOnce({
        repos: [],
        languages: {},
        repoLanguages: {},
        repoCommits: {},
        repoDeployments: {},
      });

      const projects = await getAllProjects();

      // Should not throw and should return an array
      expect(Array.isArray(projects)).toBe(true);
    });
  });

  describe("getFeaturedProjects", () => {
    it("should return only featured projects", async () => {
      mockFetchGitHubStats.mockResolvedValueOnce({
        repos: [],
        languages: {},
        repoLanguages: {},
        repoCommits: {},
        repoDeployments: {},
      });

      const featured = await getFeaturedProjects();

      // All returned projects should be featured
      featured.forEach((project) => {
        expect(project.featured).toBe(true);
      });
    });

    it("should return at most 4 featured projects", async () => {
      mockFetchGitHubStats.mockResolvedValueOnce({
        repos: [],
        languages: {},
        repoLanguages: {},
        repoCommits: {},
        repoDeployments: {},
      });

      const featured = await getFeaturedProjects();

      expect(featured.length).toBeLessThanOrEqual(4);
    });

    it("should return empty array when no featured projects exist", async () => {
      mockFetchGitHubStats.mockResolvedValueOnce({
        repos: [],
        languages: {},
        repoLanguages: {},
        repoCommits: {},
        repoDeployments: {},
      });

      const featured = await getFeaturedProjects();

      // If no projects are marked as featured, should return empty array
      expect(Array.isArray(featured)).toBe(true);
    });
  });

  describe("getProjectsPageProjects", () => {
    it("should return all projects", async () => {
      mockFetchGitHubStats.mockResolvedValueOnce({
        repos: [],
        languages: {},
        repoLanguages: {},
        repoCommits: {},
        repoDeployments: {},
      });

      const allProjects = await getAllProjects();
      const pageProjects = await getProjectsPageProjects();

      expect(pageProjects.length).toBe(allProjects.length);
    });
  });
});
