import { StackCard } from "@/components/stack/stack-card";

async function getStackData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/github/stats`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const stats = await response.json();
      return stats.languages || {};
    }
  } catch (error) {
    console.error("Failed to fetch stack data:", error);
  }

  return {};
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
