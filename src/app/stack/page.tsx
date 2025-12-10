import { StackCard } from "@/components/stack/stack-card";
import { MANUAL_TECHNOLOGIES } from "@/data/manual-technologies";

async function getStackData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/github/stats`, {
      next: { revalidate: 3600 },
    });

    const githubLanguages: { [key: string]: number } = {};
    
    if (response.ok) {
      const stats = await response.json();
      Object.assign(githubLanguages, stats.languages || {});
    }

    // Combine GitHub languages with manual technologies
    const allLanguages: { [key: string]: number } = { ...githubLanguages };

    // Add manual technologies
    // If bytes not provided, calculate a default based on average GitHub language size
    const avgGitHubBytes = Object.values(githubLanguages).length > 0
      ? Object.values(githubLanguages).reduce((sum, bytes) => sum + bytes, 0) / Object.values(githubLanguages).length
      : 1000; // Default fallback

    MANUAL_TECHNOLOGIES.forEach((tech) => {
      // Use provided bytes or calculate default
      const bytes = tech.bytes ?? Math.max(100, avgGitHubBytes * 0.5);
      // If technology already exists from GitHub, add to it; otherwise set it
      allLanguages[tech.name] = (allLanguages[tech.name] || 0) + bytes;
    });

    return allLanguages;
  } catch (error) {
    console.error("Failed to fetch stack data:", error);
    
    // Fallback to manual technologies only if GitHub API fails
    const fallbackLanguages: { [key: string]: number } = {};
    MANUAL_TECHNOLOGIES.forEach((tech) => {
      fallbackLanguages[tech.name] = tech.bytes ?? 1000;
    });
    return fallbackLanguages;
  }
}

export default async function StackPage() {
  const languages = await getStackData();
  const languageEntries = Object.entries(languages) as [string, number][];

  // Sort by bytes (most used first)
  languageEntries.sort((a, b) => b[1] - a[1]);

  const totalBytes = languageEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

  return (
    <div className="flex flex-col gap-8 fade-in-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tech Stack</h1>
          <p className="text-muted-foreground mt-1">
            Technologies and languages from my repositories
          </p>
        </div>
      </div>

      {languageEntries.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {languageEntries.map(([language, bytes], index) => (
            <StackCard
              key={language}
              language={language}
              bytes={bytes}
              totalBytes={totalBytes}
              index={index}
            />
          ))}
        </section>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No stack data available.</p>
          <p className="text-sm mt-2">Connect your GitHub account to see your tech stack.</p>
        </div>
      )}
    </div>
  );
}
