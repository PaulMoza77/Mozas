// src/pages/admin/expenses/components/CategoryCard.tsx

import { ChevronDown } from "lucide-react";
import type { CatCardMetric } from "../types";
import { clsx } from "../utils";

export function CategoryCard({
  title,
  valueText,
  isActive,
  onClick,
  metric,
  onMetricChange,
}: {
  title: string;
  valueText: string;
  isActive: boolean;
  onClick: () => void;
  metric: CatCardMetric;
  onMetricChange: (m: CatCardMetric) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "text-left rounded-3xl border p-4 sm:p-5 bg-white hover:bg-slate-50 transition",
        isActive ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200"
      )}
      title="Click: filter category"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 truncate">{title}</p>
          <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">{valueText}</p>
        </div>

        <div className="shrink-0">
          <div className="relative">
            <select
              value={metric}
              onChange={(e) => onMetricChange(e.target.value as CatCardMetric)}
              onClick={(e) => e.stopPropagation()}
              className="appearance-none rounded-2xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Ce afișează cardurile"
            >
              <option value="sum">Sumă</option>
              <option value="count">Nr. tranz.</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </button>
  );
}
