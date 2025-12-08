# Portfolio - Developer Dashboard

A high-performance "Developer Dashboard" portfolio built with Next.js 15, TypeScript, and Tailwind CSS v4.

## Project Structure

```
src/
├── app/              # Next.js App Router pages and routes
│   ├── api/          # API routes (GitHub integration - Phase 2)
│   └── design/       # Design system showcase
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   ├── layout/       # Layout components (Sidebar, Shell, etc.)
│   └── ui/           # shadcn/ui components
├── data/             # Mock data and data sources
├── hooks/             # Custom React hooks
├── lib/               # Utilities and constants
└── types/             # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# GitHub API Configuration (Phase 2)
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_USERNAME=your_username  # Optional
```

**Note:** See `doc/implementation_plan.md` for detailed setup instructions.

## Development

```bash
npm run dev
```

## Pre-Commit Hooks

This project uses pre-commit hooks to ensure code quality before commits. The hooks run:
- Linting checks (trailing whitespace, YAML validation, large files)
- Secret scanning with Gitleaks (staged files only)

### Setup

1. Install pre-commit:
   ```bash
   pip install pre-commit
   # or
   brew install pre-commit
   ```

2. Install the git hooks:
   ```bash
   pre-commit install
   ```

3. (Optional) Run hooks on all files:
   ```bash
   pre-commit run --all-files
   ```

The hooks will now run automatically on every commit. If a hook fails, the commit will be blocked.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** lucide-react
- **Animation:** framer-motion

## Project Rules

See `doc/implementation_plan.md` for coding standards, component structure, and best practices.

## Branch Protection Setup

Branch protection rules can be configured automatically using the GitHub Actions workflow:

1. Go to **Actions** tab in your GitHub repository
2. Select **Setup Branch Protection** workflow
3. Click **Run workflow** → **Run workflow** (one-time setup)

Alternatively, follow the manual setup guide in `doc/BRANCH_PROTECTION.md`.
