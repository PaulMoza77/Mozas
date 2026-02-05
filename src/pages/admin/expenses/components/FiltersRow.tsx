// src/pages/admin/expenses/components/FiltersRow.tsx

import { Search, X } from "lucide-react";
import type { StatusFilter } from "../types";
import { BRAND_OPTIONS, STATUS_META } from "../constants";

// ✅ no need for STATUS_OPTIONS export; derive it safely here
const STATUS_OPTIONS: Array<StatusFilter> = ["all", ...Object.keys(STATUS_META)] as Array<StatusFilter>;

export function FiltersRow(props: {
  q: string;
  setQ: (v: string) => void;

  brandFilter: string;
  setBrandFilter: (v: string) => void;

  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;

  onBrandChange?: (brand: string) => void;
}) {
  const { q, setQ, brandFilter, setBrandFilter, statusFilter, setStatusFilter, onBrandChange } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Transactions
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">All expenses</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add manual expenses or upload a receipt. (AI parsing next step.)
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_220px_220px]">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vendor, note, brand…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <select
          value={brandFilter}
          onChange={(e) => {
            const v = e.target.value;
            setBrandFilter(v);
            onBrandChange?.(v);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          title="Brand filter"
        >
          <option value="all">All brands</option>
          {BRAND_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          title="Status filter"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
