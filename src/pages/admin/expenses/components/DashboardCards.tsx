// src/pages/admin/expenses/components/DashboardCards.tsx

import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { formatAgg } from "../utils";
import { BRAND_DISPLAY } from "../constants";

// ✅ keep order here (no need for DASH_BRANDS export in constants)
const DASH_BRANDS = ["Mozas", "Volocar", "TDG", "Brandly", "GetSureDrive", "Personal"] as const;

export function DashboardCards(props: {
  baseCount: number;
  brandFilter: string;
  urgentOnly: boolean;
  setUrgentOnly: (v: boolean | ((p: boolean) => boolean)) => void;
  toggleBrand: (b: string | "all") => void;

  // ✅ AdminExpenses passes a no-arg function
  setCategoryFilter: () => void;

  dashboardTotal: Record<string, number>;
  dashboardByBrand: Record<string, Record<string, number>>;
  urgentAgg: { count: number; sum: Record<string, number> };
}) {
  const {
    baseCount,
    brandFilter,
    urgentOnly,
    setUrgentOnly,
    toggleBrand,
    setCategoryFilter,
    dashboardTotal,
    dashboardByBrand,
    urgentAgg,
  } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8">
        {/* Total card */}
        <button
          type="button"
          onClick={() => {
            setUrgentOnly(false);
            toggleBrand("all");
          }}
          className={clsx(
            "text-left lg:col-span-2 rounded-3xl border bg-white p-4 sm:p-5 hover:bg-slate-50 transition",
            brandFilter === "all" && !urgentOnly
              ? "border-slate-900 ring-1 ring-slate-900/10"
              : "border-slate-200"
          )}
          title="Click: show all brands (for table + categories)"
        >
          <p className="text-xs font-semibold text-slate-500">Total cheltuieli</p>
          <p className="mt-2 text-lg sm:text-xl font-semibold text-slate-900">
            {formatAgg(dashboardTotal)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-700">
              {baseCount} items
            </span>

            {urgentOnly ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-rose-200 text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Urgent only
              </span>
            ) : null}
          </div>
        </button>

        {/* Urgent card */}
        <button
          type="button"
          onClick={() => {
            setCategoryFilter(); // ✅ reset category filters
            setUrgentOnly((p) => !p);
          }}
          className={clsx(
            "text-left rounded-3xl border bg-white p-4 sm:p-5 hover:bg-slate-50 transition",
            urgentOnly ? "border-rose-600 ring-1 ring-rose-600/10" : "border-slate-200"
          )}
          title="Click: filtrează doar urgente (nu afectează totalurile)"
        >
          <p className="text-xs font-semibold text-slate-500 inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Urgent
            </span>
          </p>
          <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">
            {formatAgg(urgentAgg.sum)}
          </p>
          <p className="mt-2 text-xs text-slate-500">{urgentAgg.count} items</p>
        </button>

        {DASH_BRANDS.map((b) => {
          const active = brandFilter === b;
          const label = BRAND_DISPLAY[b] || b;
          const val = formatAgg(dashboardByBrand[b] || {});

          return (
            <button
              key={b}
              type="button"
              onClick={() => {
                setUrgentOnly(false);
                toggleBrand(b);
              }}
              className={clsx(
                "text-left rounded-3xl border bg-white p-4 sm:p-5 hover:bg-slate-50 transition",
                active && !urgentOnly ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200"
              )}
              title={`Click: filter table + categories → ${label}`}
            >
              <p className="text-xs font-semibold text-slate-500">Expenses: {label}</p>
              <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">{val}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
