# Requirements

Scope: v1 of the curriculum companion app. Foundational phase only. Desktop browser, localhost.

## Validated (shipped session 1)

### This Week view
- ✓ **THIS-01**: App runs on `localhost:3000` via `pnpm dev` without errors.
- ✓ **THIS-02**: `/` renders This Week view with real data for the current week from `progress.json`.
- ✓ **THIS-03**: Session cards show status (done, in-progress, todo) with artifact chips and estimated minutes.
- ✓ **THIS-04**: Week header shows week number, date range, module title, module goal, progress counter.
- ✓ **THIS-05**: Reflection prompt block rendered on This Week view (disabled in session 1, writeable later).
- ✓ **THIS-06**: Shell with left-rail nav (This week, All weeks, Concepts, Open questions, Review) and phase indicator.

### Content and data layer
- ✓ **CONTENT-01**: `curriculum/` contains per-module markdown (`mod-0.md` to `mod-10.md`, `int-1.md` to `int-4.md`) with zod-validated frontmatter.
- ✓ **CONTENT-02**: `spine.json`, `concepts.json`, `artifacts.json`, `progress.json` exist and parse.
- ✓ **DATA-01**: All fs reads live in `src/lib/data.ts`. Components take props.
- ✓ **DATA-02**: Zod schemas in `src/lib/schemas.ts` validate all JSON and frontmatter.
- ✓ **DATA-03**: Phase transition seam in `src/lib/phase.ts` accepts any of the four checkpoint-3 options without refactor.

### Visual and constraints
- ✓ **VISUAL-01**: Inter font, paper background `#FAF9F5`, coral accent `#D97757`, sentence case, two font weights (400, 500), 0.5px borders, no shadows.
- ✓ **STUBS-01**: `/weeks`, `/concepts`, `/concepts/[slug]`, `/questions`, `/review` return 200 with "coming soon" content.

## Active (v1 targets for sessions 2 to 5)

### Concept detail and notes
- [x] **CONCEPT-01**: `/concepts/[slug]` renders concept title, one-liner, linked artifacts (chips with type + read status), related concepts sidebar.
- [x] **CONCEPT-02**: `/concepts` renders concept index grouped by module, with search by title.
- [x] **NOTE-01**: Each concept has a note editor (plain textarea in v1) that saves markdown to `notes/<slug>.md` with frontmatter (`conceptId`, `updatedAt`).
- [x] **NOTE-02**: Saving is a Next.js server action; writes go through `src/lib/notes.ts` (new file).
- [x] **QUESTION-01**: Concept detail has an "open question" capture box that writes to `progress.json.openQuestions`.

### All weeks and review
- [x] **WEEKS-01**: `/weeks` renders every week from `progress.json.weeks`, grouped by module, most-recent first. Each row links to a detail route.
- [ ] **WEEKS-02**: Selecting a week on `/weeks` updates `progress.json.currentWeek` if the user confirms.
- [x] **REVIEW-01**: `/review` presents one concept card at a time, with yes / not-quite buttons and a free-text field.
- [x] **REVIEW-02**: Review answers update `progress.json.reviews[]` with `lastReviewed`, `nextSuggested`, and `status`.
- [x] **REVIEW-03**: Review surface picks the next due concept based on simple recency ordering (no spaced repetition in v1).

### Questions queue
- [ ] **QUESTION-02**: `/questions` renders all open questions grouped by concept, with status badges.
- [ ] **QUESTION-03**: Actions park (open to parked) or answer (open to answered) a question; writes back to `progress.json`.

### Session and reflection writebacks
- [ ] **SESSION-01**: Clicking a session card on This Week cycles status (todo to in-progress to done).
- [ ] **SESSION-02**: `progress.json` updates persist across reloads.
- [x] **REFLECT-01**: Reflection textarea on This Week saves to `notes/reflections/week-<id>.md`; linked from the week header.
- [x] **ARTIFACT-01**: Artifact chips expose a read-status toggle that writes back to `artifacts.json`.

### Flexible phase (blocked on checkpoint 3)
- [ ] **FLEX-01**: `/flexible-map` renders the horizontal spine: main modules top rail, interpretability modules bottom rail, branches above with dashed connectors. Current node emphasized.
- [ ] **FLEX-02**: "Ready to pull" cards at the bottom suggest next branches based on prereqs.
- [ ] **FLEX-03**: Phase transition logic in `src/lib/phase.ts` implements the chosen checkpoint-3 trigger (time, milestone, manual toggle, or hybrid). Decided after week 1 of real use.

## Out of Scope

- Claude API integration. v1 is passive. Integration seam marked in `src/lib/phase.ts`.
- Authentication. Single-user local tool.
- Cloud sync, multi-user, mobile, deployment.
- Database or ORM.
- Streaks, scores, leaderboards, completion-speed progress bars. Violates Core Value.
- Bidirectional linking in notes (deferred; plain markdown in v1).
- Full-text search across notes (deferred).
- Reflection aggregation view (deferred).
- Spaced-repetition review algorithm (deferred; simple recency in v1).
- Animations beyond 250ms ease-out transitions.
- More than two font weights.
- Emoji-based icon system. Use Lucide.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONCEPT-01 | Phase 1 | Complete |
| CONCEPT-02 | Phase 1 | Complete |
| NOTE-01 | Phase 1 | Complete |
| NOTE-02 | Phase 1 | Complete |
| QUESTION-01 | Phase 1 | Complete |
| WEEKS-01 | Phase 2 | Complete |
| WEEKS-02 | Phase 2 | Pending |
| REVIEW-01 | Phase 2 | Complete |
| REVIEW-02 | Phase 2 | Complete |
| REVIEW-03 | Phase 2 | Complete |
| QUESTION-02 | Phase 3 | Pending |
| QUESTION-03 | Phase 3 | Pending |
| SESSION-01 | Phase 3 | Pending |
| SESSION-02 | Phase 3 | Pending |
| REFLECT-01 | Phase 3 | Complete |
| ARTIFACT-01 | Phase 3 | Complete |
| FLEX-01 | Phase 4 | Blocked |
| FLEX-02 | Phase 4 | Blocked |
| FLEX-03 | Phase 4 | Blocked |
