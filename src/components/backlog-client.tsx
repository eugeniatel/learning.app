"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBacklog, setBacklog } from "@/lib/local-store";
import type { BacklogItem, Subject } from "@/lib/types";

export function BacklogClient({
  subjectId,
  subjectTitle,
  initialItems,
}: {
  subjectId: string;
  subjectTitle: string;
  subjects: Subject[];
  initialItems: BacklogItem[];
}) {
  const [items, setItems] = useState<BacklogItem[]>(initialItems);
  const [kind, setKind] = useState<BacklogItem["kind"]>("topic");
  const [text, setText] = useState("");

  useEffect(() => {
    queueMicrotask(() => setItems(getBacklog(subjectId, initialItems)));
  }, [subjectId, initialItems]);

  function save(next: BacklogItem[]) {
    setItems(next);
    setBacklog(subjectId, next);
  }

  function addItem() {
    const value = text.trim();
    if (!value) return;
    save([
      {
        id: crypto.randomUUID(),
        subjectId,
        text: value,
        kind,
        status: "open",
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);
    setText("");
  }

  return (
    <>
      <div className="mb-8 flex gap-2">
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as BacklogItem["kind"])}
          className="h-8 rounded-lg border border-input bg-background px-2 text-[13px]"
        >
          <option value="topic">Topic</option>
          <option value="resource">Resource</option>
          <option value="question">Question</option>
        </select>
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={`Add to ${subjectTitle}`}
        />
        <Button type="button" onClick={addItem}>
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">Nothing parked for this subject.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] text-muted-foreground">
                    {item.kind}, {item.status}
                  </p>
                  <p className="mt-1 text-[15px] text-foreground">{item.text}</p>
                </div>
                <select
                  value={item.status}
                  onChange={(event) => {
                    save(
                      items.map((candidate) =>
                        candidate.id === item.id
                          ? { ...candidate, status: event.target.value as BacklogItem["status"] }
                          : candidate
                      )
                    );
                  }}
                  className="h-7 rounded-md border border-input bg-background px-2 text-[12px]"
                >
                  <option value="open">Open</option>
                  <option value="parked">Parked</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
