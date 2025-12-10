"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { Project } from "@/types";
import { ProjectStats } from "./project-stats";
import { useProjectCardClick } from "@/hooks/use-project-card-click";
import { getProjectImageUrl } from "@/lib/project-utils";

interface ProjectCardProps {
  project: Project;
  showScreenshot?: boolean;
}

export function ProjectCard({ project, showScreenshot = false }: ProjectCardProps) {
  const { handleClick, handleKeyDown, isClickable } = useProjectCardClick(project);
  const imageUrl = getProjectImageUrl(project);
  
  return (
    <Card 
      className={cn(
        "flex flex-col bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:bg-muted/5 hover:shadow-[0_0_12px] hover:shadow-primary/15 group",
        isClickable && "cursor-pointer"
      )}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      {showScreenshot && imageUrl && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-xl -mt-6 mb-6 hidden md:block">
          <Image
            src={imageUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider", project.statusColor)}>
            {project.status}
          </span>
        </div>
        <CardDescription className="line-clamp-2 text-muted-foreground/80 mt-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto pt-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-sm font-mono">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0 border-t border-border/30 mt-4 pt-4 flex items-center justify-between text-muted-foreground">
        <ProjectStats project={project} />
        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary font-mono hover:underline flex items-center gap-1"
            >
              <Github className="h-3 w-3" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary font-mono hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary font-mono">
            View →
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
