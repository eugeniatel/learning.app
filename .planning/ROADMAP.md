# Roadmap: Curriculum Companion App

## Overview

Session 1 shipped the foundation (This Week view, data layer, content files). Sessions 2 through 5+ deliver the remaining interactive surfaces: concept detail and notes, the weeks list and review queue, writeback actions that make the tracker live, and finally the flexible-phase track map once checkpoint 3 is decided. Each phase completes a coherent, usable capability.

## Phases

- [ ] **Phase 1: Concept Detail and Notes** - Concept index, detail pages, note editor, and question capture
- [ ] **Phase 2: All Weeks and Review** - Weeks list with week-switching and the review surface
- [ ] **Phase 3: Writeback Actions** - Session status, reflections, artifact read-status, questions queue
- [ ] **Phase 4: Flexible Track Map** - Horizontal spine diagram and branch cards (blocked on checkpoint 3)

## Phase Details

### Phase 1: Concept Detail and Notes
**Goal**: Eugenia can navigate the full concept library, read concept details with their linked artifacts, and write and save notes against any concept
**Depends on**: Nothing (session 1 already shipped; this is the first active phase)
**Requirements**: CONCEPT-01, CONCEPT-02, NOTE-01, NOTE-02, QUESTION-01
**Success Criteria** (what must be TRUE):
  1. Eugenia can browse all 76 concepts at `/concepts`, grouped by module, and filter by title
  2. Eugenia can open any concept and see its one-liner, linked artifact chips with type and read status, related concepts, and open questions
  3. Eugenia can type a note in the concept detail editor and save it; the note persists to `notes/<slug>.md` across reloads
  4. Eugenia can type a question in the concept detail capture box and it appears in `progress.json.openQuestions`
**Plans**: 4 plans
Plans:
- [x] 01-01-PLAN.md — Concept index at /concepts with client-side title filter
- [x] 01-02-PLAN.md — Concept detail scaffold at /concepts/[slug] with two-column layout
- [x] 01-03-PLAN.md — Note editor with server action (writes to notes/<slug>.md)
- [x] 01-04-PLAN.md — Open question capture with server action (writes to progress.json)
**UI hint**: yes

### Phase 2: All Weeks and Review
**Goal**: Eugenia can see her full week history at a glance, switch to any past or upcoming week, and review concepts one card at a time
**Depends on**: Phase 1
**Requirements**: WEEKS-01, WEEKS-02, REVIEW-01, REVIEW-02, REVIEW-03
**Success Criteria** (what must be TRUE):
  1. Eugenia can open `/weeks` and see every week grouped by module, most-recent first, each row linking to that week
  2. Eugenia can select a week and confirm the switch; `progress.json.currentWeek` updates and the home view reflects the new week
  3. Eugenia can open `/review` and see one concept card at a time with yes / not-quite buttons and a free-text field
  4. Submitting a review updates `progress.json.reviews[]` with `lastReviewed`, `nextSuggested`, and `status`, and the next card is based on recency ordering
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — /weeks index with module-grouped WeekRow list and WeeksList client island
- [x] 02-02-PLAN.md — Week-switch confirmation strip and switchWeekAction server action
- [x] 02-03-PLAN.md — /review surface with ReviewCard, ReviewQueue, and submitReviewAction server action
**UI hint**: yes

### Phase 3: Writeback Actions
**Goal**: The tracker becomes live: session status cycles, reflections save, artifact read-status toggles, and questions can be parked or answered
**Depends on**: Phase 2
**Requirements**: QUESTION-02, QUESTION-03, SESSION-01, SESSION-02, REFLECT-01, ARTIFACT-01
**Success Criteria** (what must be TRUE):
  1. Eugenia can click a session card on This Week to cycle it through todo, in-progress, and done; the status persists across reloads
  2. Eugenia can type in the reflection textarea and save it; the text persists to `notes/reflections/week-<id>.md`
  3. Eugenia can toggle the read-status on any artifact chip; the change writes back to `artifacts.json`
  4. Eugenia can open `/questions`, see all open questions grouped by concept, and park or answer any question; status updates write back to `progress.json`
**Plans**: TBD
**UI hint**: yes

### Phase 4: Flexible Track Map (BLOCKED)
**Goal**: Eugenia can see the full flexible-phase curriculum as a visual spine diagram and know which branches she is ready to pull
**Depends on**: Phase 3
**Status**: BLOCKED on checkpoint 3 decision (foundational-to-flexible trigger logic must be decided after week 1 of real use)
**Requirements**: FLEX-01, FLEX-02, FLEX-03
**Success Criteria** (what must be TRUE):
  1. Eugenia can open `/flexible-map` and see main modules on the top rail and interpretability modules on the bottom rail as pill nodes, with dashed branch connectors
  2. The current active node is visually emphasized; completed nodes are visually distinct
  3. "Ready to pull" cards at the bottom of the map show next branches based on prereqs
  4. Phase transition logic in `src/lib/phase.ts` implements whichever checkpoint-3 option is chosen with no wider refactor required
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Concept Detail and Notes | 4/4 | Complete |  |
| 2. All Weeks and Review | 1/3 | In Progress|  |
| 3. Writeback Actions | 0/TBD | Not started | - |
| 4. Flexible Track Map | 0/TBD | Blocked | - |
