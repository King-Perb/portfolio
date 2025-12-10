import type { Project } from "@/types";

/**
 * Sort projects by last updated date (most recent first)
 */
export function sortByLastUpdated(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Sort projects: those with images first, then by last updated date
 */
export function sortByImageThenDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
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

