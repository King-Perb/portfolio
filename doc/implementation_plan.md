# Project Requirements Document: Personal Portfolio

## 1. Goal
Create a high-performance "Developer Dashboard" portfolio that communicates technical expertise through its aesthetic and functionality.
**Vibe:** Premium, "Hacker" aesthetic (Obsidian/Green), functional, responsive.

## 2. Technology Stack
- **Framework:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS v4 + `shadcn/ui`.
- **Theme:** `next-themes` (Default: Dark "Hacker Mode").
- **Icons:** `lucide-react`.
- **Animation:** `framer-motion` (Micro-interactions, not layout shifts).
- **Testing:**
  - **Unit/Component:** Vitest + React Testing Library
  - **E2E:** Playwright (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- **CI/CD:** GitHub Actions + Pre-push hooks (pre-commit framework)

## 3. Design Concept: "The Command Center"
Instead of a scrolling brochure, the site acts as a functional dashboard.

### 3.1 Layout Architecture
- **Desktop (Bento Grid):**
    - **Left Sidebar (Sticky):** "Player Card" (Avatar, Status, Nav).
    - **Main Area (Grid):**
        - **Top Row:** Activity Metrics (Commits, Years, Projects).
        - **Center:** Featured Projects (Interactive Cards).
        - **Bottom:** Stack Ticker / "Now Playing".
- **Mobile (Responsive):**
    - **Top Bar:** Branding + Hamburger Menu.
    - **Navigation:** Slide-out Sheet (Right or Left).
    - **Grid:** Collapses to single-column vertical scroll.
- **Navigation Animation:** ✅ Implemented
    - **Sidebar Edge Animation:** When user selects a navigation option:
        - Animated vertical line moves from sidebar right edge (280px) to viewport right edge
        - Duration: 500ms with smooth easing `[0.4, 0, 0.2, 1]`
        - Animated wrapper expands from sidebar width (280px) to full viewport width (100vw) as line reaches right edge
        - After content loads, line and wrapper animate back to sidebar width
        - Total animation: ~1000ms (500ms out + 500ms back) with content loading detection
        - Implementation:
          - `AnimatedLine` component: Renders vertical line using `framer-motion` and `createPortal`
          - `AnimatedWrapper` component: Renders expanding wrapper using `framer-motion` and `createPortal`
          - `useSidebarAnimation` hook: Manages animation state and timing
          - `sidebar/constants.ts`: Centralized animation config (duration, delays, dimensions)
        - Visual effect: Creates a "reveal" transition between page sections
        - Applied to: Desktop sidebar navigation only (mobile uses sheet which already has slide animation)
        - **Mobile Fix:** AnimatedWrapper only renders on desktop (viewport >= 768px) to prevent blocking mobile interactions
        - **Pointer Events:** AnimatedWrapper uses `pointer-events-none`, SidebarContent uses `pointer-events-auto` for proper interaction handling

### 3.2 Design System (Brand Book)

#### Color Palette
**Dark Mode (Default - "Hacker Mode"):**
- **Background:** `oklch(0.08 0.02 145)` - Deep Obsidian/Black
- **Foreground:** `oklch(0.90 0.05 145)` - Phosphor White/Green-tinted
- **Card:** `oklch(0.11 0.03 145)` - Panel Green (slightly lighter than background)
- **Primary:** `oklch(0.72 0.18 145)` - Bright Terminal Green (interactive elements)
- **Primary Foreground:** `oklch(0.08 0.02 145)` - Black (text on primary)
- **Secondary:** `oklch(0.15 0.04 145)` - Darker Element (subtle backgrounds)
- **Secondary Foreground:** `oklch(0.85 0.05 145)` - Light text
- **Muted:** `oklch(0.15 0.04 145)` - Subtle backgrounds
- **Muted Foreground:** `oklch(0.60 0.08 145)` - Dimmed Green (secondary text)
- **Accent:** `oklch(0.15 0.04 145)` - Accent backgrounds
- **Accent Foreground:** `oklch(0.85 0.05 145)` - Light text
- **Destructive:** `oklch(0.4 0.15 25)` - Muted Red (errors/warnings)
- **Border:** `oklch(0.20 0.05 145)` - Visible Green Borders
- **Input:** `oklch(0.20 0.05 145)` - Input borders
- **Ring:** `oklch(0.72 0.18 145)` - Focus rings (matches primary)

**Light Mode:**
- **Background:** `oklch(0.99 0.005 145)` - Pale Mint White
- **Foreground:** `oklch(0.13 0.03 145)` - Deep Green Black
- **Primary:** `oklch(0.65 0.22 145)` - Matrix Green
- **Primary Foreground:** `oklch(0.98 0.005 145)` - Near white
- **Secondary/Muted/Accent:** `oklch(0.96 0.01 145)` - Light gray-green
- **Border/Input:** `oklch(0.92 0.02 145)` - Subtle borders

**Chart Colors (for data visualization):**
- Chart 1-5: Green gradient from `oklch(0.50 0.12 145)` to `oklch(0.90 0.10 145)`

#### Typography
- **Font Family:** Geist Mono (monospace) - Applied globally
- **Scale:**
  - `text-xs`: 0.75rem (12px)
  - `text-sm`: 0.875rem (14px)
  - `text-base`: 1rem (16px) - Default
  - `text-lg`: 1.125rem (18px)
  - `text-xl`: 1.25rem (20px)
  - `text-2xl`: 1.5rem (24px)
  - `text-3xl`: 1.875rem (30px)
  - `text-4xl`: 2.25rem (36px)
- **Weights:** Use `font-semibold` for headings, default weight for body

#### Spacing Scale
Use Tailwind spacing tokens consistently:
- **Tight:** `gap-1`, `p-2` (4px, 8px)
- **Default:** `gap-4`, `p-4` (16px)
- **Comfortable:** `gap-6`, `p-6` (24px)
- **Loose:** `gap-8`, `p-8` (32px)

#### Border Radius
- **Small:** `--radius-sm` = `calc(var(--radius) - 4px)` ≈ 4px
- **Medium:** `--radius-md` = `calc(var(--radius) - 2px)` ≈ 6px
- **Large:** `--radius-lg` = `var(--radius)` = 0.5rem (8px) - Default
- **Extra Large:** `--radius-xl` = `calc(var(--radius) + 4px)` ≈ 12px

#### Breakpoints (Mobile-First)
- **Mobile:** Default (0px+)
- **Tablet:** `md:` - 768px+
- **Desktop:** `lg:` - 1024px+
- **Wide:** `xl:` - 1280px+

#### Animation & Transitions
- **Micro-interactions:** Use `framer-motion` for hover effects, card lifts
- **Transitions:**
  - Fast: `duration-200` (200ms)
  - Default: `duration-300` (300ms)
  - Slow: `duration-500` (500ms)
- **Easing:** Default Tailwind easing (`ease-in-out`)
- **Sheet/Dialog:** `data-[state=open]:duration-500`, `data-[state=closed]:duration-300`
- **Navigation Animation:** When user selects a navigation option, the sidebar edge animates horizontally:
  - Edge moves right (slide-out) to reveal transition
  - Then slides back left to reveal new loaded section
  - Duration: ~400-500ms total with smooth easing
  - Use `framer-motion` or CSS transitions for smooth animation

## 4. Data Strategy

### 4.1 Phase 1 (MVP): Mock Data
- **Purpose:** Establish layout and card designs before API integration.
- **Location:** `src/data/mock-data.ts` (TypeScript constants).
- **Mock Data Structure:**
    - **Activity Metrics:**
        - Total commits (number)
        - Years coding (number)
        - Active projects (number)
    - **Featured Projects:**
        - Title, description, tech stack (array of strings)
        - GitHub URL, live demo URL (optional)
        - Commit count, last updated date
        - Featured image/thumbnail (optional)
    - **Stack Ticker:** Array of technology names.
    - **Now Playing:** Current activity/status message.

### 4.2 Phase 2 (Dynamic): GitHub API Integration
- **Authentication:** GitHub Personal Access Token (stored as `GITHUB_TOKEN` env var).
- **Scope:** Access private repositories (requires `repo` scope).
- **Data to Fetch:**
  - **Commit Activity:** Aggregate commits across all repos (public + private).
      - Total commits (all time)
      - Commits in last 30 days (primary metric for homepage)
      - Commit frequency/streak data
  - **Repository Stats:**
      - All repositories (public + private) - fetched via `GET /user/repos?type=all&per_page=100`
      - Total repository count
      - Languages used (from repository languages API: `GET /repos/{owner}/{repo}/languages`)
      - Recent activity (last commit date per repo from `updated_at`)
      - Stars, forks, description from repo object
- **Implementation:**
  - **API Route:** `src/app/api/github/stats/route.ts` (Server-side only).
  - **Utility:** `src/lib/github.ts` - GitHub API client functions.
  - **Service Layer:** `src/lib/projects-service.ts` - Combines GitHub repos with manual entries.
  - **Caching:** ISR with 1-hour revalidation (`revalidate: 3600`).
  - **Error Handling:** Graceful fallback to mock data if API fails.
  - **Rate Limiting:** Respect GitHub API rate limits (5000 req/hour for authenticated).
- **Data Transformation:**
  - Transform GitHub repository objects to `Project` interface format.
  - Support both GitHub-sourced and manual project entries.
  - Filter featured projects for homepage display.
- **Type Updates:**
  - Extend `Project` interface (`src/types/project.ts`) with:
    - `source: "github" | "manual"` - Track data source
    - `screenshot?: string` - URL to project screenshot/image
    - `featured?: boolean` - Flag for homepage featured section
    - `commitCount?: number` - Total commits (GitHub: from API, Manual: from config)
    - `deploymentCount?: number` - Total deployments (GitHub: from API, Manual: from config)
    - `private?: boolean` - Flag for private GitHub repositories (prevents link opening)
- **Deployment Data:**
  - **GitHub:** Fetch deployment count via GitHub API (`GET /repos/{owner}/{repo}/deployments`)
  - **Manual:** Set `deploymentCount` in `manual-projects.ts` config
  - **Display:** Show in project card footer alongside stars, forks, and commits

### 4.3 Manual Project Entries
- **Purpose:** Include projects not in GitHub (e.g., WordPress sites, client work).
- **Location:** `src/data/manual-projects.ts` (TypeScript constants).
- **Structure:** Same `Project` interface with:
  - `source: "manual"` field to distinguish from GitHub repos
  - `screenshot` URL (hosted in `public/projects/` or external)
  - `featured: boolean` flag for homepage display
  - All standard project fields (title, description, tags, status, etc.)
- **Integration:** Combined with GitHub repos via `projects-service.ts`.

### 4.4 Featured Projects Selection
- **Purpose:** Control which projects appear in the homepage featured section.
- **Location:** `src/data/featured-projects.ts` (TypeScript constants).
- **Mechanism:**
  - **GitHub Repositories:** Add repository `full_name` strings (e.g., `"owner/repo-name"`) to `FEATURED_GITHUB_REPOS` array
  - **Manual Projects:** Set `featured: true` in the project object in `manual-projects.ts`
- **Implementation:**
  - `transformRepoToProject()` function checks if a repo's `full_name` is in the featured list
  - `getFeaturedProjects()` filters all projects (GitHub + manual) where `featured === true`
  - Homepage displays up to 4 featured projects via `ProjectsGrid` component
- **Usage:**
  ```typescript
  // src/data/featured-projects.ts
  export const FEATURED_GITHUB_REPOS: string[] = [
    "King-Perb/portfolio",
    "King-Perb/another-repo",
  ];
  ```
- **Fallback:** If no featured projects are found, homepage falls back to mock data.

## 5. Project Rules (Coding Standards)
These rules ensure maintainability and "premium" code quality.

### 5.1 Component Structure
- **Atomic:** Keep components small (`src/components/dashboard/stat-card.tsx`).
- **Server Components:** Default to Server Components. Use `"use client"` *only* for interaction (hover states, sheets).
- **Colocation:** Keep related utils with features if specific.
- **Refactoring Pattern:** Large components (>200 lines) should be broken down into:
  - **Constants:** Extract magic numbers and config to `constants.ts` files
  - **Hooks:** Extract state management and side effects to custom hooks
  - **Sub-components:** Extract JSX sections to dedicated components
  - **Example:** `Sidebar` component refactored from 321 lines to 118 lines by extracting:
    - `sidebar/constants.ts`: Animation config, dimensions, types
    - `hooks/use-sidebar-animation.ts`: Animation state management
    - `sidebar/sidebar-content.tsx`: Shared sidebar JSX content
    - `sidebar/animated-line.tsx`: Portal-based animated line component
    - `sidebar/animated-wrapper.tsx`: Portal-based animated wrapper component

### 5.2 Styling Rules
- **No Magic Numbers:** Use Tailwind spacing tokens (`p-4`, `gap-6`).
- **Mobile-First:** Write classes for mobile first, then `md:` for desktop.
    - *Bad:* `flex-row flex-col-mobile`
    - *Good:* `flex flex-col md:flex-row`
- **Class Merging:** Always use `cn()` (clsx + tailwind-merge) for reusable components.

### 5.3 Type Safety
- **Strict Props:** Define interfaces for *all* component props.
- **No `any`:** Strict TypeScript refinement.

### 5.4 Documentation
- **Single Source of Truth:** The PRD lives in `doc/implementation_plan.md`.
- **Workflow:** Update the PRD before starting major new features.

### 5.5 Code Quality Limits
- **Max File Size:** < 200 lines. If larger, refactor into sub-components or hooks.
- **Complexity:** Cyclomatic complexity should be low. Early returns over nested `if`.

### 5.6 Testing Strategy
- **Unit Tests:** Test utility functions (`src/lib/*.ts`) with Vitest.
- **Component Tests:** Test React components with Vitest + React Testing Library.
- **Integration Tests:** Test API routes and page components with Vitest.
- **End-to-End Tests:** Full browser testing with Playwright for critical user flows.
  - **Coverage:** Navigation, project interactions, mobile navigation, responsive design, contact page, stack page
  - **Browsers:** Chromium (Desktop) + Mobile Chrome (for responsive testing)
  - **Test Suites:** 9 test files covering 76 passing tests
  - **CI Integration:** E2E tests run automatically in GitHub Actions
- **Visual:** Use `/design` route to verify component states manually properly.

### 5.7 Pre-Merge Checklist (Definition of Done)
*Run this before marking any task as [x]*
- [ ] **Lint:** `npm run lint` passes?
- [ ] **Type:** `tsc --noEmit` passes with no `any`?
- [ ] **Tests:** `npm test` passes (unit + component tests)?
- [ ] **E2E Tests:** `npm run test:e2e` passes (if applicable)?
- [ ] **Size:** Is the file under 200 lines?
- [ ] **Mobile:** Did I check the layout on a 375px width (DevTools)?
- [ ] **Theme:** Does it look good in both "Hacker Mode" and Light Mode?

## 6. Deployment & Infrastructure

### 6.1 Hosting Platform
- **Platform:** Vercel (optimized for Next.js).
- **Deployment:** Automatic on push to main branch (via GitHub integration).
- **Preview Deployments:** Automatic for pull requests.

### 6.2 Environment Variables
- **Required:**
    - `GITHUB_TOKEN`: Personal Access Token with `repo` scope (for private repo access).
- **Optional (for Phase 2):**
    - `GITHUB_USERNAME`: GitHub username (defaults to repo owner if not set).

### 6.3 Build Configuration
- **Framework Preset:** Next.js (auto-detected by Vercel).
- **Build Command:** `npm run build` (default).
- **Output Directory:** `.next` (default).
- **Node Version:** 18.x or higher (specify in `package.json` or Vercel settings).
- **SWC Dependencies:** Lockfile includes all platform-specific SWC binaries for Linux (Vercel) and Windows (local dev).

### 6.4 CI/CD Pipeline
- **Pre-push Hooks:** Automatically run lint, type-check, tests, and build before pushing (via pre-commit framework).
- **GitHub Actions Workflow:** `.github/workflows/ci.yml` includes:
  - **Lint Job:** ESLint validation
  - **Type Check Job:** TypeScript compilation check
  - **Test Job:** Unit and component tests with Vitest
  - **E2E Test Job:** Playwright end-to-end tests (Chromium + Mobile Chrome)
  - **Build Job:** Production build verification
- **Branch Protection:** Main branch requires:
  - All CI checks to pass (lint, type-check, test, e2e, build)
  - Gitleaks scan to pass
  - At least 1 PR approval
  - No force pushes allowed
- **Test Artifacts:** Playwright test reports uploaded as GitHub Actions artifacts (30-day retention).

## 7. Pages & Routes

### 7.1 Homepage (`/`)
- **Status:** ✅ Implemented
- **Components:** OverviewMetrics, ProjectsGrid (featured projects)
- **Data:** Currently using mock data, will integrate GitHub API
- **Easter Egg Feature:**
  - **"Don't Click This" Button:**
    - Location: Under Activity Overview section (first section)
    - Behavior: When clicked, opens a popover/dialog containing a video player
    - Video: Plays `Portfolio_Presentation.mp4` from `public/` directory
    - Implementation: Use shadcn/ui Dialog or Popover component with video element
    - Styling: Match "Hacker Mode" aesthetic with green accents
    - Animation: Smooth popover entrance/exit transitions

### 7.2 Projects Page (`/projects`)
- **Status:** ✅ Implemented
- **Purpose:** Display all projects (GitHub repos + manual entries) with screenshots
- **Layout:**
  - Header: "All Projects" title with project count
  - Grid: Responsive cards (1 col mobile, 2 col tablet, 3 col desktop)
  - Each card: Screenshot image (16:9 aspect), title, description, tags, status badge
  - **Project Stats:** Display stars, forks, commits, and deployments in card footer
  - Hover effects: Card lift with glow (matching homepage cards)
- **Design:** Same card styling as homepage (`bg-card/80 backdrop-blur border border-primary/20`)
- **Components:** `src/components/projects/project-card.tsx` (reusable)
- **Project Card Stats Display:** ✅ Implemented
  - **Component:** `ProjectStats` component (`src/components/projects/project-stats.tsx`)
  - **GitHub Projects:** Show stars ⭐, forks 🍴, commits 📝, deployments 🚀
  - **Manual Projects:** Show commits and deployments if available (from manual data)
  - **Layout:** Stats displayed in card footer alongside stars/forks
  - **Icons:** Use Lucide icons (GitCommitHorizontal for commits, Rocket for deployments)
  - **Data Sources:**
    - **Commits:** From `commitCount` field in Project interface (GitHub: from API via `fetchRepoTotalCommits`, Manual: from config)
    - **Deployments:** From `deploymentCount` field in Project interface (GitHub: from API via `fetchRepoDeployments`, Manual: from config)
- **Project Image Enhancements:** ✅ Implemented
  - **Green Overlay:** Subtle green overlay applied to project images (featuredImage/screenshot)
    - Overlay color: `bg-primary/20` (semi-transparent green) with `mix-blend-overlay` blend mode
    - Position: Absolute positioned div over image with `absolute inset-0`
    - Hover: Overlay intensity increases to `bg-primary/30` on hover for interactive feedback
    - Implementation: Overlay div added in `ProjectCard` component image container (line 41)
- **Private Repository Handling:**
  - **Private Repo Detection:** Check `private: true` field from GitHub API response
  - **Click Behavior:** When user clicks a private repo project card:
    - **Do NOT open any link** (prevent default navigation)
    - Show a popover/tooltip with message: "This is a private repository"
    - Use shadcn/ui Popover or Tooltip component
    - Position: Near the clicked card or centered
    - Styling: Match "Hacker Mode" aesthetic with green accents
    - Animation: Smooth popover entrance/exit
  - **Visual Indicator (Optional):** Consider adding a small lock icon or badge to private repo cards
  - **Implementation:** Update `useProjectCardClick` hook to check `project.private` before opening link

### 7.3 Stack Page (`/stack`)
- **Status:** ✅ Implemented
- **Purpose:** Display technology stack from GitHub repository languages
- **Layout:**
  - Header: "Tech Stack" title with subtitle
  - Language cards in responsive grid
  - Each card: Language name, usage percentage/bytes, icon/logo
  - Optional: Group by category (Frontend, Backend, Tools)
- **Design:** Smaller cards with progress indicators using chart color gradient
- **Data Source:**
  - **Auto-populated:** GitHub repo languages (from API)
  - **Manual additions:** Config file for technologies not in GitHub repos (e.g., tools, frameworks, services)
- **Manual Technologies Config:** ✅ Implemented
  - **Location:** `src/data/manual-technologies.ts` (TypeScript constants)
  - **Structure:** Array of technology objects with name and optional byte count for percentage calculation
  - **Integration:** Combined with GitHub languages in `src/app/stack/page.tsx` data fetching
  - **Current Technologies:** Docker, Kubernetes, AWS, Vercel
  - **Usage:**
    ```typescript
    // src/data/manual-technologies.ts
    export const MANUAL_TECHNOLOGIES: Array<{ name: string; bytes?: number }> = [
      { name: "Docker", bytes: 1000 },
      { name: "Kubernetes", bytes: 500 },
      { name: "AWS", bytes: 2000 },
      { name: "Vercel", bytes: 1500 },
    ];
    ```
- **Components:** `src/components/stack/stack-card.tsx`

### 7.4 Contact Page (`/contact`)
- **Status:** ⏳ Planned
- **Purpose:** Display contact information and social links
- **Layout:**
  - Header: "Get In Touch" title
  - Email section: Email address with copy-to-clipboard button
  - Social links: Grid of icon buttons (GitHub, LinkedIn, Twitter, etc.)
  - Hover effects: Scale and glow on social links
- **Design:** Consistent spacing and typography from brand book
- **Data:** `src/lib/constants.ts` - `CONTACT_INFO` object
- **Components:** `src/components/contact/social-link.tsx`

## 8. Implementation Checklist
- [x] **Foundation:** Next.js + Tailwind v4 + ThemeProvider.
- [x] **Design System:** "Hacker Mode" Palette + Mono Font.
- [x] **Layout Shell:** Sidebar (Desktop) + Sheet (Mobile) + Main Content Area.
- [x] **Homepage:** Overview metrics and featured projects grid.
- [x] **GitHub API Integration:** API route, utility functions, data service.
- [x] **Projects Page:** All projects display with screenshots.
- [x] **Stack Page:** Technology stack from GitHub languages + manual technologies.
- [x] **Contact Page:** Email and social links.
- [x] **Manual Projects:** Support for non-GitHub projects.
- [x] **E2E Testing Setup:** Playwright configuration with 76 passing tests covering navigation, projects, contact, stack, and responsive design.
- [x] **CI/CD Integration:** GitHub Actions workflow includes E2E test job with Playwright browser installation and test execution.
- [x] **SWC Dependencies:** Fixed package-lock.json to include all platform-specific SWC binaries (resolves Vercel deployment warnings).
- [x] **Manual Technologies:** Config file for technologies not in GitHub repos (`src/data/manual-technologies.ts`), integrated in Stack page.
- [x] **Project Card Stats:** Display commits and deployments alongside stars/forks (`ProjectStats` component with icons).
- [x] **Deployment Data:** Fetch deployment count from GitHub API (`fetchRepoDeployments`) and support manual entries.
- [x] **Project Image Green Overlay:** Add subtle green overlay to project images for "Hacker Mode" aesthetic (`bg-primary/20` with `mix-blend-overlay`, increases to `bg-primary/30` on hover).
- [x] **Navigation Sidebar Animation:** Implement horizontal slide animation on sidebar edge when navigating.
  - **Implementation:** Refactored sidebar into modular components with animation system
  - **Components Created:**
    - `src/components/layout/sidebar/constants.ts`: Centralized config (dimensions, animation timing, types)
    - `src/components/layout/sidebar/sidebar-content.tsx`: Reusable sidebar content component
    - `src/components/layout/sidebar/animated-line.tsx`: Portal-based animated vertical line
    - `src/components/layout/sidebar/animated-wrapper.tsx`: Portal-based animated wrapper for reveal effect
    - `src/hooks/use-sidebar-animation.ts`: Animation state management and timing logic
  - **Features:**
    - Animation waits for content to load before returning (prevents jarring transitions)
    - Desktop-only animation (mobile uses sheet, no animation wrapper needed)
    - Proper pointer events handling (wrapper doesn't block interactions)
    - SSR-safe with client-side hydration detection
    - Reduced main sidebar component from 321 lines to 118 lines (63% reduction)
- [x] **Sidebar Refactoring:** Refactored sidebar component for maintainability and testability.
  - **Architecture:** Extracted sidebar into 5 focused modules (constants, hook, 3 components)
  - **Performance:** Fixed mobile interaction blocking by conditionally rendering AnimatedWrapper
  - **Testing:** All 11 sidebar unit tests passing, improved testability with smaller components
  - **Code Quality:** Reduced complexity, improved readability, better separation of concerns
- [ ] **Private Repository Popover:** Show popover message when clicking private repo cards, prevent link opening.
- [x] **Easter Egg Video Button:** Add "Don't Click This" button under Activity Overview that plays Portfolio_Presentation.mp4 in dialog.
- [x] **Animated Line Styling Improvements:** Enhanced scanner line with better visual feedback.
  - Match idle state to project card default styling (bg-primary/20, no shadow)
  - Increase thickness during animation (4px desktop, 1.5px mobile)
  - Add opacity animation (20% idle, 50% during animation)
  - Return to thin state 100ms before animation completes
  - Support different keyframes for MOVING_RIGHT vs MOVING_BACK phases
- [x] **Navigation Blocking During Animation:** Prevent navigation clicks when animation is in progress.
  - Add isAnimating prop to SidebarContent component
  - Block navigation link clicks when animation is in progress
  - Block test button clicks during animation
  - No visual changes, only prevents interactions
- [x] **Sidebar Refactoring (Phase 2):** Further improvements to sidebar architecture.
  - Extract useIsDesktop hook for reusable desktop breakpoint detection
  - Improve animated-line keyframe generation with helper function
  - Consolidate width and opacity keyframe times
  - Reduce code duplication in sidebar component
- [x] **Test Coverage Improvements:** Added comprehensive test coverage.
  - Add 9 test cases for easter-egg-button component
  - Improve sidebar and mobile-nav test coverage
  - Update tests for commented out stars/forks
  - All 161 unit tests and 76 E2E tests passing
- [x] **Mobile Next Section Navigation:** Add navigation buttons at bottom of each page (mobile only).
  - **Components:**
    - `src/components/navigation/mobile-next-section-button.tsx`: Mobile-only button to navigate to next section
    - `src/contexts/navigation-context.tsx`: Context for animated navigation from content area
    - `src/components/layout/page-transition-line.tsx`: Full-screen scanner animation for page transitions
  - **Features:**
    - Circular navigation: Overview → Projects → Stack → Contact → Overview
    - Scanner animation from left edge with expanding background overlay
    - Disabled during animation to prevent rapid clicks
    - Styled with primary (green) color scheme
  - **Integration:** NavigationProvider in Shell, buttons in all page components
- [x] **Fluid Loading Animation:** Add Lottie animation during page transitions.
  - **Library:** @lottiefiles/dotlottie-react
  - **Components:**
    - `src/components/animations/fluid-loading-animation.tsx`: Reusable Lottie animation component
    - `public/Fluid_Loading_Animation.lottie`: Animation asset
  - **Integration:**
    - Desktop sidebar transitions (AnimatedWrapper): Animation centered at 50vw
    - Mobile page transitions (PageTransitionLine): Animation centered at 50vw
    - Revealed as overlay expands, hidden when idle
- [x] **AI Miko Chat Interface:** ChatGPT-like chat interface with document-based knowledge.
  - **Components:**
    - `src/components/ai-miko/chat-container.tsx`: Main chat interface orchestrator
    - `src/components/ai-miko/message-list.tsx`: Auto-scrolling message display
    - `src/components/ai-miko/message-bubble.tsx`: Individual message rendering (user/AI)
    - `src/components/ai-miko/chat-input.tsx`: Message input with send/stop toggle
    - `src/components/ai-miko/typing-indicator.tsx`: Animated dots below avatar
  - **Infrastructure:**
    - `src/hooks/use-chat-stream.ts`: Streaming logic hook (refactored from chat-container)
    - `src/app/api/ai-miko/chat/route.ts`: API route (placeholder for NotebookLM integration)
    - `src/types/chat.ts`: TypeScript types for chat messages
    - `src/components/ui/textarea.tsx`: Textarea component for message input
  - **Features:**
    - Streaming response support with abort capability
    - Auto-scroll with manual scroll detection (prevents glitches during streaming)
    - Stop generation button (toggles from send to stop during streaming)
    - Typing indicator positioned below avatar icon (not in message text)
    - Refactored streaming logic into reusable hook
  - **Navigation:** Added "AI Miko" to navigation menu with Bot icon
  - **Status:** UI complete, awaiting NotebookLM API integration for document-based responses
