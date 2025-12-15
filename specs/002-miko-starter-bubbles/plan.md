# Implementation Plan: Miko Starter Question Bubbles

**Branch**: `002-miko-starter-bubbles` | **Date**: 2025-12-15 | **Spec**: `specs/002-miko-starter-bubbles/spec.md`
**Input**: Feature specification for one-time starter question bubbles in the Miko AI chat at `/ai-miko`.

## Summary

Add a row of up to three “starter question” bubbles above the Miko AI text input on `/ai-miko` that help users quickly start a conversation about Miko’s background, projects, and how Miko can help.  
Clicking a bubble sends its text as a user message and permanently marks that prompt as “used” for the current conversation so it never appears again, even after reload when the conversation is restored from localStorage.  
Starter prompts will be defined in a centralized data module and consumption logic will derive the visible set from the conversation history plus the configured prompt list.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict) with Next.js App Router  
**Primary Dependencies**: Next.js 15, React, Tailwind CSS, shadcn/ui, existing Miko chat components/hooks  
**Storage**: Browser localStorage (existing conversation persistence), in-memory React state  
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E for `/ai-miko`)  
**Target Platform**: Web, modern desktop and mobile browsers  
**Project Type**: Single web application (portfolio site with Miko AI page)  
**Performance Goals**: Maintain existing Core Web Vitals; additional UI logic must keep added TTI under ~50ms as per spec SC-005  
**Constraints**: No direct OpenAI API usage in tests/E2E (must use mocks); must integrate cleanly with existing Miko chat container and persistence without breaking current behavior  
**Scale/Scope**: Single feature within `/ai-miko` page; complexity limited to UI components, one data module, and minor chat-state extensions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Test-First Development**:  
  - Plan includes unit/component tests for starter bubble rendering, click behavior, and state derivation from conversation history.  
  - Plan includes E2E coverage on `/ai-miko` for presence and one-time use of starter bubbles.

- **TypeScript Strictness**:  
  - New data module and components will use explicit TypeScript types and reuse existing `Message`-like types where possible.  
  - No `any` types will be introduced; strict mode must remain passing under `npm run type:check`.

- **Feature Branch Workflow**:  
  - Work is confined to feature branch `002-miko-starter-bubbles` and will be merged via PR into `main` after all checks pass.

- **Conventional Commits**:  
  - Commits for this feature will follow `feat(ai-miko): ...`, `test(ai-miko): ...`, etc., with proper scopes and imperative subjects.

- **Component-Based Architecture**:  
  - Starter bubbles will be implemented as a focused Miko-specific component (and/or small additions to `ChatContainer`) using existing layout and design primitives.  
  - State and rendering will be structured to keep concerns separated (data source vs. UI vs. chat integration).

- **Performance Standards**:  
  - Prompt filtering/derivation logic is O(n) over a small static list and will run only once per render; no heavy effects or network calls are introduced.  

- **Accessibility Compliance**:  
  - Bubbles will be implemented as accessible buttons or links with appropriate labels and keyboard focus handling.  

**Gate Result**: All relevant gates satisfied by design; no constitution violations expected. Proceed to Phase 0/1.

## Project Structure

### Documentation (this feature)

```text
specs/002-miko-starter-bubbles/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (clarified assumptions & decisions)
├── data-model.md        # Phase 1 output (entities: prompts, messages, state)
├── quickstart.md        # Phase 1 output (how to implement & run)
├── contracts/           # Phase 1 output (N/A for backend; document “no new APIs”)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── ai-miko/
│   │   ├── page.tsx                        # Miko AI page
│   │   └── __tests__/page.test.tsx         # Page tests (existing)
│   ├── layout.tsx
│   └── ...                                 # Other routes
├── components/
│   ├── ai-miko/
│   │   ├── chat-container.tsx              # Existing main chat component (integration point)
│   │   ├── message-list.tsx                # Existing message list
│   │   ├── ...                             # Other Miko components
│   │   └── __tests__/
│   │       ├── chat-container.test.tsx
│   │       ├── message-list.test.tsx
│   │       └── starter-bubbles.test.tsx    # NEW: tests for starter bubble behavior
│   ├── layout/
│   └── ...                                 # Other feature components
├── contexts/
│   └── ...                                 # If chat context is used (reuse rather than new context)
├── data/
│   └── miko-starter-prompts.ts             # NEW: central list of starter prompts
├── hooks/
│   └── use-chat-stream.ts                  # Existing Miko chat hook (may need light extension for metadata)
└── lib/
    └── ...                                 # No changes expected

e2e/
└── ai-miko.spec.ts                         # Existing E2E; extend with starter bubble smoke tests
```

**Structure Decision**: Extend the existing single Next.js web application structure.  
- Add a dedicated data module for Miko starter prompts under `src/data`.  
- Add a small UI component or logic inside `ChatContainer` (and associated tests) to render and handle starter bubbles.  
- Reuse existing Miko chat hooks and page-level structure; no new backend services or independent packages are required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
