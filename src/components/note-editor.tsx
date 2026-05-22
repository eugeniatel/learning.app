"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getNote, setNote } from "@/lib/local-store";

type Status = "idle" | "saved";

export function NoteEditor({ artifactId }: { artifactId: string }) {
  const [body, setBody] = useState("");
  const [savedBody, setSavedBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const dirty = body !== savedBody;

  useEffect(() => {
    queueMicrotask(() => {
      const stored = getNote(artifactId, "");
      setBody(stored);
      setSavedBody(stored);
    });
  }, [artifactId]);

  function handleSave() {
    setNote(artifactId, body);
    setSavedBody(body);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write notes about this resource..."
        className="min-h-[140px] resize-y bg-card text-[15px] leading-[1.7] font-normal"
      />
      <div className="mt-2 flex justify-end">
        <Button
          variant={dirty && status !== "saved" ? "default" : "outline"}
          size="sm"
          onClick={handleSave}
          className="transition-opacity duration-[180ms] ease-out"
        >
          {status === "saved" ? "Saved" : "Save note"}
        </Button>
      </div>
    </div>
  );
}
