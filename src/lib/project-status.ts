import type { ProjectStatus } from "@/types";

/**
 * Calculate project status and status color based on last updated date and description
 */
export function calculateProjectStatus(
  updatedAt: string,
  description?: string | null
): { status: ProjectStatus; statusColor: string } {
  const lastUpdated = new Date(updatedAt);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate > 365) {
    return {
      status: "Archived",
      statusColor: "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/10",
    };
  }
  
  if (daysSinceUpdate > 180) {
    return {
      status: "Maintained",
      statusColor: "text-blue-400 border-blue-400/20 bg-blue-400/10",
    };
  }
  
  if (description?.toLowerCase().includes("beta") || description?.toLowerCase().includes("wip")) {
    return {
      status: "Beta",
      statusColor: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    };
  }
  
  return {
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
  };
}

