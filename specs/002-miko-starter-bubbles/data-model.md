# Data Model: Miko Starter Question Bubbles

**Feature**: `002-miko-starter-bubbles`
**Date**: 2025-12-15
**Spec**: `specs/002-miko-starter-bubbles/spec.md`

## Entities

### 1. StarterPrompt

Represents a single predefined question that can be shown as a starter bubble.

**Attributes (conceptual):**
- `id` (string) – stable identifier for the prompt (e.g. `"experience-1"`).
- `text` (string) – user-facing question, e.g. “What are your most impactful projects?”.
- `category` (optional string) – high-level grouping such as `"experience"`, `"projects"`, or `"getting-started"`.
- `order` (optional number) – optional ordering hint within the full list.

**Notes:**
- Defined statically in `src/data/miko-starter-prompts.ts` as a readonly array.
- IDs must be unique and stable over time to keep “used” tracking consistent.

### 2. ConversationMessage (extended)

Existing Miko chat message, conceptually extended with optional metadata indicating it originated from a starter prompt.

**Core attributes (already present conceptually):**
- `id` (string or number) – unique per message.
- `role` (string) – `"user"` or `"assistant"`.
- `content` (string) – message text as displayed in chat.
- `timestamp` (Date / ISO string) – when the message was created.

**New logical attributes for this feature:**
- `source` (optional string) – when set to `"starter-prompt"`, indicates this message was created by clicking a starter bubble.
- `promptId` (optional string) – ID of the `StarterPrompt` that produced this message (matches `StarterPrompt.id`).

**Notes:**
- These fields can be added to the message type definition or handled via a type extension/union depending on existing patterns.
- LocalStorage persistence for the conversation must include these metadata fields so they survive reloads.

### 3. StarterPromptState (derived)

Derived state for the current conversation used to determine which starter bubbles to render.

**Attributes (derived, not stored separately):**
- `allPrompts` – array of `StarterPrompt` from the central data module.
- `usedPromptIds` – `Set<string>` (or array) derived by scanning conversation messages where `source === "starter-prompt"` and collecting `promptId` values.
- `unusedPrompts` – `StarterPrompt[]` computed as `allPrompts` minus any whose IDs appear in `usedPromptIds`.
- `visiblePrompts` – up to three prompts selected from `unusedPrompts` (e.g. first 3 by `order` or array order).

**Notes:**
- `usedPromptIds` should be recomputed whenever the conversation changes or is restored from localStorage.
- `visiblePrompts` drives the actual bubbles UI; when empty, the bubble row is hidden.

## Relationships

- `StarterPrompt 1..* → 0..* ConversationMessage`
  - A single `StarterPrompt` may correspond to zero or many `ConversationMessage` instances across time.
  - Within a single conversation, each `StarterPrompt` should only produce at most one `ConversationMessage` with `source === "starter-prompt"`.

- `ConversationMessage 0..1 → 0..1 StarterPrompt`
  - Only messages with `source === "starter-prompt"` and a `promptId` pointing to an existing `StarterPrompt` participate in this relationship.

- `StarterPromptState` depends on both `StarterPrompt` list and current conversation messages; it is **derived**, not persisted separately.

## Validation Rules & Constraints

- `StarterPrompt.id`:
  - MUST be unique across the prompt list.
  - SHOULD be a stable, human-readable key (no random UUIDs necessary).

- `StarterPrompt.text`:
  - MUST be non-empty and short enough to fit in the bubble UI without wrapping excessively on mobile.

- `ConversationMessage` with `source === "starter-prompt"`:
  - MUST have a non-empty `promptId` that matches an existing `StarterPrompt.id`.
  - MUST have `role === "user"` (starter bubbles simulate user input).

- `StarterPromptState.visiblePrompts`:
  - MUST contain at most 3 entries.
  - MUST contain only prompts whose IDs are NOT in `usedPromptIds`.

## State Transitions (High-Level)

1. **Initial Load with Empty Conversation**
   - Conversation messages array is empty.
   - `usedPromptIds` is empty.
   - `visiblePrompts` = first 3 prompts from `allPrompts`.

2. **User Clicks a Starter Bubble**
   - A new `ConversationMessage` is appended:
     - `role: "user"`, `content: StarterPrompt.text`, `source: "starter-prompt"`, `promptId: StarterPrompt.id`.
   - `usedPromptIds` now includes that `promptId`.
   - The clicked prompt is removed from `visiblePrompts` (and from `unusedPrompts`).

3. **Reload / Restoration from LocalStorage**
   - Conversation messages are loaded, including any starter-prompt messages with metadata.
   - `usedPromptIds` is recomputed from these messages.
   - `visiblePrompts` is recomputed as `allPrompts` minus `usedPromptIds`, limited to 3 items.

4. **All Prompts Used**
   - `usedPromptIds` contains all `StarterPrompt.id` values.
   - `unusedPrompts` and `visiblePrompts` are empty.
   - UI hides or collapses the starter bubble row.
