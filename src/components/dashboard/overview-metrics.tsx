import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_METRICS } from "@/data/mock-data";
import { GitCommitHorizontal, FolderGit2, Rocket } from "lucide-react";
import type { Metric } from "@/types";
import { fetchGitHubStats } from "@/lib/github";

async function getGitHubMetrics() {
  try {
    // Call the function directly instead of going through API route
    // This works during build time and in production
    const stats = await fetchGitHubStats();

    // Calculate total deployments across all repos
    const totalDeployments = stats.repoDeployments
      ? Object.values(stats.repoDeployments as Record<string, number>).reduce((sum: number, count: number) => sum + (count || 0), 0)
      : 0;

    return {
      commits: stats.commitsLastMonth || 0,
      repos: stats.totalRepos || 0,
      totalCommits: stats.totalCommits || 0,
      totalDeployments: totalDeployments,
    };
  } catch (error) {
    // Only log errors in development, not during build
    if (process.env.NODE_ENV === 'development') {
      console.error("Failed to fetch GitHub metrics:", error);
    }
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
          label: "Projects",
          value: formatNumber(githubData.repos),
          subtext: "Total repositories",
          icon: FolderGit2,
          trend: "neutral",
        },
        {
          label: "Deployments",
          value: formatNumber(githubData.totalDeployments),
          subtext: "Total deployments",
          icon: Rocket,
          trend: githubData.totalDeployments > 0 ? "up" : "neutral",
        },
        // Commented out: Total Commits
        // {
        //   label: "Total Commits",
        //   value: formatNumber(githubData.totalCommits),
        //   subtext: "All time",
        //   icon: GitCommitHorizontal,
        //   trend: githubData.totalCommits > 0 ? "up" : "neutral",
        // },
        {
          label: "Commits",
          value: formatNumber(githubData.commits),
          subtext: `Last 30 days`,
          icon: GitCommitHorizontal,
          trend: githubData.commits > 0 ? "up" : "neutral",
        },
        // Commented out: Articles and Stars
        // {
        //   label: "Articles",
        //   value: "28", // Keep mock for now
        //   subtext: "+3 this month",
        //   icon: BookOpen,
        //   trend: "up",
        // },
        // {
        //   label: "Stars",
        //   value: formatNumber(githubData.stars),
        //   subtext: "Across all repos",
        //   icon: Star,
        //   trend: githubData.stars > 0 ? "up" : "neutral",
        // },
      ]
    : MOCK_METRICS;

    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric: Metric, index: number) => (
                <Card key={index} className="bg-card/80 backdrop-blur border border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground font-mono group-hover:text-primary transition-colors">
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
