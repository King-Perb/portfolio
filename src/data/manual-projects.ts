import type { Project } from "@/types";

/**
 * Manually curated projects not in GitHub
 * (e.g., WordPress sites, client work, etc.)
 *
 * Technologies are specified via the `tags` array.
 * You can also set `commitCount` and `deploymentCount` for manual projects.
 */
export const MANUAL_PROJECTS: Project[] = [
  // Example structure - add your manual projects here
  // {
  //   title: "Client Website",
  //   description: "WordPress website built for client",
  //   tags: ["WordPress", "PHP", "CSS"], // Technologies used in this project
  //   stars: 0,
  //   forks: 0,
  //   status: "Active",
  //   statusColor: "text-primary border-primary/20 bg-primary/10",
  //   liveUrl: "https://example.com",
  //   screenshot: "/projects/client-website.jpg",
  //   source: "manual",
  //   featured: false,
  //   commitCount: 150, // Optional: total commits if tracked elsewhere
  //   deploymentCount: 5, // Optional: total deployments
  // },

  // Wordpress website
  {
    title: "langexpress.pl",
    description: "WordPress website built for personal language and career coaching",
    tags: ["WordPress", "PHP", "CSS", "Cloudflare", "Elementor", "SEO", "Google Analytics"],
    stars: 0,
    forks: 0,
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    liveUrl: "https://langexpress.pl",
    screenshot: "/screenshots/langexpress-desktop-wide.png",
    source: "manual",
    featured: true,
    commitCount: 0,
    deploymentCount: 0,
  },

  // AI Miko
  {
    title: "Miko AI",
    description: "An AI chatbot that can answer questions about Miko's portfolio, projects, experience, and tech stack.",
    tags: ["OpenAI", "Vector Store", "Custom AI Assistant", "Speckit"],
    stars: 0,
    forks: 0,
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    liveUrl: "/ai-miko",
    screenshot: "/screenshots/miko-ai-desktop-wide.png",
    source: "manual",
    featured: true,
    commitCount: 0,
    deploymentCount: 0,
  },
];
