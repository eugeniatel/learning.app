"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setSessionOverride } from "@/lib/local-store";
import type { Session } from "@/lib/types";

export function SessionEditForm({
  weekId,
  session,
  onSave,
}: {
  weekId: string;
  session: Session;
  onSave?: (patch: Partial<Session>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(session.estimatedMinutes));
  const [notes, setNotes] = useState(session.notes ?? "");

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="min-h-[44px] min-w-[44px]"
        onClick={() => setOpen(true)}
        aria-label="Edit session"
      >
        <Pencil className="size-3.5" strokeWidth={1.5} />
      </Button>
    );
  }

  return (
    <form
      className="mt-3 flex flex-col gap-2 pl-8"
      onSubmit={(event) => {
        event.preventDefault();
        const patch = {
          title: title.trim() || session.title,
          estimatedMinutes: Number(estimatedMinutes) || session.estimatedMinutes,
          notes: notes.trim() || undefined,
        };
        setSessionOverride(session.id, patch);
        onSave?.(patch);
        setOpen(false);
      }}
    >
      <input type="hidden" name="weekId" value={weekId} />
      <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <Input
        name="estimatedMinutes"
        type="number"
        min="5"
        step="5"
        value={estimatedMinutes}
        onChange={(event) => setEstimatedMinutes(event.target.value)}
      />
      <Textarea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Session notes" />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
