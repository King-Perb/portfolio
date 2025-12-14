"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { Project } from "@/types";
import { ProjectStats } from "./project-stats";
import { getProjectImageUrl } from "@/lib/project-utils";
import { ENABLE_PROJECT_IMAGE_ZOOM } from "@/lib/constants";

interface ProjectCardProps {
  project: Project;
  showScreenshot?: boolean;
}

export function ProjectCard({ project, showScreenshot = false }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getProjectImageUrl(project);

  // Determine which links are available
  const hasAppLink = Boolean(project.liveUrl || project.clickUrl);
  const hasRepoLink = Boolean(project.githubUrl);
  const isPrivateRepo = project.isPrivate === true;

  return (
    <Card
      className={cn(
        "flex flex-col bg-card/80 backdrop-blur border transition-all group",
        isHovered
          ? "border-primary/50 bg-muted/5 shadow-[0_0_12px] shadow-primary/15"
          : "border-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showScreenshot && imageUrl && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-xl -mt-6 mb-6">
          <Image
            src={imageUrl}
            alt={project.title}
            fill
            className={cn(
              "object-cover transition-transform duration-300 rounded-t-xl",
              ENABLE_PROJECT_IMAGE_ZOOM && isHovered && "scale-105"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Green overlay for "Hacker Mode" aesthetic */}
          <div className={cn(
            "absolute inset-0 mix-blend-overlay transition-colors duration-300 rounded-t-xl pointer-events-none",
            isHovered ? "bg-primary/40" : "bg-primary/30"
          )} />
        </div>
      )}

      {/* Text content section with overlay */}
      <div className="relative flex flex-col flex-1 min-h-0">
        {/* Text content with blur effect on hover */}
        <div className={cn(
          "flex flex-col flex-1 min-h-0 transition-all duration-300",
          isHovered && "blur-sm"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "text-base font-bold transition-colors",
                isHovered ? "text-primary" : "text-foreground"
              )}>
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

          <CardContent className="pt-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              {project.tags.map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-sm font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-0 border-t border-border/30 mt-auto pt-4 flex items-center justify-between text-muted-foreground">
            <ProjectStats project={project} />
          </CardFooter>
        </div>

        {/* Hover overlay with action buttons - only covers text section */}
        {(hasAppLink || hasRepoLink) && (
          <div className={cn(
            "absolute inset-0 bg-background/90 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center gap-3 rounded-xl",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            {hasAppLink && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className={cn(
                  "border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10 font-mono text-xs transition-all duration-300 delay-75",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}
              >
                <a
                  href={project.clickUrl || project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  App
                </a>
              </Button>
            )}
            {hasRepoLink && !isPrivateRepo && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className={cn(
                  "border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10 font-mono text-xs transition-all duration-300 delay-150",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}
              >
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-3 w-3 mr-1.5" />
                  Repository
                </a>
              </Button>
            )}
            {isPrivateRepo && (
              <Button
                variant="outline"
                size="sm"
                disabled
                className={cn(
                  "border-muted-foreground/30 text-muted-foreground font-mono text-xs cursor-not-allowed transition-all duration-300 delay-150",
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}
              >
                <Lock className="h-3 w-3 mr-1.5" />
                Private Repo
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
