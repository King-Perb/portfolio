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

**Note:** See `implementation_plan.md` for detailed setup instructions.

## Development

```bash
npm run dev
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** lucide-react
- **Animation:** framer-motion

## Project Rules

See `implementation_plan.md` for coding standards, component structure, and best practices.
