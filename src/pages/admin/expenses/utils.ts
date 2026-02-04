// src/pages/admin/expenses/utils.ts
import type { DbExpense, PeriodKey } from "./types";
import { BRAND_DISPLAY } from "./constants";

export function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function parseISOToDate(iso?: string | null) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0.00";
  return v.toFixed(2);
}

export function formatAgg(agg: Record<string, number>) {
  const entries = Object.entries(agg).filter(([, v]) => Number.isFinite(v) && v !== 0);
  if (entries.length === 0) return "—";
  return entries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cur, v]) => `${cur} ${money(v)}`)
    .join(" · ");
}

export function sumByCurrency(rows: DbExpense[]) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const cur = (r.currency || "AED").toUpperCase();
    const amt = Number(r.amount);
    if (!Number.isFinite(amt)) continue;
    out[cur] = (out[cur] || 0) + amt;
  }
  return out;
}

export function normalizeCategory(s: any) {
  return String(s ?? "").trim();
}

export function getBrandDisplay(brand: string) {
  return BRAND_DISPLAY[brand] || brand || "—";
}

export function periodStart(key: PeriodKey) {
  if (key === "all") return null;

  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const start = new Date(end);

  if (key === "day") start.setDate(end.getDate());
  if (key === "week") start.setDate(end.getDate() - 6);
  if (key === "month") start.setDate(end.getDate() - 29);
  if (key === "qtr") start.setDate(end.getDate() - 89);
  if (key === "year") start.setDate(end.getDate() - 364);

  start.setHours(0, 0, 0, 0);
  return start;
}

export function splitCategory(cat: string): { main: string; sub: string } {
  const raw = normalizeCategory(cat);
  if (!raw) return { main: "", sub: "" };

  const parts = raw.split(" / ").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { main: parts[0], sub: parts.slice(1).join(" / ") };

  const m1 = raw.split("/").map((x) => x.trim()).filter(Boolean);
  if (m1.length >= 2) return { main: m1[0], sub: m1.slice(1).join(" / ") };

  const m2 = raw.split(" - ").map((x) => x.trim()).filter(Boolean);
  if (m2.length >= 2) return { main: m2[0], sub: m2.slice(1).join(" / ") };

  return { main: raw, sub: "" };
}

export function buildCategory(main: string, sub: string) {
  const m = String(main || "").trim();
  const s = String(sub || "").trim();
  if (!m || !s) return "";
  return `${m} / ${s}`;
}
