import { StackCard } from "@/components/stack/stack-card";
import { MANUAL_TECHNOLOGIES } from "@/data/manual-technologies";
import { fetchGitHubStats } from "@/lib/github";
import { MobileNextSectionButton } from "@/components/navigation/mobile-next-section-button";

async function getStackData() {
  try {
    // Call the function directly instead of going through API route
    // This works during build time and in production
    const stats = await fetchGitHubStats();
    const githubLanguages: { [key: string]: number } = stats.languages || {};

    // Prepare manual technologies
    // If bytes not provided, calculate a default based on average GitHub language size
    const avgGitHubBytes = Object.values(githubLanguages).length > 0
      ? Object.values(githubLanguages).reduce((sum, bytes) => sum + bytes, 0) / Object.values(githubLanguages).length
      : 1000; // Default fallback

    const manualTechs: { [key: string]: number } = {};
    MANUAL_TECHNOLOGIES.forEach((tech) => {
      // Use provided bytes or calculate default
      const bytes = tech.bytes ?? Math.max(100, avgGitHubBytes * 0.5);
      // Only add if not already in GitHub languages
      if (!githubLanguages[tech.name]) {
        manualTechs[tech.name] = bytes;
      }
    });

    return {
      github: githubLanguages,
      manual: manualTechs,
    };
  } catch (error) {
    console.error("Failed to fetch stack data:", error);

    // Fallback to manual technologies only if GitHub API fails
    const fallbackManual: { [key: string]: number } = {};
    MANUAL_TECHNOLOGIES.forEach((tech) => {
      fallbackManual[tech.name] = tech.bytes ?? 1000;
    });
    return {
      github: {},
      manual: fallbackManual,
    };
  }
}

export default async function StackPage() {
  const { github, manual } = await getStackData();
  const githubEntries = Object.entries(github) as [string, number][];
  const manualEntries = Object.entries(manual) as [string, number][];

  // Sort by bytes (most used first)
  githubEntries.sort((a, b) => b[1] - a[1]);
  manualEntries.sort((a, b) => b[1] - a[1]);

  // Calculate total bytes for percentage calculation
  const githubTotalBytes = githubEntries.reduce((sum, [, bytes]) => sum + bytes, 0);
  const manualTotalBytes = manualEntries.reduce((sum, [, bytes]) => sum + bytes, 0);
  const allTotalBytes = githubTotalBytes + manualTotalBytes;

  const hasAnyData = githubEntries.length > 0 || manualEntries.length > 0;

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

      {hasAnyData ? (
        <>
          {githubEntries.length > 0 && (
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {githubEntries.map(([language, bytes], index) => (
                <StackCard
                  key={language}
                  language={language}
                  bytes={bytes}
                  totalBytes={allTotalBytes}
                  index={index}
                />
              ))}
            </section>
          )}

          {manualEntries.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Other technologies</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {manualEntries.map(([language, bytes], index) => (
                  <StackCard
                    key={language}
                    language={language}
                    bytes={bytes}
                    totalBytes={allTotalBytes}
                    index={githubEntries.length + index}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No stack data available.</p>
          <p className="text-sm mt-2">Connect your GitHub account to see your tech stack.</p>
        </div>
      )}

      <MobileNextSectionButton />
    </div>
  );
}
