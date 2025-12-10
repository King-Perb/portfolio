# Refactoring Opportunities

This document identifies potential refactoring opportunities based on the current codebase changes. These are suggestions for improving code maintainability, readability, and testability.

## 1. Function Parameter Refactoring

### 1.1 `transformRepoToProject` - Too Many Parameters

**Current Issue:**
```typescript
transformRepoToProject(
  repo,
  allTags,
  featuredRepos,
  commitCount,
  deploymentCount,
  featuredImage,
  customDescription,
  clickUrl
)
```

**Problem:** 8 parameters make the function hard to call and maintain. Adding new options requires changing the function signature.

**Refactoring Suggestion:**
```typescript
interface TransformRepoOptions {
  languages: string[];
  featuredRepos?: string[];
  commitCount?: number;
  deploymentCount?: number;
  featuredImage?: string;
  customDescription?: string;
  clickUrl?: string;
}

export function transformRepoToProject(
  repo: GitHubRepo,
  options: TransformRepoOptions
): Project
```

**Benefits:**
- Easier to extend without breaking changes
- More readable function calls
- Better IDE autocomplete
- Can add default values easily

**Files Affected:**
- `src/lib/github.ts` (function definition)
- `src/lib/projects-service.ts` (function calls)

---

## 2. Extract Helper Functions

### 2.1 Override Data Extraction

**Current Issue:**
In `projects-service.ts`, lines 41-65 extract override data with repetitive code:

```typescript
const override = getProjectOverride(repo.full_name);
const manualTags = override?.tags || [];
const allTags = Array.from(new Set([...repoLanguages, ...manualTags]));
const commitCount = stats.repoCommits?.[repo.full_name];
const deploymentCount = stats.repoDeployments?.[repo.full_name];
const featuredImage = override?.featuredImage;
const customDescription = override?.description;
const clickUrl = override?.clickUrl;
```

**Refactoring Suggestion:**
Create a helper function to extract all override data at once:

```typescript
// In projects-service.ts or a new utils file
function extractProjectOverrides(
  repo: GitHubRepo,
  stats: GitHubStats,
  override?: GitHubProjectOverride
) {
  const repoLanguages = stats.repoLanguages[repo.full_name] ||
    (repo.language ? [repo.language] : []);
  
  const manualTags = override?.tags || [];
  const allTags = Array.from(new Set([...repoLanguages, ...manualTags]));
  
  return {
    tags: allTags,
    commitCount: stats.repoCommits?.[repo.full_name],
    deploymentCount: stats.repoDeployments?.[repo.full_name],
    featuredImage: override?.featuredImage,
    customDescription: override?.description,
    clickUrl: override?.clickUrl,
  };
}
```

**Benefits:**
- Reduces code duplication
- Centralizes override logic
- Easier to test
- Cleaner `getAllProjects` function

---

### 2.2 Project Sorting Utilities

**Current Issue:**
Sorting logic is duplicated in `getAllProjects` and `getProjectsPageProjects`:

```typescript
// In getAllProjects
return projects.sort((a, b) => {
  const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
  const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
  return dateB - dateA;
});

// In getProjectsPageProjects
return projects.sort((a, b) => {
  const aHasImage = !!(a.featuredImage || a.screenshot);
  const bHasImage = !!(b.featuredImage || b.screenshot);
  if (aHasImage && !bHasImage) return -1;
  if (!aHasImage && bHasImage) return 1;
  const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
  const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
  return dateB - dateA;
});
```

**Refactoring Suggestion:**
Create reusable sorting utilities:

```typescript
// src/lib/project-sorters.ts
export function sortByLastUpdated(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });
}

export function sortByImageThenDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aHasImage = !!(a.featuredImage || a.screenshot);
    const bHasImage = !!(b.featuredImage || b.screenshot);
    
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });
}
```

**Benefits:**
- Reusable sorting logic
- Easier to test
- Can add more sorting strategies easily
- Immutable (returns new array)

---

### 2.3 Status Calculation Logic

**Current Issue:**
Status calculation in `transformRepoToProject` (lines 227-244) is complex and could be extracted:

```typescript
const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
let status: ProjectStatus = "Active";
let statusColor = "text-primary border-primary/20 bg-primary/10";

if (daysSinceUpdate > 365) {
  status = "Archived";
  statusColor = "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/10";
} else if (daysSinceUpdate > 180) {
  status = "Maintained";
  statusColor = "text-blue-400 border-blue-400/20 bg-blue-400/10";
} else if (repo.description?.toLowerCase().includes("beta") || repo.description?.toLowerCase().includes("wip")) {
  status = "Beta";
  statusColor = "text-yellow-400 border-yellow-400/20 bg-yellow-400/10";
}
```

**Refactoring Suggestion:**
Extract to a dedicated function:

```typescript
// src/lib/project-status.ts
export function calculateProjectStatus(
  updatedAt: string,
  description?: string
): { status: ProjectStatus; statusColor: string } {
  const lastUpdated = new Date(updatedAt);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate > 365) {
    return {
      status: "Archived",
      statusColor: "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/10",
    };
  }
  
  if (daysSinceUpdate > 180) {
    return {
      status: "Maintained",
      statusColor: "text-blue-400 border-blue-400/20 bg-blue-400/10",
    };
  }
  
  if (description?.toLowerCase().includes("beta") || description?.toLowerCase().includes("wip")) {
    return {
      status: "Beta",
      statusColor: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    };
  }
  
  return {
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
  };
}
```

**Benefits:**
- Testable in isolation
- Reusable for manual projects
- Clearer separation of concerns
- Easier to modify status logic

---

## 3. Component Refactoring

### 3.1 Extract Click Handler Logic

**Current Issue:**
`ProjectCard` component has inline click handling logic (lines 18-27):

```typescript
const cardUrl = project.clickUrl || project.liveUrl || project.githubUrl;

const handleCardClick = () => {
  if (cardUrl) {
    window.open(cardUrl, "_blank", "noopener,noreferrer");
  }
};
```

**Refactoring Suggestion:**
Extract to a custom hook or utility:

```typescript
// src/hooks/use-project-card-click.ts
export function useProjectCardClick(project: Project) {
  const cardUrl = project.clickUrl || project.liveUrl || project.githubUrl;
  
  const handleClick = useCallback(() => {
    if (cardUrl) {
      window.open(cardUrl, "_blank", "noopener,noreferrer");
    }
  }, [cardUrl]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (cardUrl && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick();
    }
  }, [cardUrl, handleClick]);
  
  return {
    cardUrl,
    handleClick,
    handleKeyDown,
    isClickable: !!cardUrl,
  };
}
```

**Benefits:**
- Reusable across components
- Better testability
- Cleaner component code
- Can add analytics or other side effects easily

---

### 3.2 Extract URL Priority Logic

**Current Issue:**
URL priority logic appears in `ProjectCard`:

```typescript
const cardUrl = project.clickUrl || project.liveUrl || project.githubUrl;
```

**Refactoring Suggestion:**
Create a utility function:

```typescript
// src/lib/project-utils.ts
export function getProjectClickUrl(project: Project): string | undefined {
  return project.clickUrl || project.liveUrl || project.githubUrl;
}
```

**Benefits:**
- Single source of truth for URL priority
- Can be used in other components
- Easier to test and modify

---

### 3.3 Extract Image URL Resolution

**Current Issue:**
Image URL resolution pattern appears multiple times:

```typescript
const imageUrl = project.featuredImage || project.screenshot;
```

**Refactoring Suggestion:**
Create a utility function:

```typescript
// src/lib/project-utils.ts
export function getProjectImageUrl(project: Project): string | undefined {
  return project.featuredImage || project.screenshot;
}
```

**Benefits:**
- Consistent image resolution logic
- Single place to modify behavior
- Reusable

---

### 3.4 Extract Project Stats Display

**Current Issue:**
`ProjectCard` footer has repetitive stats display code (lines 82-108):

```typescript
{project.source === "github" && (
  <>
    <div className="flex items-center gap-1 hover:text-foreground" title="Stars">
      <Star className="h-3 w-3" />
      {project.stars}
    </div>
    <div className="flex items-center gap-1 hover:text-foreground" title="Forks">
      <GitFork className="h-3 w-3" />
      {project.forks}
    </div>
  </>
)}
{project.commitCount !== undefined && project.commitCount > 0 && (
  <div className="flex items-center gap-1 hover:text-foreground" title="Total commits">
    <GitCommitHorizontal className="h-3 w-3" />
    {project.commitCount}
  </div>
)}
```

**Refactoring Suggestion:**
Extract to a sub-component:

```typescript
// src/components/projects/project-stats.tsx
interface ProjectStatsProps {
  project: Project;
}

export function ProjectStats({ project }: ProjectStatsProps) {
  return (
    <div className="flex items-center gap-4 text-xs font-mono">
      {project.source === "github" && (
        <>
          <StatItem icon={Star} value={project.stars} title="Stars" />
          <StatItem icon={GitFork} value={project.forks} title="Forks" />
        </>
      )}
      {project.commitCount !== undefined && project.commitCount > 0 && (
        <StatItem 
          icon={GitCommitHorizontal} 
          value={project.commitCount} 
          title="Total commits" 
        />
      )}
      {project.deploymentCount !== undefined && project.deploymentCount > 0 && (
        <StatItem 
          icon={Rocket} 
          value={project.deploymentCount} 
          title="Total deployments" 
        />
      )}
    </div>
  );
}

function StatItem({ icon: Icon, value, title }: { icon: LucideIcon; value: number; title: string }) {
  return (
    <div className="flex items-center gap-1 hover:text-foreground" title={title}>
      <Icon className="h-3 w-3" />
      {value}
    </div>
  );
}
```

**Benefits:**
- Cleaner `ProjectCard` component
- Reusable stats display
- Easier to test
- Can be used in other contexts

---

## 4. Type Safety Improvements

### 4.1 Create Project Builder Pattern

**Current Issue:**
`transformRepoToProject` manually constructs the project object with many fields.

**Refactoring Suggestion:**
Create a builder or factory pattern:

```typescript
// src/lib/project-builder.ts
export class ProjectBuilder {
  private project: Partial<Project> = {};
  
  fromGitHubRepo(repo: GitHubRepo): this {
    this.project = {
      title: repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      githubUrl: repo.html_url,
      liveUrl: repo.homepage || undefined,
      lastUpdated: repo.updated_at || undefined,
      source: "github",
    };
    return this;
  }
  
  withLanguages(languages: string[]): this {
    this.project.tags = languages.slice(0, 15);
    return this;
  }
  
  withStatus(status: ProjectStatus, statusColor: string): this {
    this.project.status = status;
    this.project.statusColor = statusColor;
    return this;
  }
  
  withOverrides(override?: GitHubProjectOverride): this {
    if (override?.description) this.project.description = override.description;
    if (override?.featuredImage) this.project.featuredImage = override.featuredImage;
    if (override?.clickUrl) this.project.clickUrl = override.clickUrl;
    return this;
  }
  
  withStats(commitCount?: number, deploymentCount?: number): this {
    this.project.commitCount = commitCount;
    this.project.deploymentCount = deploymentCount;
    return this;
  }
  
  withFeatured(featuredRepos: string[], repoFullName: string): this {
    this.project.featured = featuredRepos.includes(repoFullName);
    return this;
  }
  
  build(): Project {
    // Validate required fields and return
    return this.project as Project;
  }
}
```

**Benefits:**
- More flexible construction
- Better type safety
- Easier to test individual steps
- Can add validation easily

---

## 5. Configuration Improvements

### 5.1 Type-Safe Override Helpers

**Current Issue:**
Override extraction functions filter and map manually.

**Refactoring Suggestion:**
Create more type-safe helper functions:

```typescript
// In github-project-overrides.ts
export function getOverridesByProperty<K extends keyof GitHubProjectOverride>(
  property: K,
  value: GitHubProjectOverride[K]
): string[] {
  return Object.entries(GITHUB_PROJECT_OVERRIDES)
    .filter(([, override]) => override[property] === value)
    .map(([repoName]) => repoName);
}

// Usage:
const excludedRepos = getOverridesByProperty('excluded', true);
const featuredRepos = getOverridesByProperty('featured', true);
```

**Benefits:**
- Type-safe property access
- Reusable for any override property
- Less code duplication

---

## 6. Performance Optimizations

### 6.1 Memoize Override Lookups

**Current Issue:**
`getExcludedRepos()` and `getFeaturedRepos()` are called in loops and recalculate every time.

**Refactoring Suggestion:**
Memoize the results:

```typescript
// In github-project-overrides.ts
let excludedReposCache: string[] | null = null;
let featuredReposCache: string[] | null = null;

export function getExcludedRepos(): string[] {
  if (excludedReposCache === null) {
    excludedReposCache = Object.entries(GITHUB_PROJECT_OVERRIDES)
      .filter(([, override]) => override.excluded === true)
      .map(([repoName]) => repoName);
  }
  return excludedReposCache;
}

export function getFeaturedRepos(): string[] {
  if (featuredReposCache === null) {
    featuredReposCache = Object.entries(GITHUB_PROJECT_OVERRIDES)
      .filter(([, override]) => override.featured === true)
      .map(([repoName]) => repoName);
  }
  return featuredReposCache;
}
```

**Benefits:**
- Better performance in loops
- Reduces redundant calculations
- Simple caching strategy

---

## 7. Code Organization

### 7.1 Split Large Files

**Current Issue:**
`projects-service.ts` is doing too much:
- Fetching GitHub stats
- Transforming repos to projects
- Filtering excluded repos
- Applying overrides
- Sorting projects

**Refactoring Suggestion:**
Split into focused modules:

```
src/lib/projects/
  ├── project-service.ts      # Main service (orchestrates)
  ├── project-transformer.ts   # Transform logic
  ├── project-filters.ts       # Filtering logic
  ├── project-sorters.ts       # Sorting logic
  └── project-utils.ts         # Utility functions
```

**Benefits:**
- Better code organization
- Easier to find specific functionality
- Smaller, focused files
- Better testability

---

## Priority Recommendations

### High Priority (Do First)
1. **Extract sorting utilities** - Reduces duplication, easy win
2. **Refactor `transformRepoToProject` parameters** - Improves maintainability
3. **Extract override extraction helper** - Reduces code in `getAllProjects`

### Medium Priority (Do Next)
4. **Extract status calculation** - Better testability
5. **Create project utilities** - URL and image resolution
6. **Extract ProjectStats component** - Cleaner ProjectCard

### Low Priority (Nice to Have)
7. **Create ProjectBuilder** - More advanced pattern
8. **Memoize override lookups** - Performance optimization
9. **Split large files** - Better organization

---

## Testing Considerations

When refactoring, ensure:
- All existing tests still pass
- Add tests for new utility functions
- Test edge cases (missing data, null values)
- Test sorting functions with various project configurations
- Test override extraction with different override combinations

---

## Migration Strategy

1. **Create new utilities alongside old code** - Don't break existing functionality
2. **Update one file at a time** - Easier to review and test
3. **Run tests after each change** - Catch issues early
4. **Update tests as you refactor** - Ensure coverage remains good
5. **Remove old code after migration** - Clean up after everything works

---

## Notes

- These refactorings are suggestions, not requirements
- Prioritize based on your team's needs and time constraints
- Some refactorings may introduce breaking changes - plan accordingly
- Consider creating a separate branch for refactoring work
- Update documentation as you refactor

