export function money(n: number, cur: string) {
  const v = Number(n || 0);
  const c = (cur || "EUR").toUpperCase();
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${c}`;
}

export function percent(part: number, total: number) {
  const p = Number(part || 0);
  const t = Number(total || 0);
  if (!t || t <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((p / t) * 100)));
}
