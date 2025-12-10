import type { Project } from "@/types";
import { MANUAL_PROJECTS } from "@/data/manual-projects";
import { getExcludedRepos, getFeaturedRepos, getProjectOverride } from "@/data/github-project-overrides";
import { transformRepoToProject } from "@/lib/github";
import type { GitHubStats } from "@/lib/github";

/**
 * Service layer for combining GitHub and manual projects
 */

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

        // Get languages for this repo from the per-repo language data
        // Fallback to primary language if per-repo data is missing
        const repoLanguages = stats.repoLanguages[repo.full_name] ||
          (repo.language ? [repo.language] : []);

        // Merge with manually added tags from override
        const manualTags = override?.tags || [];
        // Combine auto-detected languages with manual tags, removing duplicates
        const allTags = Array.from(new Set([...repoLanguages, ...manualTags]));

        // Get commit and deployment counts for this repo
        const commitCount = stats.repoCommits?.[repo.full_name];
        const deploymentCount = stats.repoDeployments?.[repo.full_name];

        // Get featured image from override if configured
        const featuredImage = override?.featuredImage;

        // Get custom description from override if configured, otherwise use GitHub description
        const customDescription = override?.description;

        // Get click URL from override if configured
        const clickUrl = override?.clickUrl;

        const project = transformRepoToProject(
          repo,
          allTags,
          featuredRepos,
          commitCount,
          deploymentCount,
          featuredImage,
          customDescription,
          clickUrl
        );
        projects.push(project);
      }
    }
  } catch (error) {
    console.error("Failed to fetch GitHub projects:", error);
    // Continue with manual projects only
  }

  // Sort by last updated (most recent first)
  return projects.sort((a, b) => {
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });
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
  return projects.sort((a, b) => {
    // Check if project has an image (featuredImage or screenshot)
    const aHasImage = !!(a.featuredImage || a.screenshot);
    const bHasImage = !!(b.featuredImage || b.screenshot);
    
    // If one has an image and the other doesn't, prioritize the one with image
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    
    // If both have images or both don't, sort by last updated (most recent first)
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });
}
