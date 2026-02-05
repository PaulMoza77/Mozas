// src/pages/admin/expenses/utils/common.ts

export function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISOToDate(iso: string | null | undefined): Date | null {
  const s = String(iso || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;

  // noon => safe across DST edges
  return new Date(y, mo - 1, d, 12, 0, 0);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function periodRange(
  key: string,
  customFromISO?: string | null,
  customToISO?: string | null
): { start: Date | null; end: Date | null } {
  if (key === "all") return { start: null, end: null };

  const now = new Date();

  if (key === "today") return { start: startOfDay(now), end: endOfDay(now) };

  if (key === "yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return { start: startOfDay(d), end: endOfDay(d) };
  }

  if (key === "thisMonth") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: s, end: e };
  }

  if (key === "last7" || key === "last30") {
    const days = key === "last7" ? 7 : 30;
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)));
    const to = endOfDay(now);
    return { start: from, end: to };
  }

  if (key === "custom") {
    const start = customFromISO ? parseISOToDate(customFromISO) : null;
    const end = customToISO ? parseISOToDate(customToISO) : null;
    return {
      start: start ? startOfDay(start) : null,
      end: end ? endOfDay(end) : null,
    };
  }

  return { start: null, end: null };
}

export function splitCategory(input: string | null | undefined): { main: string; sub: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { main: "", sub: "" };

  const parts =
    raw.split(" / ").length > 1
      ? raw.split(" / ")
      : raw.split(" — ").length > 1
      ? raw.split(" — ")
      : raw.split(" - ").length > 1
      ? raw.split(" - ")
      : [raw];

  const main = String(parts[0] ?? "").trim();
  const sub = String(parts.slice(1).join(" / ") ?? "").trim();
  return { main, sub };
}

export function normalizeCategory(input: string | null | undefined): string {
  return String(input ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .toLowerCase();
}

export function buildCategory(main: string | null | undefined, sub: string | null | undefined): string {
  const m = String(main ?? "").trim().replace(/\s+/g, " ");
  const s = String(sub ?? "").trim().replace(/\s+/g, " ");
  if (!m || !s) return "";
  return `${m} / ${s}`;
}

export function sumByCurrency(
  rows: Array<{ amount: number | string | null | undefined; currency: string | null | undefined }>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const cur = String(r.currency || "AED").toUpperCase();
    const amt =
      typeof r.amount === "number" ? r.amount : Number(String(r.amount ?? "").replace(",", "."));
    if (!Number.isFinite(amt)) continue;
    out[cur] = (out[cur] || 0) + amt;
  }
  return out;
}

export function formatAgg(agg: Record<string, number>): string {
  const entries = Object.entries(agg || {}).filter(([, v]) => Number.isFinite(v) && v !== 0);
  if (entries.length === 0) return "—";
  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries
    .map(([cur, v]) => `${cur} ${Math.round((v + Number.EPSILON) * 100) / 100}`)
    .join(" • ");
}
