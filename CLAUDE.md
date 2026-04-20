@AGENTS.md

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Curriculum companion app**

A single-user, self-paced desktop-browser app that helps Eugenia execute a 9 to 14 month AI research curriculum in a homeschooling rhythm. Built as a tracker and a notebook, not a tutor: markdown on disk, a single `progress.json`, Next.js 16 + Tailwind + shadcn, visual language matching claude.ai. v1 is a passive tracker, no Claude API.

**Core Value:** One place to see what Eugenia should work on this week, keep notes against concepts, and park questions for later. Readiness over speed, never gamified.

### Constraints

- **Tech stack**: Next.js 16 (App Router, TypeScript, Turbopack), Tailwind v4, shadcn/ui (base-nova preset), gray-matter, zod, lucide-react, Inter via next/font. Locked in session 1. No additions without justification.
- **Data I/O**: `fs/promises` + `gray-matter` only. No database, no ORM, no server-side API routes beyond what Next.js provides natively.
- **Styling**: Two font weights (400, 500). Sentence case everywhere. No em dashes in UI copy. No shadows. 150 to 250ms ease-out transitions.
- **Components**: Under 200 lines each. Logic in `src/lib/`, not components. No global state library (no Redux, Zustand). Server Components + props.
- **Platform**: Desktop browser only (1024px+). No mobile, no deploy. `pnpm dev` on localhost:3000.
- **Data reads**: Through `src/lib/data.ts` only. No direct `fs` in components.
- **Frontmatter schema changes**: Update zod schema first in `src/lib/schemas.ts`, then the markdown.
- **No gamification**: No streaks, scores, leaderboards, completion-speed progress bars.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
