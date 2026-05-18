"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getReflection, setReflection } from "@/lib/local-store";

type Status = "idle" | "saving" | "saved" | "error";

export function ReflectionPrompt({
  weekId,
  initialValue,
}: {
  weekId: string;
  initialValue: string;
}) {
  const [body, setBody] = useState(initialValue);
  const [savedBody, setSavedBody] = useState(initialValue);
  const [status, setStatus] = useState<Status>("idle");

  const dirty = body !== savedBody;

  useEffect(() => {
    queueMicrotask(() => {
      const localBody = getReflection(weekId, initialValue);
      setBody(localBody);
      setSavedBody(localBody);
    });
  }, [weekId, initialValue]);

  function handleSave() {
    setStatus("saving");
    setReflection(weekId, body);
    setSavedBody(body);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <section className="mt-10 rounded-xl bg-secondary/60 p-6">
      <h3 className="text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        End-of-week reflection
      </h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        One concept that clicked, one that did not, one question you are carrying forward.
      </p>
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder="Write freely. This stays local."
        className="mt-4 min-h-[128px] resize-y bg-background text-[15px] leading-7"
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
          {status === "saved" ? "Saved" : "Save reflection"}
        </Button>
      </div>
    </section>
  );
}
