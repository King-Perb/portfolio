# Custom Hooks

This directory contains custom React hooks for the portfolio application.

## Usage

Custom hooks should follow these conventions:
- File naming: `use-{hook-name}.ts` (e.g., `use-github-stats.ts`)
- Export: Named export (e.g., `export function useGitHubStats()`)
- Type safety: Define return types and parameter types explicitly

## Example Structure

```typescript
// use-github-stats.ts
import { useState, useEffect } from "react";

interface GitHubStats {
  commits: number;
  repos: number;
}

export function useGitHubStats(): GitHubStats | null {
  // Hook implementation
}
```
