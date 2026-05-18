import Link from "next/link";
import { Shell } from "@/components/shell";
import { getProgress } from "@/lib/data";
import { getRebalanceSuggestions } from "@/lib/rebalance";

export default async function RebalancePage() {
  const [progress, suggestions] = await Promise.all([getProgress(), getRebalanceSuggestions()]);

  return (
    <Shell phase={progress.phase}>
      <div className="mb-8">
        <p className="text-[13px] text-muted-foreground">Deterministic planning checks</p>
        <h1 className="mt-1 text-[22px] font-medium text-foreground">Rebalance</h1>
      </div>
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion) => (
          <Link
            key={`${suggestion.title}-${suggestion.href}`}
            href={suggestion.href}
            className="rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-[180ms] ease-out hover:bg-muted/40"
          >
            <h2 className="text-[15px] font-medium text-foreground">{suggestion.title}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">{suggestion.detail}</p>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
