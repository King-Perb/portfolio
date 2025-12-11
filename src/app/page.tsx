import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";
import { EasterEggButton } from "@/components/dashboard/easter-egg-button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 fade-in-bottom"> {/* Added consistent gap */}

      {/* Header section (Optional, but nice for context) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity Overview</h1>
          <p className="text-muted-foreground mt-1">
            Tracking contributions and status updates.
          </p>
        </div>
        {/* Optional: Add a 'View All' link if needed later */}
      </div>

      <OverviewMetrics />

      <div className="flex justify-center md:justify-start">
        <EasterEggButton />
      </div>

      <Separator className="my-2 opacity-50" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Featured Projects</h2>
        <ProjectsGrid />
      </div>

    </div>
  );
}
