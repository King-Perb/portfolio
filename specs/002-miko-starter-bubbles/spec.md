# Feature Specification: Miko Starter Question Bubbles

**Feature Branch**: `002-miko-starter-bubbles`
**Created**: 2025-12-15
**Status**: Draft
**Input**: User description: "Add starter question bubbles to the Miko AI chat at /ai-miko. Show three clickable questions above the text input about Miko's experience and projects, send the question as a user message when clicked, and never show the same question twice in a conversation (even after reload)."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Start a Conversation with Suggested Questions (Priority: P1)

As a visitor on the Miko AI page, I want to see a few suggested questions I can click on so that I can quickly start a meaningful conversation with Miko without having to think of what to ask first.

**Why this priority**: The first interaction with Miko is critical for engagement. Providing clear, helpful starter questions lowers friction, makes the experience more approachable, and increases the likelihood that new users actually start chatting.

**Independent Test**: Can be fully tested by visiting `/ai-miko` with an empty conversation, verifying that three starter bubbles appear above the input on desktop (and two bubbles on mobile viewports), clicking one bubble, and confirming that it sends a message, removes that bubble, and that Miko responds as if the user had typed the question.

**Acceptance Scenarios**:

1. **Given** a new visitor on `/ai-miko` with no prior conversation, **When** the page finishes loading on a desktop viewport, **Then** three starter question bubbles are visible directly above the text input
2. **Given** a new visitor on `/ai-miko` with no prior conversation, **When** the page finishes loading on a mobile viewport, **Then** at most two starter question bubbles are visible directly above the text input
3. **Given** starter question bubbles are visible, **When** the user clicks one bubble, **Then** the bubble’s text is sent as a user message into the conversation and that bubble disappears from the UI
4. **Given** the user has clicked a starter bubble, **When** they look at the message list, **Then** the clicked question appears as a user-authored message in the correct chronological position

---

### User Story 2 - Avoid Repeating Used Starter Questions (Priority: P2)

As a returning user or someone who has already clicked some starter bubbles, I don’t want to see the same suggestions again in the bubble row so that the prompts always feel fresh and relevant to the current conversation.

**Why this priority**: Repeating the same prompts makes the UI feel static and can confuse users who think their previous actions were not recognized. Ensuring prompts are one-time-use per conversation keeps the interface feeling responsive and intelligent.

**Independent Test**: Can be tested by clicking a starter bubble, verifying it disappears, reloading the page (or returning later with the same stored conversation), and confirming that the already-used question never reappears as a starter bubble.

**Acceptance Scenarios**:

1. **Given** three starter bubbles are visible, **When** the user clicks one of them, **Then** that specific bubble is removed from the bubble row and is not shown again during the current session
2. **Given** the user has clicked one or more starter bubbles, **When** they reload `/ai-miko` and the previous conversation is restored from localStorage, **Then** any previously used starter questions do not appear in the bubble row
3. **Given** the user has eventually used all available starter questions, **When** they visit `/ai-miko` again with the same conversation, **Then** no starter bubbles are shown and the layout still looks correct without them

---

### User Story 3 - Maintainable Starter Question Library (Priority: P3)

As a developer or content owner, I want all Miko starter questions to be defined in a single, simple data structure so that I can easily add, remove, or adjust questions without touching core chat logic.

**Why this priority**: Centralizing the prompts keeps the feature maintainable and reduces the risk of divergence between UI, behavior, and content. It also makes it easy to A/B test or iterate on the wording of starter questions.

**Independent Test**: Can be tested by updating the starter prompt definitions in a single data file, running the app, and verifying that the rendered bubbles update to match the new copy or ordering without any additional code changes.

**Acceptance Scenarios**:

1. **Given** the starter prompt definitions are updated in the shared data file, **When** the application is reloaded, **Then** the bubbles shown above the input reflect the new questions and ordering
2. **Given** new prompts are added to the data file, **When** there are fewer than three unused prompts for a conversation, **Then** the UI still shows only the available unused prompts (e.g., one or two bubbles) without breaking layout

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when there are fewer than three unused prompts left? (UI should show only remaining prompts without layout glitches)
- What happens when all prompts have been used in the current conversation? (Bubble row should be hidden or collapsed gracefully)
- What happens if localStorage is unavailable or fails? (Feature should still work within the current session, even if used prompts are not remembered across reloads)
- What happens if the prompt list is empty due to misconfiguration? (Chat should still work normally without showing bubbles)
- What happens when the user quickly clicks multiple bubbles in succession? (Each click should send at most one message and mark that prompt as used exactly once)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST display up to three starter question bubbles above the Miko AI text input on desktop viewports, and at most two starter question bubbles on mobile viewports, when the user visits `/ai-miko` with at least one unused starter prompt available.
- **FR-002**: Each starter bubble MUST render a short, human-readable question about Miko’s experience, projects, or how Miko can help.
- **FR-003**: When the user clicks a starter bubble, the system MUST send the bubble text as a user-authored message into the Miko conversation, using the same flow as manually typed input.
- **FR-004**: After a starter bubble is clicked, the system MUST mark that underlying prompt as “used” for the current conversation and immediately remove that bubble from the UI.
- **FR-005**: The system MUST ensure that any prompt marked as “used” for the current conversation is never shown again as a bubble, including after a page reload where the conversation is restored from persistent storage.
- **FR-006**: The system MUST maintain a single source of truth for the available starter prompts (e.g., a shared data module) that can be consumed by the chat UI.
- **FR-007**: The system MUST derive the set of used starter prompts from the conversation history (e.g., via message metadata such as a `source` or `promptId` field) rather than solely from ephemeral UI state.
- **FR-008**: The system MUST gracefully handle the case where there are fewer than three unused prompts, showing only the available unused prompts without breaking layout.
- **FR-009**: The system MUST gracefully handle the case where there are zero available prompts (e.g., due to configuration or all prompts being used) by hiding or collapsing the bubble row while keeping the chat fully usable.

### Key Entities *(include if feature involves data)*

- **Starter Prompt**: Represents a single predefined question that can be suggested to the user. Attributes include a stable ID, display text, and optional category (e.g., “experience”, “projects”, “getting-started”).
- **Conversation Message**: Existing chat message entity extended (logically, not necessarily in types) to optionally include metadata indicating that it originated from a starter prompt (e.g., `source: "starter-prompt"`, `promptId`).
- **Starter Prompt State**: Derived state for a given conversation that includes the set of used prompt IDs and the list of currently visible, unused prompts.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 90% of new sessions on `/ai-miko` display three starter question bubbles when there are three or more unused prompts configured.
- **SC-002**: At least 95% of clicks on a starter bubble result in exactly one corresponding user message being added to the conversation and the clicked bubble disappearing immediately.
- **SC-003**: In automated tests simulating a reload after using starter bubbles, 100% of previously used starter prompts remain hidden from the bubble row.
- **SC-004**: Content owners can add or edit starter questions by modifying a single data module, with no changes required to the chat container or core messaging logic.
- **SC-005**: The presence of starter bubbles does not increase the time to interactive for `/ai-miko` by more than 50ms in lab performance measurements.
