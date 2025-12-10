export type ProjectStatus = "Active" | "Maintained" | "Beta" | "Archived";
export type ProjectSource = "github" | "manual";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  stars: number;
  forks: number;
  status: ProjectStatus;
  statusColor: string;
  githubUrl?: string;
  liveUrl?: string;
  clickUrl?: string; // Custom URL to open when card is clicked (overrides liveUrl/githubUrl priority)
  commitCount?: number;
  deploymentCount?: number;
  lastUpdated?: string;
  featuredImage?: string;
  screenshot?: string;
  source: ProjectSource;
  featured?: boolean;
}
