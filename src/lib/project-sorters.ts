import type { Project } from "@/types";

/**
 * Sort projects by last updated date (most recent first)
 * Projects with displayOrder come first, sorted by order, then by date
 */
export function sortByLastUpdated(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    // Projects with displayOrder come first
    const aHasOrder = a.displayOrder !== undefined;
    const bHasOrder = b.displayOrder !== undefined;

    if (aHasOrder && bHasOrder) {
      // Both have order: sort by order (lower numbers first)
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    }
    if (aHasOrder && !bHasOrder) return -1; // a comes first
    if (!aHasOrder && bHasOrder) return 1; // b comes first

    // Neither has order: sort by date (most recent first)
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Sort projects: those with displayOrder first, then those with images, then by last updated date
 */
export function sortByImageThenDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    // Projects with displayOrder come first
    const aHasOrder = a.displayOrder !== undefined;
    const bHasOrder = b.displayOrder !== undefined;

    if (aHasOrder && bHasOrder) {
      // Both have order: sort by order (lower numbers first)
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    }
    if (aHasOrder && !bHasOrder) return -1; // a comes first
    if (!aHasOrder && bHasOrder) return 1; // b comes first

    // Neither has order: check if project has an image (featuredImage or screenshot)
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
