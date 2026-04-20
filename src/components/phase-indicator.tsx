import type { Phase } from "@/lib/types";
import { phaseDescription } from "@/lib/phase";

export function PhaseIndicator({ phase }: { phase: Phase }) {
  const label = phase === "foundational" ? "Foundational phase" : "Flexible phase";
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-sidebar-accent/60 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-block size-1.5 rounded-full bg-[var(--ring)]" aria-hidden />
        <span className="text-[13px] text-sidebar-foreground">{label}</span>
      </div>
      <p className="text-[12px] leading-snug text-muted-foreground">{phaseDescription(phase)}</p>
    </div>
  );
}
