/**
 * Manual technologies configuration
 * Add technologies that are not detected from GitHub repository languages
 * (e.g., tools, frameworks, services, infrastructure)
 *
 * These technologies are displayed separately from GitHub repository languages
 * without percentage bars or byte information.
 */
export const MANUAL_TECHNOLOGIES: Array<{ name: string }> = [
  // Languages
  { name: "TypeScript" },
  { name: "Python" },
  { name: "Node.js + Bun" },

  // Frameworks & Libraries
  { name: "Next.js" },
  { name: "React" },
  { name: "Elysia" },
  { name: "Move (SUI)" },

  // State Management & Data Fetching
  { name: "RTK Query" },

  // Styling & UI
  { name: "Tailwind" },
  { name: "Shadcn" },
  { name: "Radix" },

  // Backend & Database
  { name: "Supabase" },
  { name: "Prisma" },
  { name: "Zod" },

  // Testing
  { name: "Pytest" },
  { name: "Vitest" },

  // Infrastructure & DevOps
  { name: "Docker" },
  { name: "Vercel" },
  { name: "GCP" },

  // Monitoring & Analytics
  { name: "Sentry" },
  { name: "Statsig" },

  // PWA & Tools
  { name: "Serwist for PWA" },
  { name: "Cursor" },
  { name: "Postman" },
  { name: "Ngrok" },

  // Project Management
  { name: "Scrum, Kanban" },
  { name: "Trello, JIRA" },
];
