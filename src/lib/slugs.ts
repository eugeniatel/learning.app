export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  const root = slugify(base) || "item";
  let slug = root;
  let n = 2;
  while (existing.has(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}
