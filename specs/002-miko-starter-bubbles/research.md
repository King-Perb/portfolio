# Research & Decisions: Miko Starter Question Bubbles

**Feature**: `002-miko-starter-bubbles`
**Date**: 2025-12-15
**Spec**: `specs/002-miko-starter-bubbles/spec.md`

## Overview

This feature is primarily a frontend UX enhancement for the existing Miko AI chat page at `/ai-miko`.
There are no new external integrations, APIs, or backend services required. The key unknowns are UX behavior and data modeling for starter prompts.

## Decisions

### 1. Source of Truth for Starter Prompts

- **Decision**: Store all starter prompts in a dedicated TypeScript data module, e.g. `src/data/miko-starter-prompts.ts`, exporting an array of objects `{ id, text, category? }`.
- **Rationale**: Keeps content centralized and easy to manage without touching core chat logic. Simplifies testing and reuse.
- **Alternatives considered**:
  - Hard-coding prompts directly inside the chat component (tighter coupling, harder to maintain).
  - Fetching prompts from an API (unnecessary complexity for static copy; adds latency and failure modes).

### 2. Tracking Used Prompts

- **Decision**: Derive “used prompts” from the existing conversation history by tagging messages that originate from starter bubbles with metadata (e.g. `source: "starter-prompt"`, `promptId`).
- **Rationale**: Avoids maintaining a parallel persisted data structure just for prompts; leverages existing localStorage conversation persistence to keep behavior consistent across reloads.
- **Alternatives considered**:
  - Separate localStorage key specifically for used prompt IDs (more moving parts and risk of desync with conversation).
  - In-memory state only (would not survive reloads; contradicts spec’s persistence requirement).

### 3. UX Behavior When No Prompts Are Available

- **Decision**: If there are zero unused prompts for the current conversation, hide or collapse the starter bubble row entirely and keep the rest of the chat layout unchanged.
- **Rationale**: Avoids showing empty UI chrome; keeps focus on the text input and conversation.
- **Alternatives considered**:
  - Showing a disabled or “no suggestions” message (adds noise without strong UX benefit).

### 4. Number and Content of Starter Prompts

- **Decision**: Start with a small curated set (e.g. 5–8 prompts) focused on three themes: Miko’s experience, Miko’s projects, and “how Miko can help”. At any time, render up to 3 unused prompts.
- **Rationale**: Keeps the UI simple while allowing rotation of prompts across conversations; aligns with spec requirement of “three bubbles” when available.
- **Alternatives considered**:
  - Only three total prompts (less variety).
  - Large dynamic catalog (overkill for portfolio context).

### 5. No Direct OpenAI / External API Calls in Tests

- **Decision**: Reuse existing mocking strategy for the Miko chat API in unit and E2E tests; never call real OpenAI APIs from this feature’s tests.
- **Rationale**: Keeps tests fast, deterministic, and cost-free; consistent with project-wide testing approach.
- **Alternatives considered**:
  - Hitting real APIs during E2E for “more realistic” behavior (would violate testing guidelines and introduce instability).

## Unresolved / Deferred Items

No critical technical clarifications remain for this feature. Any future changes (e.g. A/B testing different prompts, tracking analytics on prompt usage) can be layered on top of the current design without modifying the core model.
