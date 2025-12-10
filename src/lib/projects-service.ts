import type { Project } from "@/types";
import { MANUAL_PROJECTS } from "@/data/manual-projects";
import { getExcludedRepos, getFeaturedRepos, getProjectOverride, type GitHubProjectOverride } from "@/data/github-project-overrides";
import { transformRepoToProject } from "@/lib/github";
import type { GitHubStats, GitHubRepo } from "@/lib/github";
import { sortByLastUpdated, sortByImageThenDate } from "@/lib/project-sorters";

/**
 * Service layer for combining GitHub and manual projects
 */

/**
 * Extract project override data from a GitHub repository and stats
 */
function extractProjectOverrides(
  repo: GitHubRepo,
  stats: GitHubStats,
  override?: GitHubProjectOverride
) {
  // Get languages for this repo from the per-repo language data
  // Fallback to primary language if per-repo data is missing
  const repoLanguages = stats.repoLanguages[repo.full_name] ||
    (repo.language ? [repo.language] : []);

  // Merge with manually added tags from override
  const manualTags = override?.tags || [];
  // Combine auto-detected languages with manual tags, removing duplicates
  const allTags = Array.from(new Set([...repoLanguages, ...manualTags]));

  return {
    tags: allTags,
    commitCount: stats.repoCommits?.[repo.full_name],
    deploymentCount: stats.repoDeployments?.[repo.full_name],
    featuredImage: override?.featuredImage,
    customDescription: override?.description,
    clickUrl: override?.clickUrl,
  };
}

/**
 * Get all projects (GitHub + manual)
 */
export async function getAllProjects(): Promise<Project[]> {
  const projects: Project[] = [];

  // Add manual projects
  projects.push(...MANUAL_PROJECTS);

  // Try to fetch GitHub projects
  try {
    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/github/stats`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const stats: GitHubStats = await response.json();

      // Transform GitHub repos to projects
      const excludedRepos = getExcludedRepos();
      const featuredRepos = getFeaturedRepos();
      
      for (const repo of stats.repos) {
        // Skip excluded repositories (safety check - they should already be filtered in fetchGitHubStats)
        if (excludedRepos.includes(repo.full_name)) {
          continue;
        }

        // Get override configuration for this repo
        const override = getProjectOverride(repo.full_name);

        // Extract all override data
        const overrideData = extractProjectOverrides(repo, stats, override);

        // Transform repo to project
        const project = transformRepoToProject(repo, {
          languages: overrideData.tags,
          featuredRepos,
          commitCount: overrideData.commitCount,
          deploymentCount: overrideData.deploymentCount,
          featuredImage: overrideData.featuredImage,
          customDescription: overrideData.customDescription,
          clickUrl: overrideData.clickUrl,
        });
        projects.push(project);
      }
    }
  } catch (error) {
    console.error("Failed to fetch GitHub projects:", error);
    // Continue with manual projects only
  }

  // Sort by last updated (most recent first)
  return sortByLastUpdated(projects);
}

/**
 * Get featured projects for homepage
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  const allProjects = await getAllProjects();
  return allProjects.filter((p) => p.featured === true).slice(0, 4);
}

/**
 * Get projects for projects page (all projects)
 * Sorted to show projects with images first, then by last updated
 */
export async function getProjectsPageProjects(): Promise<Project[]> {
  const projects = await getAllProjects();
  
  // Sort: projects with images first, then by last updated
  return sortByImageThenDate(projects);
}
