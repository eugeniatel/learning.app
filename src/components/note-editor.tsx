"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getNote, setNote } from "@/lib/local-store";

type Status = "idle" | "saving" | "saved" | "error";

export function NoteEditor({
  slug,
  conceptId,
  initialBody,
}: {
  slug: string;
  conceptId: string;
  initialBody: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [savedBody, setSavedBody] = useState(initialBody);
  const [status, setStatus] = useState<Status>("idle");

  const dirty = body !== savedBody;

  useEffect(() => {
    queueMicrotask(() => {
      const localBody = getNote(slug, initialBody);
      setBody(localBody);
      setSavedBody(localBody);
    });
  }, [slug, initialBody]);

  function handleSave() {
    setStatus("saving");
    setNote(slug, body);
    setSavedBody(body);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        Notes
      </p>
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          void conceptId;
          if (status === "error") setStatus("idle");
        }}
        placeholder="Write notes about this concept..."
        className="min-h-[160px] resize-y bg-card text-[15px] leading-[1.7] font-normal"
      />
      {status === "error" && (
        <p className="mt-1.5 text-[13px] text-destructive">Could not save. Try again.</p>
      )}
      <div className="mt-2 flex justify-end">
        <Button
          variant={dirty && status !== "saved" ? "default" : "outline"}
          size="sm"
          onClick={handleSave}
          disabled={status === "saving"}
          className="transition-opacity duration-[180ms] ease-out"
        >
          {status === "saved" ? "Saved" : "Save note"}
        </Button>
      </div>
    </div>
  );
}
