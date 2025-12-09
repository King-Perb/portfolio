import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_METRICS } from "@/data/mock-data";
import { GitCommitHorizontal, FolderGit2, BookOpen, Star } from "lucide-react";
import type { Metric } from "@/types";

async function getGitHubMetrics() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/github/stats`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const stats = await response.json();
      const starsSum = stats.repos?.reduce((sum: number, repo: { stargazers_count?: number }) => {
        const stars = repo.stargazers_count ?? 0;
        return sum + (typeof stars === 'number' && !isNaN(stars) && stars >= 0 ? stars : 0);
      }, 0) ?? 0;

      return {
        commits: stats.commitsLastMonth || 0,
        repos: stats.totalRepos || 0,
        stars: typeof starsSum === 'number' && !isNaN(starsSum) ? starsSum : 0,
      };
    }
  } catch (error) {
    console.error("Failed to fetch GitHub metrics:", error);
  }

  return null;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toLocaleString();
}

export async function OverviewMetrics() {
  const githubData = await getGitHubMetrics();

  const metrics: Metric[] = githubData
    ? [
        {
          label: "Commits",
          value: formatNumber(githubData.commits),
          subtext: `Last 30 days`,
          icon: GitCommitHorizontal,
          trend: githubData.commits > 0 ? "up" : "neutral",
        },
        {
          label: "Projects",
          value: formatNumber(githubData.repos),
          subtext: "Total repositories",
          icon: FolderGit2,
          trend: "neutral",
        },
        {
          label: "Articles",
          value: "28", // Keep mock for now
          subtext: "+3 this month",
          icon: BookOpen,
          trend: "up",
        },
        {
          label: "Stars",
          value: formatNumber(githubData.stars),
          subtext: "Across all repos",
          icon: Star,
          trend: githubData.stars > 0 ? "up" : "neutral",
        },
      ]
    : MOCK_METRICS;

    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric: Metric, index: number) => (
                <Card key={index} className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground font-mono">
                            {metric.label.toUpperCase()}
                        </CardTitle>
                        <metric.icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                            {metric.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                            <span className={cn(
                                "mr-1",
                                metric.trend === "up" ? "text-primary" : "text-muted-foreground"
                            )}>
                                {metric.subtext.split(" ")[0]}
                            </span>
                            {metric.subtext.split(" ").slice(1).join(" ")}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
