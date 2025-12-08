"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_PROJECTS } from "@/data/mock-data";
import type { Project } from "@/types";

export function ProjectsGrid() {
    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {MOCK_PROJECTS.map((project: Project, index: number) => (
                <Card key={index} className="flex flex-col bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:bg-muted/5 hover:shadow-[0_0_12px] hover:shadow-primary/15 group cursor-pointer">
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
                    <CardContent className="mt-auto pt-4"> {/* Push content to bottom */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {project.tags.map(tag => (
                                <span key={tag} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-sm font-mono">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0 border-t border-border/30 mt-4 pt-4 flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-1 hover:text-foreground">
                                <Star className="h-3 w-3" />
                                {project.stars}
                            </div>
                            <div className="flex items-center gap-1 hover:text-foreground">
                                <GitFork className="h-3 w-3" />
                                {project.forks}
                            </div>
                        </div>
                        <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary font-mono">
                            View Project →
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </section>
    );
}
