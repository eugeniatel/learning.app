"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { SearchItem } from "@/lib/search";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function scoreItem(item: SearchItem, query: string) {
  const title = normalize(item.title);
  const subtitle = normalize(item.subtitle);
  const body = normalize(item.body);
  let score = 0;
  if (title.includes(query)) score += 6;
  if (subtitle.includes(query)) score += 3;
  if (body.includes(query)) score += 1;
  return score;
}

function excerpt(body: string, query: string) {
  const clean = body.replace(/\s+/g, " ").trim();
  if (!clean) return "No note text yet.";
  const index = normalize(clean).indexOf(query);
  const start = index >= 0 ? Math.max(0, index - 70) : 0;
  const slice = clean.slice(start, start + 180);
  return `${start > 0 ? "... " : ""}${slice}${start + 180 < clean.length ? " ..." : ""}`;
}

function kindLabel(kind: SearchItem["kind"]) {
  if (kind === "artifact") return "Reading";
  if (kind === "reflection") return "Reflection";
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function SearchSurface({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const q = normalize(query);
  const results = useMemo(() => {
    if (!q) return [];
    return items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 30);
  }, [items, q]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Find material, notes, and reflections</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Search</h1>
      </div>
      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search concepts, notes, readings..."
          className="pl-9"
        />
      </div>
      {!q ? (
        <p className="text-[15px] text-muted-foreground">
          Search spans the active subject only, including module text, concept notes, readings, and week reflections.
        </p>
      ) : results.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">No results for that search.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map(({ item }) => {
            const body = excerpt(item.body, q);
            const content = (
              <div className="rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-[180ms] ease-out hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-sm">
                    {kindLabel(item.kind)}
                  </Badge>
                  <p className="truncate text-[13px] text-muted-foreground">{item.subtitle}</p>
                </div>
                <h2 className="mt-2 text-[15px] font-medium text-foreground">{item.title}</h2>
                <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{body}</p>
              </div>
            );
            if (!item.href) return <div key={item.id}>{content}</div>;
            if (item.href.startsWith("http")) {
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noreferrer">
                  {content}
                </a>
              );
            }
            return (
              <Link key={item.id} href={item.href}>
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
