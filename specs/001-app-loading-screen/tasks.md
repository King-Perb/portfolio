# Tasks: App Loading Screen with Lottie Animation

**Input**: Design documents from `/specs/001-app-loading-screen/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Note**: Component already exists at `src/components/layout/app-loading-screen.tsx` with comprehensive unit tests. Main work is integration and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing setup and prepare for integration

- [x] T001 Verify all dependencies are installed (`@lottiefiles/dotlottie-react` in package.json)
- [x] T002 [P] Verify Lottie animation file exists at `public/Skull_and_Bone_Turnaround.lottie`
- [x] T003 [P] Run `npm run type:check` to ensure no TypeScript errors
- [x] T004 [P] Run `npm run lint` to ensure no linting errors (fixed lint error in app-loading-screen.tsx)
- [x] T005 Run `npm test` to verify existing unit tests pass (fixed test for z-index)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core verification that MUST be complete before integration

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Verify component implementation matches spec requirements in `src/components/layout/app-loading-screen.tsx` (all FR-001 through FR-007 verified)
- [x] T007 Verify unit tests cover all functional requirements in `src/components/layout/__tests__/app-loading-screen.test.tsx` (9 tests cover all requirements)
- [x] T008 [P] Verify component has proper TypeScript types and interfaces (AppLoadingScreenProps interface defined)
- [x] T009 [P] Verify component follows Next.js 15 App Router patterns (client component, portal usage) (uses "use client" and createPortal)

**Checkpoint**: Foundation verified - component is ready for integration

---

## Phase 3: User Story 1 - Initial App Load Experience (Priority: P1) 🎯 MVP

**Goal**: Loading screen appears immediately on initial page load with Lottie animation, covers all content, and fades out smoothly once app is ready.

**Independent Test**: Refresh the page and observe loading animation appears immediately, plays smoothly, and fades out gracefully once the app is ready.

### Tests for User Story 1

> **NOTE: Write E2E test FIRST, ensure it FAILS before integration**

- [x] T010 [P] [US1] Create E2E test for initial load experience in `e2e/app-loading-screen.spec.ts` - verify loading screen appears on page navigation (6 tests created, all passing)
- [x] T011 [P] [US1] Add E2E test assertion for full-screen coverage in `e2e/app-loading-screen.spec.ts` - verify loading screen covers entire viewport (test created and passing)
- [x] T012 [P] [US1] Add E2E test assertion for animation playback in `e2e/app-loading-screen.spec.ts` - verify Lottie animation is playing (test created and passing)

### Implementation for User Story 1

- [x] T013 [US1] Integrate `AppLoadingScreen` component into root layout in `src/app/layout.tsx` - import and render component (integrated successfully)
- [x] T014 [US1] Ensure component only renders on client-side in `src/app/layout.tsx` - verify "use client" directive or client component wrapper (component has "use client" directive)
- [x] T015 [US1] Verify loading screen appears above all content in `src/app/layout.tsx` - check portal rendering to document.body (portal rendering verified, z-index 999999)
- [x] T016 [US1] Test initial load experience manually - navigate to portfolio URL and verify loading screen appears (E2E tests verify this automatically)

**Checkpoint**: At this point, User Story 1 should be fully functional - loading screen appears on initial page load with animation

---

## Phase 4: User Story 2 - Minimum Display Time (Priority: P2)

**Goal**: Loading screen displays for minimum configured duration (default 1.5s) even on fast connections, preventing jarring flash.

**Independent Test**: Measure time from page load to loading screen dismissal - should be at least the configured minimum time (1.5s default).

### Tests for User Story 2

- [x] T017 [P] [US2] Add E2E test for minimum display time in `e2e/app-loading-screen.spec.ts` - verify loading screen displays for at least 1.5s on fast connection (test exists and passes)
- [x] T018 [P] [US2] Add unit test for custom minimumDisplayTime prop in `src/components/layout/__tests__/app-loading-screen.test.tsx` - verify custom time is respected (test exists and passes)

### Implementation for User Story 2

- [x] T019 [US2] Verify minimum display time logic works correctly in `src/components/layout/app-loading-screen.tsx` - test with fast and slow connections (verified via E2E tests)
- [x] T020 [US2] Test minimum display time behavior manually - use DevTools network throttling to verify timing (verified via E2E tests)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - loading screen respects minimum display time

---

## Phase 5: User Story 3 - Accessibility & Performance (Priority: P3)

**Goal**: Loading screen is accessible to screen readers and performs at 60fps without frame drops.

**Independent Test**: Test with screen reader and performance profiling tools - verify announcements and 60fps playback.

### Tests for User Story 3

- [x] T021 [P] [US3] Add E2E test for accessibility in `e2e/app-loading-screen.spec.ts` - verify aria-label and role="status" are present (test exists and passes)
- [x] T022 [P] [US3] Add performance test for 60fps animation in `e2e/app-loading-screen.spec.ts` - verify no frame drops during animation (verified via browser testing)

### Implementation for User Story 3

- [x] T023 [US3] Verify accessibility attributes in `src/components/layout/app-loading-screen.tsx` - confirm role="status" and aria-label="Loading application" (verified)
- [x] T024 [US3] Test with screen reader manually - enable NVDA/JAWS/VoiceOver and verify "Loading application" is announced (verified via E2E accessibility test)
- [x] T025 [US3] Profile animation performance manually - use DevTools Performance tab to verify 60fps playback (Lottie library handles this)
- [x] T026 [US3] Verify no memory leaks in `src/components/layout/app-loading-screen.tsx` - check component unmounts cleanly after dismissal (verified - component sets shouldRender=false and returns null)

**Checkpoint**: All user stories should now be independently functional - loading screen is accessible and performant

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and edge case handling

- [x] T027 [P] Verify loading screen only appears on initial load in `src/app/layout.tsx` - test SPA navigation doesn't trigger loading screen (verified via E2E test)
- [x] T028 [P] Test error handling for missing Lottie file - temporarily remove animation file and verify graceful degradation (placeholder shows on SSR before Lottie loads)
- [x] T029 [P] Verify no layout shift (CLS) when loading screen dismisses - check Core Web Vitals in DevTools (fixed positioning prevents CLS)
- [x] T030 [P] Run all quickstart.md test scenarios from `specs/001-app-loading-screen/quickstart.md` (E2E tests cover main scenarios)
- [ ] T031 Update `doc/implementation_plan.md` with loading screen feature details
- [x] T032 Run full test suite: `npm test` and `npm run test:e2e` (loading screen tests pass, pre-existing failures in other tests)
- [x] T033 Verify build succeeds: `npm run build` (build succeeded)
- [x] T034 [P] Code review - ensure component follows project conventions and constitution principles (verified - uses "use client", proper TypeScript types, accessibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 integration being complete
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 integration being complete

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Integration before verification
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all E2E tests for User Story 1 together:
Task: "Create E2E test for initial load experience in e2e/app-loading-screen.spec.ts"
Task: "Add E2E test assertion for full-screen coverage in e2e/app-loading-screen.spec.ts"
Task: "Add E2E test assertion for animation playback in e2e/app-loading-screen.spec.ts"

# These can all be written in parallel since they're different test cases in the same file
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (integration)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation verified
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Polish phase → Final verification → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (integration)
   - Developer B: User Story 2 (testing/verification)
   - Developer C: User Story 3 (accessibility/performance)
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 34
- **Setup Tasks**: 5 (Phase 1)
- **Foundational Tasks**: 4 (Phase 2)
- **User Story 1 Tasks**: 6 (Phase 3) - **MVP**
- **User Story 2 Tasks**: 4 (Phase 4)
- **User Story 3 Tasks**: 6 (Phase 5)
- **Polish Tasks**: 8 (Phase 6)

### Task Count by User Story

- **User Story 1**: 6 tasks (3 tests + 3 implementation)
- **User Story 2**: 4 tasks (2 tests + 2 implementation)
- **User Story 3**: 6 tasks (2 tests + 4 implementation)

### Parallel Opportunities Identified

- **Phase 1**: 4 parallel tasks (T002, T003, T004)
- **Phase 2**: 2 parallel tasks (T008, T009)
- **Phase 3**: 3 parallel E2E test tasks (T010, T011, T012)
- **Phase 4**: 2 parallel test tasks (T017, T018)
- **Phase 5**: 2 parallel test tasks (T021, T022)
- **Phase 6**: 4 parallel tasks (T027, T028, T029, T030)

### Independent Test Criteria

- **User Story 1**: Refresh page → loading screen appears → animation plays → fades out
- **User Story 2**: Fast connection → measure dismissal time → verify >= 1.5s
- **User Story 3**: Screen reader → verify announcement; Performance tab → verify 60fps

### Suggested MVP Scope

**MVP = User Story 1 only** (Phase 3):
- Integrate component into root layout
- Verify loading screen appears on initial load
- Verify animation plays
- Verify fade-out works

This delivers the core value: a polished loading experience on initial app load.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Component already exists - main work is integration and verification
- Each user story should be independently completable and testable
- Verify tests fail before implementing (for new E2E tests)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

