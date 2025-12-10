import { ProjectCard } from "@/components/projects/project-card";
import { getFeaturedProjects } from "@/lib/projects-service";
import { MOCK_PROJECTS } from "@/data/mock-data";

export async function ProjectsGrid() {
    let projects = await getFeaturedProjects();

    // Fallback to mock data if no featured projects
    if (projects.length === 0) {
        projects = MOCK_PROJECTS.map(p => ({ ...p, source: "manual" as const, featured: true }));
    }

    // Generate stable unique keys for React reconciliation
    const getProjectKey = (project: typeof projects[0]): string => {
        // For GitHub projects, use githubUrl as it's guaranteed unique
        if (project.source === "github" && project.githubUrl) {
            return project.githubUrl;
        }
        // For manual projects or GitHub projects without URL, use source + title
        // Title should be unique within each source type
        return `${project.source}-${project.title}`;
    };

    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {projects.slice(0, 4).map((project) => (
                <ProjectCard 
                    key={getProjectKey(project)} 
                    project={project} 
                    showScreenshot={!!(project.featuredImage || project.screenshot)} 
                />
            ))}
        </section>
    );
}
