// src/pages/admin/expenses/components/CategorySection.tsx

import { AlertTriangle } from "lucide-react";
import type { CatCardMetric } from "../types";
import { clsx, formatAgg } from "../utils";
import { CategoryCard } from "./CategoryCard";

export function CategorySection(props: {
  selectedBrandLabel: string;
  selectedCategoryLabel: string;
  urgentOnly: boolean;

  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  toggleCategory: (c: string) => void;

  categoryOptions: string[];

  topCategories: Array<{
    category: string;
    sumByCur: Record<string, number>;
    count: number;
    totalNumeric: number;
  }>;

  catMetric: CatCardMetric;
  setCatMetric: (m: CatCardMetric) => void;
}) {
  const {
    selectedBrandLabel,
    selectedCategoryLabel,
    urgentOnly,
    categoryFilter,
    setCategoryFilter,
    toggleCategory,
    categoryOptions,
    topCategories,
    catMetric,
    setCatMetric,
  } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Categories
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Filtrate după: <span className="font-semibold">{selectedBrandLabel}</span>
            {" · "}
            <span className="font-semibold">{selectedCategoryLabel}</span>
            {urgentOnly ? (
              <>
                {" · "}
                <span className="font-semibold text-rose-700 inline-flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Urgent only
                </span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={clsx(
            "rounded-2xl px-3 py-2 text-sm font-semibold border",
            categoryFilter === "all"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          )}
        >
          All categories
        </button>

        {categoryOptions.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => toggleCategory(c)}
            className={clsx(
              "rounded-2xl px-3 py-2 text-sm font-semibold border",
              categoryFilter === c
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topCategories.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No categories in this selection.
          </div>
        ) : (
          topCategories.map((c) => {
            const active = categoryFilter === c.category;
            const valueText =
              catMetric === "count" ? `${c.count} tranzacții` : formatAgg(c.sumByCur);

            return (
              <CategoryCard
                key={c.category}
                title={c.category}
                valueText={valueText}
                isActive={active}
                onClick={() => toggleCategory(c.category)}
                metric={catMetric}
                onMetricChange={setCatMetric}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
