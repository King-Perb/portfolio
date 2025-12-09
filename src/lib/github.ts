/**
 * GitHub API utility functions
 * Fetches repository data, languages, and commit activity using Octokit SDK
 */

import { Octokit } from "@octokit/rest";

// Type aliases for Octokit response types
type GitHubRepo = Awaited<ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>>["data"][0];
type GitHubLanguage = Awaited<ReturnType<Octokit["rest"]["repos"]["listLanguages"]>>["data"];

export interface GitHubStats {
  totalCommits: number;
  commitsLastMonth: number;
  totalRepos: number;
  languages: { [key: string]: number }; // Aggregated across all repos
  repos: GitHubRepo[];
  repoLanguages: { [repoFullName: string]: string[] }; // Per-repo languages (keyed by repo full_name)
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
 * Aggregate all GitHub statistics
 */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  // Create authenticated Octokit instance
  const octokit = createOctokit();

  // Fetch all repositories (with automatic pagination)
  const repos = await fetchAllRepos(octokit);

  // Calculate date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  // Aggregate languages and commits, and store per-repo languages
  const languages: { [key: string]: number } = {};
  const repoLanguages: { [repoFullName: string]: string[] } = {};
  let commitsLastMonth = 0;

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
    const commits = await fetchRepoCommits(octokit, owner, repo.name, since);
    commitsLastMonth += commits;
  }

  return {
    totalCommits: 0, // Can be calculated if needed in future
    commitsLastMonth,
    totalRepos: repos.length,
    languages,
    repos,
    repoLanguages,
  };
}

/**
 * Transform GitHub repository to Project interface
 */
export function transformRepoToProject(
  repo: GitHubRepo,
  languages: string[]
): import("@/types").Project {
  // Determine status based on updated_at
  const updatedAt = repo.updated_at || new Date().toISOString();
  const lastUpdated = new Date(updatedAt);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

  let status: import("@/types").ProjectStatus = "Active";
  let statusColor = "text-primary border-primary/20 bg-primary/10";

  if (daysSinceUpdate > 365) {
    status = "Archived";
    statusColor = "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/10";
  } else if (daysSinceUpdate > 180) {
    status = "Maintained";
    statusColor = "text-blue-400 border-blue-400/20 bg-blue-400/10";
  } else if (repo.description?.toLowerCase().includes("beta") || repo.description?.toLowerCase().includes("wip")) {
    status = "Beta";
    statusColor = "text-yellow-400 border-yellow-400/20 bg-yellow-400/10";
  }

  return {
    title: repo.name,
    description: repo.description || "No description available",
    tags: languages.slice(0, 5), // Top 5 languages
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    status,
    statusColor,
    githubUrl: repo.html_url,
    liveUrl: repo.homepage || undefined,
    lastUpdated: repo.updated_at || undefined,
    source: "github",
    featured: false, // Can be manually curated later
  };
}

