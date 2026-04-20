"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ConceptCard } from "./concept-card";
import type { Concept, Module } from "@/lib/types";

type Group = { module: Module; concepts: Concept[] };

export function ConceptIndex({ groups }: { groups: Group[] }) {
  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();

  const filtered: Group[] = q
    ? groups
        .map((g) => ({
          ...g,
          concepts: g.concepts.filter((c) => c.title.toLowerCase().includes(q)),
        }))
        .filter((g) => g.concepts.length > 0)
    : groups;

  const totalFiltered = filtered.reduce((n, g) => n + g.concepts.length, 0);

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-foreground">
        Concepts
      </h1>
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by title..."
        className="mb-8"
      />
      {totalFiltered === 0 ? (
        <p className="mt-8 text-[15px] text-muted-foreground">No concepts match that title.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map(({ module, concepts }) => (
            <div key={module.id}>
              <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                {module.title}
              </p>
              <div className="flex flex-col gap-1">
                {concepts.map((concept) => (
                  <ConceptCard key={concept.id} concept={concept} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
