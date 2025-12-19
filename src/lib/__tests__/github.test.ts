import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Octokit } from "@octokit/rest";

// Mock unstable_cache to bypass Next.js cache in test environment
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn(<T,>(fn: () => Promise<T>) => fn), // Just return the function directly without caching
}));

// Mock Octokit before importing github module
const mockPaginate = vi.fn();
const mockListLanguages = vi.fn();
const mockListCommits = vi.fn();
const mockListForAuthenticatedUser = vi.fn();

vi.mock("@octokit/rest", () => {
  // Use a class constructor for Vitest 4 compatibility
  class MockOctokit {
    rest = {
      repos: {
        listForAuthenticatedUser: mockListForAuthenticatedUser,
        listLanguages: mockListLanguages,
        listCommits: mockListCommits,
      },
    };
    paginate = mockPaginate;
  }

  return {
    Octokit: MockOctokit,
  };
});

// Import after mock is set up
import { transformRepoToProject, fetchGitHubStats } from "../github";

// Type alias for the repo type used in transformRepoToProject
type GitHubRepo = Awaited<ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>>["data"][0];

describe("transformRepoToProject", () => {
  // Create a minimal mock repo with only the fields we actually use
  // Using satisfies to ensure type safety without unnecessary assertion
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
  } satisfies Partial<GitHubRepo> as GitHubRepo;

  it("should transform GitHub repo to Project with correct basic fields", () => {
    const languages = ["TypeScript", "JavaScript"];
    const project = transformRepoToProject(mockRepo, { languages });

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
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(repoWithoutDescription, { languages: [] });

    expect(project.description).toBe("No description available");
  });

  it("should set status to Active for recently updated repos", () => {
    const recentRepo = {
      ...mockRepo,
      updated_at: new Date().toISOString(), // Today
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(recentRepo, { languages: [] });

    expect(project.status).toBe("Active");
  });

  it("should set status to Archived for repos not updated in over a year", () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago

    const oldRepo = {
      ...mockRepo,
      updated_at: oldDate.toISOString(),
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(oldRepo, { languages: [] });

    expect(project.status).toBe("Archived");
  });

  it("should set status to Maintained for repos updated 6-12 months ago", () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 8); // 8 months ago

    const maintainedRepo = {
      ...mockRepo,
      updated_at: sixMonthsAgo.toISOString(),
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(maintainedRepo, { languages: [] });

    expect(project.status).toBe("Maintained");
  });

  it("should set status to Beta for repos with 'beta' in description", () => {
    const betaRepo = {
      ...mockRepo,
      description: "This is a beta project",
      updated_at: new Date().toISOString(),
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(betaRepo, { languages: [] });

    expect(project.status).toBe("Beta");
  });

  it("should set status to Beta for repos with 'wip' in description", () => {
    const wipRepo = {
      ...mockRepo,
      description: "WIP project - work in progress",
      updated_at: new Date().toISOString(),
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(wipRepo, { languages: [] });

    expect(project.status).toBe("Beta");
  });

  it("should limit tags to 15 languages", () => {
    const manyLanguages = ["Lang1", "Lang2", "Lang3", "Lang4", "Lang5", "Lang6", "Lang7", "Lang8", "Lang9", "Lang10", "Lang11", "Lang12", "Lang13", "Lang14", "Lang15", "Lang16", "Lang17"];
    const project = transformRepoToProject(mockRepo, { languages: manyLanguages });

    expect(project.tags.length).toBe(15);
  });

  it("should handle repos without homepage", () => {
    const repoWithoutHomepage = {
      ...mockRepo,
      homepage: null,
    } satisfies Partial<GitHubRepo> as GitHubRepo;
    const project = transformRepoToProject(repoWithoutHomepage, { languages: [] });

    expect(project.liveUrl).toBeUndefined();
  });

  it("should set featured to false by default", () => {
    const project = transformRepoToProject(mockRepo, { languages: [] });

    expect(project.featured).toBe(false);
  });
});

describe("fetchGitHubStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a mock token for unit tests (NOT the CI dummy token which triggers mock data)
    process.env.GITHUB_TOKEN = "ghp_mock_unit_test_token";
  });

  it("should fetch and aggregate GitHub stats", async () => {
    const mockRepos = [
      {
        id: 1,
        name: "repo1",
        full_name: "user/repo1",
        description: "Test repo 1",
        html_url: "https://github.com/user/repo1",
        homepage: null,
        stargazers_count: 10,
        forks_count: 5,
        updated_at: new Date().toISOString(),
        language: "TypeScript",
        languages_url: "https://api.github.com/repos/user/repo1/languages",
        private: false,
      },
      {
        id: 2,
        name: "repo2",
        full_name: "user/repo2",
        description: "Test repo 2",
        html_url: "https://github.com/user/repo2",
        homepage: null,
        stargazers_count: 20,
        forks_count: 10,
        updated_at: new Date().toISOString(),
        language: "JavaScript",
        languages_url: "https://api.github.com/repos/user/repo2/languages",
        private: false,
      },
    ];

    const mockLanguages1 = { TypeScript: 1000, JavaScript: 500 };
    const mockLanguages2 = { JavaScript: 2000, Python: 300 };
    const mockCommits1 = [{ sha: "abc" }, { sha: "def" }];
    const mockCommits2 = [{ sha: "ghi" }];

    // Mock paginate - check which method is being called
    mockPaginate.mockImplementation(async (method: unknown, options?: { repo?: string }) => {
      // If method is listForAuthenticatedUser, return repos
      if (method === mockListForAuthenticatedUser) {
        return mockRepos;
      }
      // If method is listCommits, return commits based on repo
      if (method === mockListCommits) {
        if (options?.repo === "repo1") {
          return mockCommits1;
        }
        if (options?.repo === "repo2") {
          return mockCommits2;
        }
        return [];
      }
      return [];
    });

    // Mock listLanguages
    mockListLanguages.mockImplementation(async ({ repo }: { owner: string; repo: string }) => {
      if (repo === "repo1") {
        return { data: mockLanguages1 };
      }
      if (repo === "repo2") {
        return { data: mockLanguages2 };
      }
      return { data: {} };
    });

    const stats = await fetchGitHubStats();

    expect(stats.totalRepos).toBe(2);
    expect(stats.commitsLastMonth).toBe(3); // 2 + 1 commits
    expect(stats.languages.TypeScript).toBe(1000);
    expect(stats.languages.JavaScript).toBe(2500); // 500 + 2000
    expect(stats.languages.Python).toBe(300);
    expect(stats.repos).toEqual(mockRepos);
    expect(stats.repoLanguages["user/repo1"]).toEqual(["TypeScript", "JavaScript"]);
    expect(stats.repoLanguages["user/repo2"]).toEqual(["JavaScript", "Python"]);
  });

  it("should handle empty repository list", async () => {
    mockPaginate.mockResolvedValue([]);

    const stats = await fetchGitHubStats();

    expect(stats.totalRepos).toBe(0);
    expect(stats.commitsLastMonth).toBe(0);
    expect(stats.languages).toEqual({});
    expect(stats.repos).toEqual([]);
    expect(stats.repoLanguages).toEqual({});
  });

  it("should handle API errors gracefully", async () => {
    mockPaginate.mockRejectedValue(new Error("API Error"));

    // Should return empty stats if listForAuthenticatedUser fails (graceful degradation)
    const stats = await fetchGitHubStats();
    expect(stats).toEqual({
      totalCommits: 0,
      commitsLastMonth: 0,
      totalRepos: 0,
      languages: {},
      repos: [],
      repoLanguages: {},
      repoCommits: {},
      repoDeployments: {},
    });
  });

  it("should handle missing GITHUB_TOKEN", async () => {
    delete process.env.GITHUB_TOKEN;

    // Should return empty stats if token is missing (graceful degradation for tests/CI)
    const stats = await fetchGitHubStats();
    expect(stats).toEqual({
      totalCommits: 0,
      commitsLastMonth: 0,
      totalRepos: 0,
      languages: {},
      repos: [],
      repoLanguages: {},
      repoCommits: {},
      repoDeployments: {},
    });
  });
});
