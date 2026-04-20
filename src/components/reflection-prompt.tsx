import { Textarea } from "@/components/ui/textarea";

export function ReflectionPrompt({ weekId }: { weekId: string }) {
  return (
    <section className="mt-10 rounded-xl bg-secondary/60 p-6">
      <h3 className="text-[14px] font-medium text-foreground">End-of-week reflection</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        One concept that clicked, one that did not, one question you are carrying forward.
      </p>
      <Textarea
        name={`reflection-${weekId}`}
        placeholder="Write freely. This stays local."
        className="mt-4 min-h-32 resize-y bg-background text-[14px] leading-7"
        disabled
      />
      <p className="mt-2 text-[11.5px] text-muted-foreground">
        Saving is enabled in a later session. v1 is a passive tracker.
      </p>
    </section>
  );
}
