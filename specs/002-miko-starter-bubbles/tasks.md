# Tasks: Miko Starter Question Bubbles

**Feature**: `002-miko-starter-bubbles`
**Spec**: `specs/002-miko-starter-bubbles/spec.md`
**Plan**: `specs/002-miko-starter-bubbles/plan.md`

## Phase 1 – Setup

- [ ] T001 Create central starter prompts data module in `src/data/miko-starter-prompts.ts`
- [ ] T002 Wire new feature branch context into local environment and verify `002-miko-starter-bubbles` is checked out

## Phase 2 – Foundational (Shared Infrastructure)

- [ ] T003 Add optional `source` and `promptId` metadata fields to the Miko chat message type in `src/hooks/use-chat-stream.ts` (or associated types file)
- [ ] T004 Ensure conversation persistence to localStorage includes `source` and `promptId` fields in `src/hooks/use-chat-stream.ts`
- [ ] T005 [P] Add helper function to derive `usedPromptIds` and `visiblePrompts` from messages and `miko-starter-prompts` in `src/components/ai-miko/chat-container.tsx`

## Phase 3 – User Story 1 (Start a Conversation with Suggested Questions) [P1]

Goal: Show up to three helpful starter question bubbles above the Miko AI input on `/ai-miko` for desktop, and at most two bubbles on mobile, and send the question as a user message when clicked.

- [ ] T006 [US1] Render starter bubbles above the text input using `visiblePrompts` in `src/components/ai-miko/chat-container.tsx`
- [ ] T007 [P] [US1] Implement click handler that sends the prompt text as a user message with `source: "starter-prompt"` and `promptId` in `src/components/ai-miko/chat-container.tsx`
- [ ] T008 [P] [US1] Add unit/component tests to verify initial rendering of three bubbles and click-to-send behavior in `src/components/ai-miko/__tests__/chat-container.test.tsx`
- [ ] T009 [P] [US1] Add or extend E2E test for `/ai-miko` to cover presence of starter bubbles and sending a message via bubble click in `e2e/ai-miko.spec.ts`

Independent test criteria:
- Visiting `/ai-miko` with an empty conversation shows three starter bubbles above the input on desktop viewports and at most two on mobile viewports.
- Clicking a bubble sends the question as a user-authored message and removes that bubble from the UI.

## Phase 4 – User Story 2 (Avoid Repeating Used Starter Questions) [P2]

Goal: Ensure starter questions are only shown once per conversation, including after page reload when the conversation is restored.

- [ ] T010 [US2] Derive `usedPromptIds` from messages where `source === "starter-prompt"` and `promptId` is set in `src/components/ai-miko/chat-container.tsx`
- [ ] T011 [P] [US2] Filter `visiblePrompts` to exclude any prompts whose IDs are in `usedPromptIds` and limit to three prompts in `src/components/ai-miko/chat-container.tsx`
- [ ] T012 [P] [US2] Add unit tests to verify that previously used prompts do not render again in the bubble row in `src/components/ai-miko/__tests__/chat-container.test.tsx`
- [ ] T013 [P] [US2] Extend E2E test to reload `/ai-miko` after clicking a starter bubble and confirm that the used prompt does not reappear in `e2e/ai-miko.spec.ts`

Independent test criteria:
- After clicking a starter bubble, that specific prompt no longer appears in the bubble row for the remainder of the session.
- After reload with conversation restored from localStorage, previously used prompts remain hidden while unused prompts still appear.

## Phase 5 – User Story 3 (Maintainable Starter Question Library) [P3]

Goal: Keep all Miko starter questions in a single, easy-to-maintain data structure that can be updated without touching core chat logic.

- [ ] T014 [US3] Define an explicit `StarterPrompt` TypeScript type and static prompt list in `src/data/miko-starter-prompts.ts`
- [ ] T015 [P] [US3] Document categories and usage guidelines for starter prompts as comments in `src/data/miko-starter-prompts.ts`
- [ ] T016 [P] [US3] Add unit tests to assert that all prompt IDs are unique and that the exported list matches expected defaults in `src/data/__tests__/miko-starter-prompts.test.ts`

Independent test criteria:
- Updating only `src/data/miko-starter-prompts.ts` (IDs and text) changes the rendered bubbles without further code changes.
- Adding new prompts increases the pool used for rotation while still showing at most three unused prompts at a time.

## Phase 6 – Polish & Cross-Cutting Concerns

- [ ] T017 Ensure starter bubbles are fully keyboard accessible and use appropriate ARIA/role attributes in `src/components/ai-miko/chat-container.tsx`
- [ ] T018 [P] Verify that starter bubble logic does not significantly impact initial render performance on `/ai-miko` (manual check plus any relevant profiling notes in `specs/002-miko-starter-bubbles/research.md`)
- [ ] T019 [P] Update feature documentation in `specs/002-miko-starter-bubbles/quickstart.md` to reflect final implementation details and test commands
- [ ] T020 Update `doc/implementation_plan.md` with a brief summary of the Miko starter bubbles feature and key files touched

## Dependencies & Execution Order

- Phase 1 (Setup) MUST be completed before Phases 2–6.
- Phase 2 (Foundational) MUST be completed before any user story phases (3–5).
- Phase 3 (US1) should be implemented before Phase 4 (US2), as US2 builds on the basic bubble rendering and click behavior.
- Phase 5 (US3) can proceed in parallel with Phase 4 once the data module exists and basic wiring is in place.
- Phase 6 (Polish) should run after all user story phases are functionally complete.

Parallelizable tasks are marked with `[P]` and can be executed concurrently when their dependencies are satisfied (e.g., tests in different files, E2E vs. unit tests).

## MVP Scope

The MVP for this feature is **User Story 1**:

- Implement Phases 1–3 (T001–T009) so that new users on `/ai-miko` see starter bubbles and can start a conversation by clicking them.
- US2 and US3 can be delivered as follow-up increments to improve persistence behavior and maintainability.
