import { ProjectCard } from "@/components/projects/project-card";
import { getProjectsPageProjects } from "@/lib/projects-service";
import { MobileNextSectionButton } from "@/components/navigation/mobile-next-section-button";

export default async function ProjectsPage() {
  const projects = await getProjectsPageProjects();

  return (
    <div className="flex flex-col gap-8 fade-in-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">All Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} {projects.length === 1 ? "project" : "projects"} total
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard key={`${project.source}-${index}`} project={project} showScreenshot={true} />
        ))}
      </section>

      {projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No projects found.</p>
        </div>
      )}

      <MobileNextSectionButton />
    </div>
  );
}
