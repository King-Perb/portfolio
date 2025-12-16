/**
 * Unified configuration for GitHub project overrides
 *
 * This file consolidates all GitHub project customizations in one place:
 * - Title: Custom title to override GitHub repository name
 * - Tags: Additional technologies not detected from repository languages
 * - Featured images: Custom images for project cards
 * - Descriptions: Custom descriptions to override GitHub repository descriptions
 * - Click URL: Custom URL to open when the project card is clicked (overrides liveUrl/githubUrl)
 * - Display Order: Custom display order (lower numbers appear first, projects without order come after)
 * - Featured: Whether the project should appear in the featured section
 * - Excluded: Whether the project should be excluded from all stats and displays
 *
 * Key: GitHub repository full_name (e.g., "owner/repo-name")
 * Value: Override configuration object
 */
export interface GitHubProjectOverride {
  /** Custom title to override GitHub repository name */
  title?: string;
  /** Additional technology tags to merge with auto-detected languages */
  tags?: string[];
  /** URL path to featured image (e.g., "/screenshots/project.jpg") */
  featuredImage?: string;
  /** Custom description to override GitHub repository description */
  description?: string;
  /** Custom URL to open when project card is clicked (overrides liveUrl/githubUrl priority) */
  clickUrl?: string;
  /** Custom display order (lower numbers appear first, projects without order come after) */
  displayOrder?: number;
  /** Whether this project should be featured on the homepage */
  featured?: boolean;
  /** Whether this project should be excluded from all stats and displays */
  excluded?: boolean;
}

export const GITHUB_PROJECT_OVERRIDES: Record<string, GitHubProjectOverride> = {
  "King-Perb/portfolio": {
    title: "Portfolio",
    displayOrder: 2,
    tags: ["Next.js", "Vercel", "Tailwind", "Shadcn", "React", "TypeScript", "Vitest", "Playwright", "Git", "Cursor"],
    featuredImage: "/screenshots/portfolio-desktop-wide.png",
    description: "A modern portfolio website showcasing my projects and skills",
    clickUrl: "https://portfolio-henna-eight-14.vercel.app",
    featured: true,
  },
  "King-Perb/suiperb-main": {
    title: "suiperb.com",
    displayOrder: 1,
    tags: ["Web3", "Move", "Node.js", "PostreSQL", "React", "Next.js", "Vercel", "Tailwind", "Redux", "GCP", "Docker", "Git", "Cursor", "Postman"],
    featuredImage: "/screenshots/desktop-wide.png",
    description: "A Web3 platform allowing creators minting NFTs and competing in meme contests",
    clickUrl: "https://suiperb.com",
    featured: true,
  },
  "King-Perb/google-cloud-node": {
    excluded: true,
  },
  "King-Perb/contest": {
    excluded: true,
  },
  "King-Perb/suiperb-fastcrypto": {
    excluded: true,
  },
  "King-Perb/suiperb-signapi": {
    excluded: true,
  },
  "King-Perb/suiperb-ai-vision": {
    excluded: true,
  },
  // Add more project overrides here:
  // "owner/repo-name": {
  //   title: "Custom Project Title",
  //   tags: ["Technology1", "Technology2"],
  //   featuredImage: "/screenshots/repo-name.jpg",
  //   description: "Custom description",
  //   displayOrder: 1, // Lower numbers appear first
  //   featured: true,
  //   excluded: false,
  // },
};

/**
 * Helper functions to extract specific override types
 * (for backward compatibility and cleaner code)
 */

/**
 * Get all excluded repository full names
 */
export function getExcludedRepos(): string[] {
  return Object.entries(GITHUB_PROJECT_OVERRIDES)
    .filter(([, override]) => override.excluded === true)
    .map(([repoName]) => repoName);
}

/**
 * Get all featured repository full names
 */
export function getFeaturedRepos(): string[] {
  return Object.entries(GITHUB_PROJECT_OVERRIDES)
    .filter(([, override]) => override.featured === true)
    .map(([repoName]) => repoName);
}

/**
 * Get override for a specific repository
 */
export function getProjectOverride(repoFullName: string): GitHubProjectOverride | undefined {
  return GITHUB_PROJECT_OVERRIDES[repoFullName];
}
