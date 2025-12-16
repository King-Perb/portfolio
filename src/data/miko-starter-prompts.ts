export type MikoStarterPromptCategory = "experience" | "projects" | "help" | string;

export interface MikoStarterPrompt {
  id: string;
  text: string;
  category?: MikoStarterPromptCategory;
}

/**
 * Central list of starter questions for the Miko AI chat.
 * These are shown as clickable bubbles above the input on `/ai-miko`.
 *
 * The prompts are grouped conceptually by theme (experience, projects, etc.)
 * and ordered to follow a natural recruiter-style conversation flow.
 */
export const MIKO_STARTER_PROMPTS: readonly MikoStarterPrompt[] = [
  // Background & overview
  {
    id: "experience-1",
    text: "Can you tell me about your background as a developer?",
    category: "experience",
  },
  {
    id: "experience-2",
    text: "How would you describe your current role and responsibilities?",
    category: "experience",
  },
  {
    id: "experience-3",
    text: "What types of products or companies have you mainly worked with?",
    category: "experience",
  },

  // Technology stack & preferences
  {
    id: "experience-4",
    text: "What technologies do you enjoy working with the most?",
    category: "experience",
  },
  {
    id: "experience-5",
    text: "Which parts of the stack do you feel strongest in?",
    category: "experience",
  },
  {
    id: "experience-6",
    text: "Are there any tools or frameworks you’ve recently started using or want to learn?",
    category: "experience",
  },

  // Projects overview
  {
    id: "projects-1",
    text: "What are some of your favorite projects you’ve built?",
    category: "projects",
  },
  {
    id: "projects-3",
    text: "Which project are you most proud of, and why?",
    category: "projects",
  },

  // Deep dive into problem-solving
  {
    id: "projects-2",
    text: "Which project best shows your problem‑solving skills?",
    category: "projects",
  },
  {
    id: "projects-4",
    text: "Can you describe a difficult technical challenge you faced and how you solved it?",
    category: "projects",
  },
  {
    id: "projects-5",
    text: "What trade-offs did you have to make in that project?",
    category: "projects",
  },

  // Front-end / full-stack specifics
  {
    id: "frontend-1",
    text: "How do you approach building a new UI or feature from scratch?",
    category: "frontend",
  },
  {
    id: "frontend-2",
    text: "How do you ensure performance and accessibility in your applications?",
    category: "frontend",
  },
  {
    id: "fullstack-1",
    text: "How do you design the interaction between the front end and back end?",
    category: "fullstack",
  },
  {
    id: "fullstack-2",
    text: "Have you worked with APIs or databases directly? Can you give an example?",
    category: "fullstack",
  },

  // Collaboration & process
  {
    id: "collaboration-1",
    text: "How do you typically collaborate with designers, product managers, or backend developers?",
    category: "collaboration",
  },
  {
    id: "collaboration-2",
    text: "Can you describe a time you received critical feedback on your work?",
    category: "collaboration",
  },
  {
    id: "collaboration-3",
    text: "How do you handle disagreements on technical decisions?",
    category: "collaboration",
  },

  // Growth & learning
  {
    id: "growth-1",
    text: "How do you keep your skills up to date?",
    category: "growth",
  },
  {
    id: "growth-2",
    text: "What’s a technology or concept that recently changed how you work?",
    category: "growth",
  },

  // Reflection & fit
  {
    id: "reflection-1",
    text: "If you could redo one project, what would you do differently?",
    category: "reflection",
  },
  {
    id: "reflection-2",
    text: "What kind of team or environment do you do your best work in?",
    category: "reflection",
  },
] as const;
