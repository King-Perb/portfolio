import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import * as github from "@/lib/github";
import { NextResponse } from "next/server";

// Mock the github module
vi.mock("@/lib/github", () => ({
  fetchGitHubStats: vi.fn(),
}));

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe("GET /api/github/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_TOKEN = "test-token";
  });

  it("returns GitHub stats on success", async () => {
    const mockStats = {
      totalCommits: 100,
      commitsLastMonth: 42,
      totalRepos: 10,
      languages: { TypeScript: 5000, JavaScript: 3000 },
      repos: [],
      repoLanguages: {},
      repoCommits: {},
      repoDeployments: {},
    };

    vi.mocked(github.fetchGitHubStats).mockResolvedValueOnce(mockStats);

    const response = await GET();
    const data = await response.json();

    expect(github.fetchGitHubStats).toHaveBeenCalledOnce();
    expect(data).toEqual(mockStats);
    expect(NextResponse.json).toHaveBeenCalledWith(mockStats);
  });

  it("returns 500 error when fetchGitHubStats throws", async () => {
    const error = new Error("GitHub API error");
    vi.mocked(github.fetchGitHubStats).mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(consoleSpy).toHaveBeenCalledWith("GitHub API error:", error);
    expect(data).toEqual({ error: "Failed to fetch GitHub stats" });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to fetch GitHub stats" },
      { status: 500 }
    );

    consoleSpy.mockRestore();
  });

  it("handles missing GITHUB_TOKEN gracefully", async () => {
    delete process.env.GITHUB_TOKEN;
    const error = new Error("GITHUB_TOKEN environment variable is not set");
    vi.mocked(github.fetchGitHubStats).mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: "Failed to fetch GitHub stats" });
    expect(response.status).toBe(500);

    consoleSpy.mockRestore();
  });

  it("returns complete stats structure", async () => {
    const mockStats: import("@/lib/github").GitHubStats = {
      totalCommits: 0,
      commitsLastMonth: 15,
      totalRepos: 5,
      languages: {
        TypeScript: 10000,
        JavaScript: 5000,
        Python: 2000,
      },
      repos: [
        {
          id: 1,
          name: "test-repo",
          full_name: "user/test-repo",
          description: "Test repository",
          html_url: "https://github.com/user/test-repo",
          stargazers_count: 10,
          forks_count: 5,
          updated_at: new Date().toISOString(),
          language: "TypeScript",
          languages_url: "https://api.github.com/repos/user/test-repo/languages",
          private: false,
          homepage: null,
        } as import("@/lib/github").GitHubStats["repos"][0],
      ],
      repoLanguages: {
        "user/test-repo": ["TypeScript", "JavaScript"],
      },
      repoCommits: {
        "user/test-repo": 50,
      },
      repoDeployments: {
        "user/test-repo": 3,
      },
    };

    vi.mocked(github.fetchGitHubStats).mockResolvedValueOnce(mockStats);

    const response = await GET();
    const data = await response.json();

    expect(data.totalRepos).toBe(5);
    expect(data.commitsLastMonth).toBe(15);
    expect(data.languages).toHaveProperty("TypeScript");
    expect(data.repos).toHaveLength(1);
    expect(data.repoLanguages).toHaveProperty("user/test-repo");
  });
});
