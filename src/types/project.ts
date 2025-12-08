import { LucideIcon } from "lucide-react";

export type ProjectStatus = "Active" | "Maintained" | "Beta" | "Archived";

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
  commitCount?: number;
  lastUpdated?: string;
  featuredImage?: string;
}

