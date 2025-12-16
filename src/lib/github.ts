/**
 * GitHub API utility functions
 * Fetches repository data, languages, and commit activity using Octokit SDK
 */

import { Octokit } from "@octokit/rest";
import { unstable_cache } from "next/cache";
import { getExcludedRepos } from "@/data/github-project-overrides";
import { calculateProjectStatus } from "./project-status";

// Type aliases for Octokit response types
export type GitHubRepo = Awaited<ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>>["data"][0];
type GitHubLanguage = Awaited<ReturnType<Octokit["rest"]["repos"]["listLanguages"]>>["data"];

export interface GitHubStats {
  totalCommits: number;
  commitsLastMonth: number;
  totalRepos: number;
  languages: { [key: string]: number }; // Aggregated across all repos
  repos: GitHubRepo[];
  repoLanguages: { [repoFullName: string]: string[] }; // Per-repo languages (keyed by repo full_name)
  repoCommits: { [repoFullName: string]: number }; // Per-repo commit counts (all time)
  repoDeployments: { [repoFullName: string]: number }; // Per-repo deployment counts
}

// Test/dummy token used in CI - when detected, return mock data
const TEST_DUMMY_TOKEN = "test-token-dummy-value";

/**
 * Check if we're using a test/dummy token (for CI/testing)
 */
function isTestToken(): boolean {
  const token = process.env.GITHUB_TOKEN;
  return token === TEST_DUMMY_TOKEN;
}

/**
 * Create an authenticated Octokit instance
 * Returns null if token is not set or is a test dummy token (for graceful degradation in tests/CI)
 */
function createOctokit(): Octokit | null {
  const token = process.env.GITHUB_TOKEN;

  if (!token || token === TEST_DUMMY_TOKEN) {
    return null;
  }

  return new Octokit({
    auth: token,
  });
}

/**
 * Fetch all repositories for the authenticated user using pagination
 */
async function fetchAllRepos(octokit: Octokit): Promise<GitHubRepo[]> {
  // Use paginate to automatically handle pagination
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    type: "all",
    sort: "updated",
    per_page: 100,
  });

  return repos;
}

/**
 * Fetch languages for a repository
 */
async function fetchRepoLanguages(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubLanguage> {
  try {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });
    return data;
  } catch {
    // Return empty object if request fails
    return {};
  }
}

/**
 * Fetch commits for a repository (last 30 days)
 */
async function fetchRepoCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: string
): Promise<number> {
  try {
    // Use paginate to get all commits, not just first page
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner,
      repo,
      since,
      per_page: 100,
    });
    return commits.length;
  } catch {
    // Return 0 if request fails
    return 0;
  }
}

/**
 * Fetch total commit count for a repository (all time)
 */
async function fetchRepoTotalCommits(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  try {
    // Use paginate to get all commits
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
    });
    return commits.length;
  } catch {
    // Return 0 if request fails
    return 0;
  }
}

/**
 * Fetch deployment count for a repository
 */
async function fetchRepoDeployments(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  try {
    // Use paginate to get all deployments
    const deployments = await octokit.paginate(octokit.rest.repos.listDeployments, {
      owner,
      repo,
      per_page: 100,
    });
    return deployments.length;
  } catch {
    // Return 0 if request fails (deployments may not be enabled for all repos)
    return 0;
  }
}

/**
 * Generate mock data for testing/CI environments
 * Returns realistic-looking data so E2E tests can verify UI rendering
 */
function getMockGitHubStats(): GitHubStats {
  const mockRepos: GitHubRepo[] = [
    {
      id: 1,
      name: "portfolio",
      full_name: "testuser/portfolio",
      description: "My personal portfolio website built with Next.js",
      html_url: "https://github.com/testuser/portfolio",
      homepage: "https://portfolio.example.com",
      stargazers_count: 42,
      forks_count: 5,
      updated_at: new Date().toISOString(),
      private: false,
      mirror_url: null,
      language: "TypeScript",
      // Required fields from GitHub API
      node_id: "mock-node-1",
      owner: {
        login: "testuser",
        id: 1,
        node_id: "mock-owner-node",
        avatar_url: "",
        gravatar_id: "",
        url: "",
        html_url: "",
        followers_url: "",
        following_url: "",
        gists_url: "",
        starred_url: "",
        subscriptions_url: "",
        organizations_url: "",
        repos_url: "",
        events_url: "",
        received_events_url: "",
        type: "User",
        site_admin: false,
      },
      url: "",
      forks_url: "",
      keys_url: "",
      collaborators_url: "",
      teams_url: "",
      hooks_url: "",
      issue_events_url: "",
      events_url: "",
      assignees_url: "",
      branches_url: "",
      tags_url: "",
      blobs_url: "",
      git_tags_url: "",
      git_refs_url: "",
      trees_url: "",
      statuses_url: "",
      languages_url: "",
      stargazers_url: "",
      contributors_url: "",
      subscribers_url: "",
      subscription_url: "",
      commits_url: "",
      git_commits_url: "",
      comments_url: "",
      issue_comment_url: "",
      contents_url: "",
      compare_url: "",
      merges_url: "",
      archive_url: "",
      downloads_url: "",
      issues_url: "",
      pulls_url: "",
      milestones_url: "",
      notifications_url: "",
      labels_url: "",
      releases_url: "",
      deployments_url: "",
      created_at: "2024-01-01T00:00:00Z",
      pushed_at: new Date().toISOString(),
      git_url: "",
      ssh_url: "",
      clone_url: "",
      svn_url: "",
      size: 1000,
      default_branch: "main",
      open_issues_count: 0,
      is_template: false,
      topics: ["nextjs", "typescript", "portfolio"],
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: true,
      has_downloads: true,
      archived: false,
      disabled: false,
      visibility: "public",
      fork: false,
      forks: 5,
      open_issues: 0,
      watchers: 42,
      watchers_count: 42,
      license: null,
      allow_forking: true,
      web_commit_signoff_required: false,
    },
    {
      id: 2,
      name: "awesome-project",
      full_name: "testuser/awesome-project",
      description: "An awesome open source project",
      html_url: "https://github.com/testuser/awesome-project",
      homepage: null,
      stargazers_count: 128,
      forks_count: 23,
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      private: false,
      mirror_url: null,
      language: "TypeScript",
      node_id: "mock-node-2",
      owner: {
        login: "testuser",
        id: 1,
        node_id: "mock-owner-node",
        avatar_url: "",
        gravatar_id: "",
        url: "",
        html_url: "",
        followers_url: "",
        following_url: "",
        gists_url: "",
        starred_url: "",
        subscriptions_url: "",
        organizations_url: "",
        repos_url: "",
        events_url: "",
        received_events_url: "",
        type: "User",
        site_admin: false,
      },
      url: "",
      forks_url: "",
      keys_url: "",
      collaborators_url: "",
      teams_url: "",
      hooks_url: "",
      issue_events_url: "",
      events_url: "",
      assignees_url: "",
      branches_url: "",
      tags_url: "",
      blobs_url: "",
      git_tags_url: "",
      git_refs_url: "",
      trees_url: "",
      statuses_url: "",
      languages_url: "",
      stargazers_url: "",
      contributors_url: "",
      subscribers_url: "",
      subscription_url: "",
      commits_url: "",
      git_commits_url: "",
      comments_url: "",
      issue_comment_url: "",
      contents_url: "",
      compare_url: "",
      merges_url: "",
      archive_url: "",
      downloads_url: "",
      issues_url: "",
      pulls_url: "",
      milestones_url: "",
      notifications_url: "",
      labels_url: "",
      releases_url: "",
      deployments_url: "",
      created_at: "2023-06-01T00:00:00Z",
      pushed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      git_url: "",
      ssh_url: "",
      clone_url: "",
      svn_url: "",
      size: 2500,
      default_branch: "main",
      open_issues_count: 3,
      is_template: false,
      topics: ["typescript", "react", "open-source"],
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: false,
      has_downloads: true,
      archived: false,
      disabled: false,
      visibility: "public",
      fork: false,
      forks: 23,
      open_issues: 3,
      watchers: 128,
      watchers_count: 128,
      license: null,
      allow_forking: true,
      web_commit_signoff_required: false,
    },
  ];

  return {
    totalCommits: 1234,
    commitsLastMonth: 89,
    totalRepos: mockRepos.length,
    languages: {
      TypeScript: 150000,
      JavaScript: 50000,
      CSS: 25000,
      HTML: 10000,
    },
    repos: mockRepos,
    repoLanguages: {
      "testuser/portfolio": ["TypeScript", "CSS", "JavaScript"],
      "testuser/awesome-project": ["TypeScript", "JavaScript", "HTML"],
    },
    repoCommits: {
      "testuser/portfolio": 456,
      "testuser/awesome-project": 778,
    },
    repoDeployments: {
      "testuser/portfolio": 12,
      "testuser/awesome-project": 5,
    },
  };
}

/**
 * Internal function to fetch GitHub statistics (not cached)
 */
async function _fetchGitHubStatsInternal(): Promise<GitHubStats> {
  // If using test/dummy token, return mock data for E2E tests
  if (isTestToken()) {
    return getMockGitHubStats();
  }

  // Create authenticated Octokit instance
  const octokit = createOctokit();

  // If no token, return empty stats (graceful degradation)
  if (!octokit) {
    return {
      totalCommits: 0,
      commitsLastMonth: 0,
      totalRepos: 0,
      languages: {},
      repos: [],
      repoLanguages: {},
      repoCommits: {},
      repoDeployments: {},
    };
  }

  // Fetch all repositories (with automatic pagination)
  let allRepos: GitHubRepo[] = [];
  try {
    allRepos = await fetchAllRepos(octokit);
  } catch (error) {
    // If API call fails (e.g., bad credentials), return empty stats
    console.error("Failed to fetch GitHub repos:", error);
    return {
      totalCommits: 0,
      commitsLastMonth: 0,
      totalRepos: 0,
      languages: {},
      repos: [],
      repoLanguages: {},
      repoCommits: {},
      repoDeployments: {},
    };
  }

  // Filter out excluded repositories
  const excludedRepos = getExcludedRepos();
  const repos = allRepos.filter((repo) => !excludedRepos.includes(repo.full_name));

  // Calculate date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  // Aggregate languages and commits, and store per-repo languages
  const languages: { [key: string]: number } = {};
  const repoLanguages: { [repoFullName: string]: string[] } = {};
  const repoCommits: { [repoFullName: string]: number } = {};
  const repoDeployments: { [repoFullName: string]: number } = {};
  let commitsLastMonth = 0;
  let totalCommits = 0;

  // Process repos - Octokit handles rate limiting automatically
  for (const repo of repos) {
    // Extract owner from full_name
    const [owner] = repo.full_name.split("/");

    // Fetch languages for this repo
    const repoLanguagesData = await fetchRepoLanguages(octokit, owner, repo.name);

    // Store languages for this repo (sorted by bytes, descending, top 5)
    const repoLangArray = Object.entries(repoLanguagesData)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => lang)
      .slice(0, 5);
    repoLanguages[repo.full_name] = repoLangArray;

    // Aggregate languages across all repos
    for (const [lang, bytes] of Object.entries(repoLanguagesData)) {
      languages[lang] = (languages[lang] || 0) + bytes;
    }

    // Fetch commits for last month (with automatic pagination)
    const commitsLast30Days = await fetchRepoCommits(octokit, owner, repo.name, since);
    commitsLastMonth += commitsLast30Days;

    // Fetch total commits for this repo (all time)
    const totalRepoCommits = await fetchRepoTotalCommits(octokit, owner, repo.name);
    repoCommits[repo.full_name] = totalRepoCommits;
    totalCommits += totalRepoCommits;

    // Fetch deployment count for this repo
    const deployments = await fetchRepoDeployments(octokit, owner, repo.name);
    repoDeployments[repo.full_name] = deployments;
  }

  return {
    totalCommits,
    commitsLastMonth,
    totalRepos: repos.length,
    languages,
    repos,
    repoLanguages,
    repoCommits,
    repoDeployments,
  };
}

/**
 * Aggregate all GitHub statistics
 * Cached for 5 minutes to avoid excessive API calls during development
 */
export const fetchGitHubStats = unstable_cache(
  _fetchGitHubStatsInternal,
  ['github-stats'],
  {
    revalidate: 300, // Cache for 5 minutes (300 seconds)
    tags: ['github-stats'],
  }
);

/**
 * Options for transforming a GitHub repository to a Project
 */
export interface TransformRepoOptions {
  languages: string[];
  featuredRepos?: string[];
  commitCount?: number;
  deploymentCount?: number;
  featuredImage?: string;
  customDescription?: string;
  customTitle?: string;
  clickUrl?: string;
  displayOrder?: number;
}

/**
 * Transform GitHub repository to Project interface
 */
export function transformRepoToProject(
  repo: GitHubRepo,
  options: TransformRepoOptions
): import("@/types").Project {
  const {
    languages,
    featuredRepos,
    commitCount,
    deploymentCount,
    featuredImage,
    customDescription,
    customTitle,
    clickUrl,
    displayOrder,
  } = options;

  // Determine status based on updated_at
  const updatedAt = repo.updated_at || new Date().toISOString();
  const { status, statusColor } = calculateProjectStatus(updatedAt, customDescription || repo.description);

  return {
    title: customTitle || repo.name,
    description: customDescription || repo.description || "No description available",
    tags: languages.slice(0, 15), // Top 15 languages
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    status,
    statusColor,
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || undefined,
    clickUrl: clickUrl,
    commitCount: commitCount,
    deploymentCount: deploymentCount,
    lastUpdated: repo.updated_at || undefined,
    featuredImage: featuredImage,
    source: "github",
    featured: featuredRepos?.includes(repo.full_name) ?? false,
    isPrivate: repo.private,
    displayOrder: displayOrder,
  };
}
