/**
 * Manual technologies configuration
 * Add technologies that are not detected from GitHub repository languages
 * (e.g., tools, frameworks, services, infrastructure)
 *
 * Optional `bytes` field is used for percentage calculation when combined with GitHub languages
 * If not provided, a default value will be calculated based on position in array
 */
export const MANUAL_TECHNOLOGIES: Array<{ name: string; bytes?: number }> = [
  // Infrastructure & DevOps
  { name: "Docker", bytes: 1000 },
  { name: "Kubernetes", bytes: 500 },
  { name: "AWS", bytes: 2000 },
  { name: "Vercel", bytes: 1500 },

  // Tools & Services
  // Add more technologies as needed
];
