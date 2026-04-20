import type { Concept } from "@/lib/types";

export function ConceptHeader({ concept }: { concept: Concept }) {
  return (
    <div className="mb-8">
      <h1 className="text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-foreground">
        {concept.title}
      </h1>
      <p className="mt-1 text-[15px] leading-[1.7] text-muted-foreground">{concept.oneLiner}</p>
    </div>
  );
}
