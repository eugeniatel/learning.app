# Curriculum companion app

## What This Is

A single-user, self-paced desktop-browser app that helps Eugenia study multiple deep subjects in parallel. Built as a tracker and a notebook, not a tutor: markdown on disk, a single `progress.json`, Next.js 16 + Tailwind + shadcn, visual language matching claude.ai. The first subject is LLM and AI systems; protocol risk and research writing are now first-class subjects too.

## Core Value

One place to see what Eugenia should work on this week, keep notes against concepts, and park questions for later. Readiness over speed, never gamified.

## Requirements

### Validated

- ✓ REQ-THIS-01 to REQ-THIS-04 This Week view on `/` reads real data from `curriculum/` and `progress.json`, renders week header, session cards, reflection prompt, shadcn installed. Shipped in session 1.
- ✓ REQ-CONTENT-01 Curriculum split into per-module markdown files (mod-0 to mod-10, int-1 to int-4) with zod-validated frontmatter. Shipped in session 1.
- ✓ REQ-CONTENT-02 `spine.json`, `concepts.json` (76 concepts), `artifacts.json` (~140 resources), `progress.json` with week 1 seeded. Shipped in session 1.
- ✓ REQ-DATA-01 Data layer in `src/lib/` (types, zod schemas, paths, phase seam, fs/gray-matter reads). No direct `fs` in components. Shipped in session 1.
- ✓ REQ-CONCEPT-01 to REQ-CONCEPT-02 Concept detail and index pages. Shipped in Phase 1.
- ✓ REQ-NOTES-01 Concept notes write to local markdown. Shipped in Phase 1.
- ✓ REQ-WEEKS-01 to REQ-WEEKS-02 All weeks and week switching. Shipped in Phase 2.
- ✓ REQ-REVIEW-01 Review queue. Shipped in Phase 2.
- ✓ REQ-QUESTION-01 to REQ-QUESTION-02 Question capture and queue actions. Shipped in Phases 1 and 3.
- ✓ REQ-SESSION-01, REQ-REFLECT-01, REQ-ARTIFACT-01 Writeback actions. Shipped in Phase 3.
- ✓ REQ-FLEX-01 Flexible map, ready-to-pull branches, and manual phase toggle. Shipped in Phase 4.

### Active

No active v1 requirements remain after Phase 4. Next work should be post-v1 polish or real-use curriculum adjustments.

### Out of Scope

- Claude API integration. v1 is passive; integration seam marked in `src/lib/phase.ts`. Unblock post-v1.
- Authentication. Single-user local tool.
- Cloud sync, multi-user, mobile, deployment. Runs on localhost only.
- Database or ORM. Markdown + `progress.json` is the entire store.
- Streaks, scores, progress bars that glorify completion speed. Violates Core Value.
- Animations beyond 250ms ease-out transitions. Visual rule.
- More than two font weights (400, 500). Visual rule.
- Emoji-based icon system. Use Lucide.

## Context

- Desktop-only, 1024px+ viewport. Eugenia uses a laptop for study sessions.
- claude.ai aesthetic is the visual reference: near-white paper bg (`#FAF9F5`), coral accent (`#D97757`) used sparingly, sentence case, generous spacing, 0.5px borders, no shadows.
- Session-based development rhythm. PROJECT_BRIEF.md at `/Users/euge/Desktop/PROJECT_BRIEF.md` defined sessions 1 to 5+. Session 1 shipped; this GSD init covers session 2+.
- The source curriculum doc at `/Users/euge/Desktop/curriculum.md` has already been split into per-module markdown files in `curriculum/`. Do not re-split.
- `progress.json` is the single source of truth for mutable state. All write actions must go through it.

## Constraints

- **Tech stack**: Next.js 16 (App Router, TypeScript, Turbopack), Tailwind v4, shadcn/ui (base-nova preset), gray-matter, zod, lucide-react, Inter via next/font. Locked in session 1. No additions without justification.
- **Data I/O**: `fs/promises` + `gray-matter` only. No database, no ORM, no server-side API routes beyond what Next.js provides natively.
- **Styling**: Two font weights (400, 500). Sentence case everywhere. No em dashes in UI copy. No shadows. 150 to 250ms ease-out transitions.
- **Components**: Under 200 lines each. Logic in `src/lib/`, not components. No global state library (no Redux, Zustand). Server Components + props.
- **Platform**: Desktop browser only (1024px+). No mobile, no deploy. `pnpm dev` on localhost:3000.
- **Data reads**: Through `src/lib/data.ts` only. No direct `fs` in components.
- **Frontmatter schema changes**: Update zod schema first in `src/lib/schemas.ts`, then the markdown.
- **No gamification**: No streaks, scores, leaderboards, completion-speed progress bars.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 App Router + shadcn (base-nova preset) | Matches claude.ai's stack and visual vocabulary closest, best typed DX | ✓ Good, shipped session 1 |
| ESLint over Biome | Next.js default, fewer config surprises with v16 | ✓ Good |
| Coarse GSD granularity | Brief explicitly maps sessions 2 to 5+ as phase units; coarse aligns | — Pending |
| Skip GSD research step | PROJECT_BRIEF.md is thorough; single-user Next.js tracker has no domain to research | — Pending |
| Skip codebase map | Session 1 codebase is under 30 files and fully known | — Pending |
| Manual checkpoint 3 trigger | User accepted manual toggle, on This Week, one-click, bidirectional | ✓ Shipped Phase 4 |
| No Claude API in v1 | Brief mandates passive tracker; integration seam marked in `src/lib/phase.ts` | — Pending |
| progress.json as single state source | Survives app breakage, opens in Obsidian, no DB required | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check, still the right priority?
3. Audit Out of Scope, reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-16 after Phase 4 completion*
