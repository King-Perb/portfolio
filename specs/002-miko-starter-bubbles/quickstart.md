# Quickstart: Implementing Miko Starter Question Bubbles

**Feature**: `002-miko-starter-bubbles`
**Spec**: `specs/002-miko-starter-bubbles/spec.md`
**Plan**: `specs/002-miko-starter-bubbles/plan.md`

## Goal

Add a row of up to three clickable “starter question” bubbles above the Miko AI text input on `/ai-miko`.
Clicking a bubble sends the question as a user message and permanently hides that prompt for the current conversation, even after reload.

## Implementation Steps

### 1. Define Starter Prompts

Create a new data module:

- `src/data/miko-starter-prompts.ts`

Contents (conceptual):

- Export a readonly array of prompts:
  - `id: string` – stable identifier (e.g. `"experience-1"`).
  - `text: string` – question copy.
  - `category?: "experience" | "projects" | "help" | string`.

Example categories:

- Experience-focused (“Tell me about your background as a developer.”)
- Projects-focused (“What are your most interesting portfolio projects?”)
- Help-focused (“How can you help me with my project?”)

### 2. Extend the Miko Chat Model (Metadata Only)

Review the existing Miko chat message types (likely in `src/hooks/use-chat-stream.ts` or a nearby types file).

- Add optional metadata to user messages:
  - `source?: "starter-prompt" | "user" | ...`
  - `promptId?: string`

Update the sending function used by `ChatContainer` so that:

- When a starter bubble is clicked, it calls the same send function but passes the text plus metadata:
  - `source: "starter-prompt"`
  - `promptId: <StarterPrompt.id>`

Ensure this metadata is included in whatever structure is persisted to localStorage for the conversation.

### 3. Compute Visible Starter Prompts

In the Miko chat container (likely `src/components/ai-miko/chat-container.tsx`):

- Import `miko-starter-prompts` from `src/data`.
- Derive:
  - `usedPromptIds` by scanning conversation messages:
    - Filter messages where `source === "starter-prompt"` and collect `promptId`.
  - `unusedPrompts` as all prompts whose `id` is not in `usedPromptIds`.
  - `visiblePrompts` as the first 3 `unusedPrompts`.

Keep this logic in a small helper or hook if it grows, but avoid over-abstracting.

### 4. Render the Starter Bubbles

Add a small UI section above the text input in the Miko chat UI:

- Only render when `visiblePrompts.length > 0`.
- Use existing design system (e.g. shadcn/ui `Button` with variant styling) to keep consistent with Miko’s look.
- Make sure bubbles:
  - Are keyboard-focusable.
  - Have accessible labels (button text is usually enough).

Click handler:

- For each prompt:
  - Call the existing “send message” function with prompt text and metadata.
  - Optionally optimistically update local derived state so the bubble disappears immediately; the derived state will be recomputed from messages on the next render.

### 5. Update Unit/Component Tests

Add tests under Miko components:

- `src/components/ai-miko/__tests__/starter-bubbles.test.tsx` (or extend `chat-container.test.tsx`):
  - Renders with empty conversation → expects 3 bubbles from the data module.
  - Clicking a bubble:
    - Triggers the send function with correct text and metadata (`source`, `promptId`).
    - Removes that bubble from the rendered list.
  - When messages already contain starter-prompt messages:
    - `usedPromptIds` derived correctly.
    - Previously used prompts do not render.

Ensure `npm test src/components/ai-miko/__tests__` passes.

### 6. Update E2E Tests (Playwright)

Extend `e2e/ai-miko.spec.ts`:

- Add a focused test case:
  - Navigate to `/ai-miko`.
  - Wait for chat UI to be ready.
  - Locate up to three starter bubbles above the input.
  - Click one bubble and verify:
    - A new user message appears with the same text.
    - The clicked bubble disappears.
  - Reload the page:
    - Verify that specific prompt is no longer shown as a bubble.

Keep this test lightweight and resilient to copy changes by using robust selectors (e.g. roles and stable `data-testid` attributes).

### 7. Run Checks Before Committing

From repo root:

- `npm run type:check`
- `npm run lint`
- `npm test`
- `npm run test:e2e` (at least the `/ai-miko` subset)

All must pass before opening a PR.
