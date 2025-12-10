/**
 * GitHub API utility functions
 * Fetches repository data, languages, and commit activity using Octokit SDK
 */

import { Octokit } from "@octokit/rest";
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

/**
 * Create an authenticated Octokit instance
 */
function createOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
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
 * Aggregate all GitHub statistics
 */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  // Create authenticated Octokit instance
  const octokit = createOctokit();

  // Fetch all repositories (with automatic pagination)
  const allRepos = await fetchAllRepos(octokit);

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
 * Options for transforming a GitHub repository to a Project
 */
export interface TransformRepoOptions {
  languages: string[];
  featuredRepos?: string[];
  commitCount?: number;
  deploymentCount?: number;
  featuredImage?: string;
  customDescription?: string;
  clickUrl?: string;
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
    clickUrl,
  } = options;

  // Determine status based on updated_at
  const updatedAt = repo.updated_at || new Date().toISOString();
  const { status, statusColor } = calculateProjectStatus(updatedAt, customDescription || repo.description);

  return {
    title: repo.name,
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
  };
}
