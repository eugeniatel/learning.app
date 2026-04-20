export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="pt-4">
      <h2 className="text-[22px] font-medium tracking-tight">{title}</h2>
      <p className="mt-3 max-w-prose text-[14px] text-muted-foreground">
        {note ?? "Coming in a later session. v1 ships the This Week view first."}
      </p>
    </div>
  );
}
