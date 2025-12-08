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
        - Commits in last 30/90/365 days
        - Commit frequency/streak data
    - **Repository Stats:**
        - Total repositories (public + private count)
        - Languages used (from repository languages API)
        - Recent activity (last commit date per repo)
- **Implementation:**
    - **API Route:** `src/app/api/github/stats/route.ts` (Server-side only).
    - **Caching:** ISR with 1-hour revalidation (`revalidate: 3600`).
    - **Error Handling:** Graceful fallback to mock data if API fails.
    - **Rate Limiting:** Respect GitHub API rate limits (5000 req/hour for authenticated).
- **Content:** Markdown/MDX for project case studies (future enhancement).

## 5. Project Rules (Coding Standards)
These rules ensure maintainability and "premium" code quality.

### 5.1 Component Structure
- **Atomic:** Keep components small (`src/components/dashboard/stat-card.tsx`).
- **Server Components:** Default to Server Components. Use `"use client"` *only* for interaction (hover states, sheets).
- **Colocation:** Keep related utils with features if specific.

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
- **Unit:** Test utility functions (`src/lib/*.ts`) with Vitest.
- **Visual:** Use `/design` route to verify component states manually properly.

### 5.7 Pre-Merge Checklist (Definition of Done)
*Run this before marking any task as [x]*
- [ ] **Lint:** `npm run lint` passes?
- [ ] **Type:** `tsc --noEmit` passes with no `any`?
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

## 7. Implementation Checklist
- [x] **Foundation:** Next.js + Tailwind v4 + ThemeProvider.
- [x] **Design System:** "Hacker Mode" Palette + Mono Font.
- [x] **Layout Shell:** Sidebar (Desktop) + Sheet (Mobile) + Main Content Area.
- [ ] **Bento Grid:** Implement CSS Grid structure.
- [ ] **Components:** StartCard, ProjectCard, NavItem.

