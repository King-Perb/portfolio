import type { Project } from "@/types";
import { MANUAL_PROJECTS } from "@/data/manual-projects";
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
      for (const repo of stats.repos) {
        // Get languages for this repo from the per-repo language data
        // Fallback to primary language if per-repo data is missing
        const repoLanguages = stats.repoLanguages[repo.full_name] || 
          (repo.language ? [repo.language] : []);

        const project = transformRepoToProject(repo, repoLanguages);
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
 */
export async function getProjectsPageProjects(): Promise<Project[]> {
  return getAllProjects();
}

