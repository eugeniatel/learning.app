# 04-01 Summary: Flexible Map and Manual Phase Toggle

## Result

Phase 4 is implemented. `/flexible-map` renders the flexible main spine, interpretability rail, seeded branch modules, node state, and ready-to-pull cards. This Week now has a manual bidirectional phase toggle that writes to `progress.json.phase`.

## Files Changed

- `src/app/flexible-map/page.tsx`
- `src/components/flexible-map.tsx`
- `src/components/phase-toggle.tsx`
- `src/components/side-nav.tsx`
- `src/components/week-view.tsx`
- `src/lib/actions/set-phase.ts`
- `src/lib/data.ts`
- `src/lib/progress.ts`
- `src/lib/schemas.ts`
- `src/lib/types.ts`
- `curriculum/branch-agents.md`
- `curriculum/branch-evals.md`
- `curriculum/branch-efficiency.md`
- `curriculum/spine.json`
- `progress.json`

## Notes

The weekly schedule now includes 15 core weeks from the existing foundational and flexible spine. Branches remain optional and are surfaced through the map rather than forced into the week list.
