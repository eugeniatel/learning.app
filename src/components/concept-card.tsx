import Link from "next/link";
import type { Concept } from "@/lib/types";

export function ConceptCard({ concept }: { concept: Concept }) {
  return (
    <Link
      href={`/concepts/${concept.slug}`}
      className="block w-full rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 ease-out hover:bg-muted"
    >
      <p className="text-[15px] font-medium text-foreground">{concept.title}</p>
      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{concept.oneLiner}</p>
    </Link>
  );
}
