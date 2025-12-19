import { StackCard } from "@/components/stack/stack-card";
import { TechnologyCard } from "@/components/stack/technology-card";
import { MANUAL_TECHNOLOGIES } from "@/data/manual-technologies";
import { fetchGitHubStats } from "@/lib/github";
import { MobileNextSectionButton } from "@/components/navigation/mobile-next-section-button";

async function getStackData() {
  try {
    // Call the function directly instead of going through API route
    // This works during build time and in production
    const stats = await fetchGitHubStats();
    const githubLanguages: { [key: string]: number } = stats.languages || {};

    // Get manual technologies (just names, no bytes)
    // Filter out any that are already in GitHub languages
    const manualTechs = MANUAL_TECHNOLOGIES
      .filter((tech) => !githubLanguages[tech.name])
      .map((tech) => tech.name);

    return {
      github: githubLanguages,
      manual: manualTechs,
    };
  } catch (error) {
    console.error("Failed to fetch stack data:", error);

    // Fallback to manual technologies only if GitHub API fails
    const fallbackManual = MANUAL_TECHNOLOGIES.map((tech) => tech.name);
    return {
      github: {},
      manual: fallbackManual,
    };
  }
}

export default async function StackPage() {
  const { github, manual } = await getStackData();
  const githubEntries = Object.entries(github);

  // Sort GitHub languages by bytes (most used first)
  githubEntries.sort((a, b) => b[1] - a[1]);

  // Calculate total bytes for percentage calculation (GitHub languages only)
  const githubTotalBytes = githubEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

  const hasAnyData = githubEntries.length > 0 || manual.length > 0;

  return (
    <div className="flex flex-col gap-8 fade-in-bottom md:pb-8">
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
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Repository Languages</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {githubEntries.map(([language, bytes], index) => (
                  <StackCard
                    key={language}
                    language={language}
                    bytes={bytes}
                    totalBytes={githubTotalBytes}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          {manual.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Technologies & Tools</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {manual.map((name) => (
                  <TechnologyCard
                    key={name}
                    name={name}
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
