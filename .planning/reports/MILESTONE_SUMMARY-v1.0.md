# Milestone v1.0 — Curriculum companion app

**Generated:** 2026-04-20
**Purpose:** Team onboarding and project review (single-reader: Eugenia)
**Status:** Mid-milestone. Phases 1 to 3 complete. Phase 4 (flexible-phase track map) blocked by design until after week 1 of real use.

---

## 1. Project Overview

A single-user, self-paced desktop-browser app that helps Eugenia execute a 9 to 14 month AI research curriculum in a homeschooling rhythm. The app is a tracker and a notebook, not a tutor. Markdown on disk, a single `progress.json`, Next.js 16 + Tailwind + shadcn, visual language matching claude.ai. v1 is a passive tracker with no Claude API, no database, no auth, no deployment. Runs on `localhost:3000` via `pnpm dev`.

Core value: one place to see what to work on this week, keep notes against concepts, and park questions for later. Readiness over speed, never gamified.

**What works today:**
- This Week view on `/` with session cycling and end-of-week reflection save
- Concept library at `/concepts` (filterable) and detail at `/concepts/[slug]` with notes, linked artifacts, open-question capture, related concepts
- Week history at `/weeks` with per-week detail at `/weeks/[id]` and switch action
- Review surface at `/review` with recency-ordered queue and yes/not-quite binary
- Questions queue at `/questions` with park/answer/reopen actions
- Artifact read-status toggle on every chip

**Deferred by design:** flexible-phase track map (`/flexible-map`), Claude API integration, bidirectional note linking, spaced-repetition review, full-text search, reflection aggregation.

## 2. Architecture and technical decisions

- **Framework:** Next.js 16 App Router + TypeScript. Chosen in session 1 because it matches claude.ai's stack and gives the cleanest shadcn integration.
- **Styling:** Tailwind v4 + shadcn/ui (base-nova preset). Inter via `next/font/google`. Paper background `#FAF9F5`, coral accent `#D97757`, 0.5px borders, no shadows, 150 to 250ms ease-out transitions.
- **Data layer:** `fs/promises` + `gray-matter` only. No database, no ORM, no API routes beyond Next.js server actions. All fs reads funnel through `src/lib/data.ts`, `src/lib/notes.ts`, `src/lib/reflections.ts`, `src/lib/progress.ts`, `src/lib/artifacts.ts`, `src/lib/review.ts`. No direct fs in components.
- **Writes:** every mutation is a Next.js server action at `src/lib/actions/<verb-noun>.ts` with `"use server"`. Pattern: action calls the lib, lib reads then writes atomically (tmp + rename), action calls `revalidatePath`.
- **State:** `progress.json` is the single source of truth for mutable state. No Redux, no Zustand. React server components + props + client islands for interaction.
- **Validation:** Zod schemas in `src/lib/schemas.ts` validate every JSON file and markdown frontmatter.
- **Phase seam:** `src/lib/phase.ts` accepts any of the four checkpoint 3 options (time, milestone, manual, hybrid) without refactor. Decision deferred until after week 1 of real use.
- **Claude API seam:** marked `claudeApiIntegrationSeam = null` in `phase.ts` so post-v1 wiring has a marker.
- **Component limits:** under 200 lines each; logic in `src/lib/`, not components.
- **Typography:** exactly 4 sizes (12, 13, 15, 22 px) and 2 weights (400, 500). Sentence case, no em dashes.
- **Spacing:** 8-point scale with three named exceptions documented in Phase 1/2/3 UI-SPECs: `shell-x` (40px), `md-tight` (12px), `badge-pad` (shadcn badge micro-padding px-1.5 py-0.5).
- **Coral usage:** reserved for commit gestures only (dirty save, add question active, review "Got it", switch confirm "Yes, switch", nav active, focus ring). Artifact read-status is grayscale, preserving the "coral = commit" metaphor.
- **Icons:** Lucide only, no emoji system.
- **Package manager:** pnpm. Lint: ESLint (Next.js default) over Biome.
- **Commits:** plain subjects, no Co-Authored-By footer (user's Vercel hook rejects it).

## 3. Phases delivered

| Phase | Name | Status | One-liner |
|---|---|---|---|
| Session 1 | This Week scaffold | ✅ Validated | Next.js + Tailwind + shadcn scaffold, curriculum split into 15 module markdowns, data layer, This Week view wired to real data |
| 1 | Concept Detail and Notes | ✅ Complete | `/concepts` index + `/concepts/[slug]` detail with notes, artifact chips, related concepts, open-question capture |
| 2 | All Weeks and Review | ✅ Complete | `/weeks` list + `/weeks/[id]` detail with switch action + `/review` recency-ordered queue |
| 3 | Writeback Actions | ✅ Complete | Session cycling, reflection save, artifact read-status toggle, questions queue park/answer/reopen |
| 4 | Flexible Phase Track Map | 🔒 Blocked | Horizontal spine diagram with branches. Blocked on checkpoint 3 trigger decision; unblocks after week 1 of real use |

11 plans executed (+1 gap closure plan 02-04). 4 UI-SPECs (1 per phase + session-1 inline). 3 VERIFICATION.md reports.

## 4. Requirements coverage

### Validated (shipped + proven)
- ✅ **THIS-01 to THIS-06** — This Week view, shell, phase indicator, reflection prompt. Session 1.
- ✅ **CONTENT-01, CONTENT-02** — Curriculum markdown + indexes (spine, concepts, artifacts). Session 1.
- ✅ **DATA-01 to DATA-03** — Data layer, zod schemas, phase seam. Session 1.
- ✅ **VISUAL-01, STUBS-01** — Visual tokens, stub routes. Session 1.
- ✅ **CONCEPT-01, CONCEPT-02** — `/concepts` index with filter; `/concepts/[slug]` detail. Phase 1.
- ✅ **NOTE-01, NOTE-02** — Note editor + server action writing `notes/<slug>.md`. Phase 1.
- ✅ **QUESTION-01** — Open-question capture from concept detail. Phase 1.
- ✅ **WEEKS-01, WEEKS-02** — `/weeks` list grouped by module with row links; `/weeks/[id]` detail page hosts the switch action. Phase 2 (+02-04 gap closure).
- ✅ **REVIEW-01, REVIEW-02, REVIEW-03** — `/review` single-card surface with recency queue and write-back. Phase 2.
- ✅ **SESSION-01, SESSION-02** — Session status cycle on `/`, optimistic, persisted. Phase 3.
- ✅ **REFLECT-01** — Reflection textarea on `/` saves to `notes/reflections/week-<id>.md`. Phase 3.
- ✅ **ARTIFACT-01** — Artifact read-status toggle cycles unread/in_progress/read, writes back to `artifacts.json`. Phase 3.
- ✅ **QUESTION-02, QUESTION-03** — `/questions` grouped queue with park/answer/reopen and error copy. Phase 3.

### Blocked / pending
- 🔒 **FLEX-01, FLEX-02, FLEX-03** — Flexible-phase track map. Phase 4, blocked on checkpoint 3 decision. Expected unblock after week 1 of real use.

All 25 Active requirements are satisfied except the 3 intentionally-blocked FLEX requirements.

## 5. Key decisions log

| ID | Decision | Phase | Rationale | Outcome |
|---|---|---|---|---|
| D1 | Next.js 16 + shadcn base-nova preset | Session 1 | Matches claude.ai stack; best typed DX | ✅ Good |
| D2 | ESLint over Biome | Session 1 | Next default, fewer config surprises with v16 | ✅ Good |
| D3 | `progress.json` as sole mutable state | Session 1 | No DB, opens in Obsidian, survives app breakage | ✅ Good |
| D4 | Claude API seam in `phase.ts` | Session 1 | Marker for post-v1 wiring | — Pending |
| D5 | Defer checkpoint 3 | Session 1 (brief) | Per brief, decide after 1 week of real use | 🔒 Blocked |
| D6 | Coarse GSD granularity | GSD init | Brief's session-by-session plan maps 1:1 to phases | ✅ Good |
| D7 | Skip GSD research and codebase map | GSD init | PROJECT_BRIEF.md is thorough; codebase small and known | ✅ Good |
| D8 | ConceptIndex is the only client component on `/concepts`; ConceptCard stays server | Phase 1 | Minimize client JS | ✅ Good |
| D9 | Two-step server-action split: lib function (pure fs) + action wrapper (`"use server"`) | Phase 1 | Separation of concerns, reusable lib | ✅ Good |
| D10 | Slug validation in `saveNote` per threat model T-03-03 | Phase 1 | Defense against path traversal via concept slug | ✅ Good |
| D11 | Optimistic append + silent revert for fire-and-forget writes | Phase 1 | Single-user local tool; aggressive error UX is overkill | ✅ Good |
| D12 | Review note field accepted but NOT persisted in v1 | Phase 2 | `progressSchema` has no note field; zod would strip silently | ✅ Good (documented) |
| D13 | Inline switch confirmation → moved to `/weeks/[id]` detail page | Phase 2 + 02-04 | Detail route satisfies WEEKS-01 literal wording; confirm reuses already-built component | ✅ Good |
| D14 | Review advance = 150ms opacity fade, no page navigation | Phase 2 | Queue state lives in client useState; loaded once | ✅ Good |
| D15 | `nextSuggested = lastReviewed + 24h` flat cadence | Phase 2 | No SRS in v1; per REQUIREMENTS.md out-of-scope | ✅ Good |
| D16 | Artifact read-status stays grayscale (not coral) | Phase 3 | Coral reserved for commit gestures; preserves metaphor | ✅ Good |
| D17 | Session-cycle is silent revert (no visible error) | Phase 3 | Single-user local tool; optimistic flip is enough | ✅ Good (noted) |
| D18 | ReflectionPrompt mirrors NoteEditor dirty-save exactly | Phase 3 | Consistency; users only learn one save pattern | ✅ Good |
| D19 | `/questions` groups open first, parked/answered below at opacity-70; no tabs | Phase 3 | Single-screen overview; filter tabs deferred post-v1 | ✅ Good |

## 6. Tech debt and deferred items

**Intentional deferrals (brief-level, not debt):**
- Claude API integration. Seam marked in `src/lib/phase.ts`.
- Flexible-phase track map. Blocked on checkpoint 3 decision.
- Bidirectional linking in notes.
- Full-text search across notes.
- Reflection aggregation view.
- Spaced-repetition algorithm for review (currently flat 24h).

**Minor findings from verification:**
- `concepts.json` has 74 concepts, not 76 as originally stated in ROADMAP success criteria. Pre-existing session-1 miscount. Functional behavior correct; docs wording mismatches reality by 2.
- Review note field is accepted by `submitReviewAction` but not persisted (schema has no `note` field). Documented with code comment. To persist, need a schema addition + writeback change.
- No error state UI for `cycleSessionStatusAction` or `toggleArtifactStatusAction` failures (silent optimistic revert only). Acceptable per UI-SPEC decision but noted as a pattern other phases deliberately did declare error copy for.
- Two human browser checks remain unautomated for phase 2: the week switch round-trip and review card advance through the full queue.

**Lessons worth keeping:**
- The `lib + action` split (pure lib fs function + `"use server"` wrapper) stayed clean across 5 different writes. Reuse it for future additions.
- Optimistic append + revert is the right default for single-user writes. Only surface error copy when the user can't recover without knowing (e.g., `/questions` status actions where revert looks like nothing happened).
- UI-SPEC-first review loops caught many issues before planning. 3 checker iterations on Phase 2 UI-SPEC, 2 on Phase 3. Each iteration was cheap; planning on top of an approved spec was fast.
- The Phase 1 UI-SPEC established the coral-reserved-for list; every subsequent phase extended it explicitly. No coral creep.

## 7. Getting started

**Run the project:**
```bash
cd /Users/euge/Desktop/curriculum-app
pnpm dev
# open http://localhost:3000
```

**Key directories:**
- `src/app/` — routes (`/`, `/concepts`, `/concepts/[slug]`, `/weeks`, `/weeks/[id]`, `/review`, `/questions`)
- `src/components/` — Shell, SideNav, WeekView, WeekHeader, SessionCard, ArtifactChip, ConceptIndex, ConceptHeader, ArtifactList, RelatedConceptsList, ReviewCard, ReviewQueue, NoteEditor, ReflectionPrompt, OpenQuestionCapture, WeekRow, WeeksList, WeekSwitchConfirm, QuestionsQueue, QuestionItem, ConceptQuestionGroup, ReviewStub, ComingSoon
- `src/lib/` — types.ts, schemas.ts (zod), paths.ts, phase.ts, data.ts, notes.ts, progress.ts, reflections.ts, artifacts.ts, review.ts, actions/
- `curriculum/` — per-module markdown (`mod-0.md` to `mod-10.md`, `int-1.md` to `int-4.md`), spine.json, concepts.json, artifacts.json
- `notes/` — runtime output: `<concept-slug>.md` and `reflections/week-<id>.md`
- `progress.json` — mutable state (currentWeek, weeks, openQuestions, reviews)
- `.planning/` — GSD planning artifacts (PROJECT, REQUIREMENTS, ROADMAP, phases/)

**Commands:**
- `pnpm dev` — run on localhost:3000
- `pnpm exec tsc --noEmit` — type check
- `pnpm exec next typegen` — regenerate PageProps types for dynamic routes

**Where to look first:**
- `.planning/PROJECT.md` for scope and constraints
- `PROJECT_BRIEF.md` (on Desktop) for the original spec
- `curriculum.md` (on Desktop) for the source curriculum content
- `src/lib/data.ts` for read patterns
- `src/lib/actions/save-note.ts` for a canonical server action template
- Phase UI-SPECs in `.planning/phases/NN-*/NN-UI-SPEC.md` for locked design contracts

---

## Stats

- **Timeline:** 2026-04-19 (session 1) → 2026-04-20 (Phase 3 complete). ~2 calendar days of focused build.
- **Phases:** 3 complete of 4 planned (Phase 4 intentionally blocked).
- **Plans executed:** 11 + 1 gap closure.
- **Commits:** 55 atomic commits on the branch (session-1 scaffold + 3 phases of plan/spec/code/verify commits).
- **Files changed since initial commit:** 120 files, +13,416 insertions, -95 deletions (most of the repo is greenfield).
- **Contributors:** eugenia (solo).
