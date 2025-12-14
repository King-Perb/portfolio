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
    const getProjectKey = (project: typeof projects[0], index: number): string => {
        // For GitHub projects, use githubUrl as it's guaranteed unique
        if (project.source === "github" && project.githubUrl) {
            return project.githubUrl;
        }
        // For manual projects or GitHub projects without URL, use source + title + index as fallback
        // This ensures uniqueness even if titles are duplicated
        const baseKey = `${project.source}-${project.title}`;
        // Check if this key would be duplicate by looking at previous projects
        const isDuplicate = projects.slice(0, index).some(p => {
            if (p.source === "github" && p.githubUrl) {
                return false; // GitHub projects use different key format
            }
            return `${p.source}-${p.title}` === baseKey;
        });
        return isDuplicate ? `${baseKey}-${index}` : baseKey;
    };

    return (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {projects.slice(0, 4).map((project, index) => (
                <ProjectCard
                    key={getProjectKey(project, index)}
                    project={project}
                    showScreenshot={!!(project.featuredImage || project.screenshot)}
                />
            ))}
        </section>
    );
}
