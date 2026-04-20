"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveReflectionAction } from "@/lib/actions/save-reflection";

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

  async function handleSave() {
    setStatus("saving");
    try {
      await saveReflectionAction(weekId, body);
      setSavedBody(body);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
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
