import Link from "next/link";
import type { Concept } from "@/lib/types";

export function RelatedConceptsList({ concepts }: { concepts: Concept[] }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Related concepts
      </p>
      {concepts.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No related concepts.</p>
      ) : (
        <div className="flex flex-col">
          {concepts.map((c) => (
            <Link
              key={c.id}
              href={`/concepts/${c.slug}`}
              className="block py-0.5 text-[13px] text-foreground transition-colors duration-150 ease-out hover:text-foreground/70"
            >
              {c.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
