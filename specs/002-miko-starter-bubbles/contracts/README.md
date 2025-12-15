# Contracts: Miko Starter Question Bubbles

**Feature**: `002-miko-starter-bubbles`  
**Date**: 2025-12-15  
**Spec**: `specs/002-miko-starter-bubbles/spec.md`

This feature does **not** introduce any new backend APIs, network calls, or external service integrations.

The starter question bubbles are implemented entirely within the existing Miko AI frontend stack:

- Prompts are defined statically in a TypeScript module (`src/data/miko-starter-prompts.ts`).
- Clicks on starter bubbles are translated into user messages in the existing Miko chat pipeline.
- No changes are required to the GitHub API, OpenAI API, or other backend routes.

If future iterations introduce remote configuration or analytics for prompt usage, API contracts should be added here (e.g., OpenAPI/GraphQL schemas) and referenced from this README.


