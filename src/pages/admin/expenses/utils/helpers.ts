// format aggregated currency values
export function formatAgg(agg: Record<string, number>): string {
  const parts = Object.entries(agg)
    .filter(([, v]) => Number.isFinite(v) && v !== 0)
    .map(([cur, v]) => `${v.toFixed(2)} ${cur}`);

  return parts.length ? parts.join(" · ") : "0";
}

export function normalizeCategory(input: string | null | undefined): string {
  return String(input ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .toLowerCase();
}

export function splitCategory(
  input: string | null | undefined
): { main: string; sub: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { main: "", sub: "" };

  const parts = raw.includes(" / ")
    ? raw.split(" / ")
    : raw.includes(" - ")
    ? raw.split(" - ")
    : [raw];

  return {
    main: parts[0]?.trim() ?? "",
    sub: parts.slice(1).join(" / ").trim(),
  };
}
