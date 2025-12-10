import { GitCommitHorizontal, FolderGit2, Rocket } from "lucide-react";
import type { Project, Metric } from "@/types";

export const MOCK_PROJECTS: Project[] = [
  {
    title: "AI Workflow Automation",
    description: "Framework for building and deploying AI-powered automation workflows with intelligent routing.",
    tags: ["TypeScript", "Python", "OpenAI"],
    stars: 234,
    forks: 42,
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    source: "manual",
    featured: true,
  },
  {
    title: "Portfolio Generator",
    description: "AI-powered tool that analyzes GitHub activity and generates beautiful sites automatically.",
    tags: ["React", "Next.js", "Tailwind"],
    stars: 189,
    forks: 28,
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    source: "manual",
    featured: true,
  },
  {
    title: "Smart Document Parser",
    description: "Extract structured data from unstructured documents using GPT-4 Vision.",
    tags: ["Python", "Docker"],
    stars: 156,
    forks: 19,
    status: "Maintained",
    statusColor: "text-blue-400 border-blue-400/20 bg-blue-400/10",
    source: "manual",
    featured: true,
  },
  {
    title: "Code Review Assistant",
    description: "AI-powered code review tool that provides intelligent feedback on pull requests.",
    tags: ["TypeScript", "GitHub Actions"],
    stars: 342,
    forks: 67,
    status: "Beta",
    statusColor: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    source: "manual",
    featured: true,
  },
];

export const MOCK_METRICS: Metric[] = [
  {
    label: "Projects",
    value: "14",
    subtext: "2 active",
    icon: FolderGit2,
    trend: "neutral",
  },
  {
    label: "Deployments",
    value: "42",
    subtext: "Total deployments",
    icon: Rocket,
    trend: "up",
  },
  {
    label: "Total Commits",
    value: "15.2k",
    subtext: "All time",
    icon: GitCommitHorizontal,
    trend: "up",
  },
  {
    label: "Commits",
    value: "2,542",
    subtext: "+124 this week",
    icon: GitCommitHorizontal,
    trend: "up",
  },
  // Commented out: Articles and Stars
  // {
  //   label: "Articles",
  //   value: "28",
  //   subtext: "+3 this month",
  //   icon: BookOpen,
  //   trend: "up",
  // },
  // {
  //   label: "Stars",
  //   value: "1.2k",
  //   subtext: "Across all repos",
  //   icon: Star,
  //   trend: "up",
  // },
];
