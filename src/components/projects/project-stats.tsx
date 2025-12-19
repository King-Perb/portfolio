import { GitCommitHorizontal, Rocket } from "lucide-react";
import type { Project } from "@/types";
import type { LucideIcon } from "lucide-react";

interface ProjectStatsProps {
  readonly project: Project;
}

interface StatItemProps {
  readonly icon: LucideIcon;
  readonly value: number;
  readonly title: string;
}

function StatItem({ icon: Icon, value, title }: StatItemProps) {
  return (
    <div className="flex items-center gap-1 hover:text-foreground" title={title}>
      <Icon className="h-3 w-3" />
      {value}
    </div>
  );
}

export function ProjectStats({ project }: ProjectStatsProps) {
  return (
    <div className="flex items-center gap-4 text-xs font-mono">
      {project.source === "github" && (
        <>
          {/* <StatItem icon={Star} value={project.stars} title="Stars" /> */}
          {/* <StatItem icon={GitFork} value={project.forks} title="Forks" /> */}
        </>
      )}
      {project.commitCount !== undefined && project.commitCount > 0 && (
        <StatItem
          icon={GitCommitHorizontal}
          value={project.commitCount}
          title="Total commits"
        />
      )}
      {project.deploymentCount !== undefined && project.deploymentCount > 0 && (
        <StatItem
          icon={Rocket}
          value={project.deploymentCount}
          title="Total deployments"
        />
      )}
    </div>
  );
}
