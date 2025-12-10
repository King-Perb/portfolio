import type { Project } from "@/types";

/**
 * Get the URL to open when a project card is clicked
 * Priority: clickUrl > liveUrl > githubUrl
 */
export function getProjectClickUrl(project: Project): string | undefined {
  return project.clickUrl || project.liveUrl || project.githubUrl;
}

/**
 * Get the image URL for a project
 * Priority: featuredImage > screenshot
 */
export function getProjectImageUrl(project: Project): string | undefined {
  return project.featuredImage || project.screenshot;
}

