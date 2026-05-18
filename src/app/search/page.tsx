import { Shell } from "@/components/shell";
import { SearchSurface } from "@/components/search-surface";
import { getProgress } from "@/lib/data";
import { getSearchIndexForCurrentSubject } from "@/lib/search";

export default async function SearchPage() {
  const [progress, items] = await Promise.all([getProgress(), getSearchIndexForCurrentSubject()]);

  return (
    <Shell phase={progress.phase}>
      <SearchSurface items={items} />
    </Shell>
  );
}
