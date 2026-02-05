// src/pages/admin/expenses/components/CategorySection.tsx
import { AlertTriangle } from "lucide-react";
import type { CatCardMetric } from "../types";
import clsx from "clsx";
import { formatAgg } from "../utils";
import { CategoryCard } from "./CategoryCard";

type BaseCat = "Operational" | "Marketing" | "Employees" | "Miscellaneous";

export function CategorySection(props: {
  selectedBrandLabel: string;
  selectedCategoryLabel: string;
  urgentOnly: boolean;

  catMetric: CatCardMetric;
  setCatMetric: (m: CatCardMetric) => void;

  availableBaseCats: BaseCat[];
  baseCategory: BaseCat | "all";
  setBaseCategory: (v: BaseCat | "all") => void;

  availableSubCats: string[];
  subCategory: string | "all";
  setSubCategory: (v: string | "all") => void;

  subCards: Array<{
    sub: string;
    sumByCur: Record<string, number>;
    count: number;
    totalNumeric: number;
  }>;
}) {
  const {
    selectedBrandLabel,
    selectedCategoryLabel,
    urgentOnly,
    catMetric,
    setCatMetric,
    availableBaseCats,
    baseCategory,
    setBaseCategory,
    availableSubCats,
    subCategory,
    setSubCategory,
    subCards,
  } = props;

  const baseButtons: Array<{ key: BaseCat; label: string }> = [
    { key: "Operational", label: "Operational" },
    { key: "Marketing", label: "Marketing" },
    { key: "Employees", label: "Employees" },
    { key: "Miscellaneous", label: "Miscellaneous" },
  ];

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

      {/* BASE CATEGORIES */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setBaseCategory("all")}
          className={clsx(
            "rounded-2xl px-3 py-2 text-sm font-semibold border",
            baseCategory === "all"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          )}
        >
          All categories
        </button>

        {baseButtons
          .filter((b) => availableBaseCats.includes(b.key))
          .map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBaseCategory(b.key)}
              className={clsx(
                "rounded-2xl px-3 py-2 text-sm font-semibold border",
                baseCategory === b.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              {b.label}
            </button>
          ))}
      </div>

      {/* SUBCATEGORIES (only when base selected) */}
      {baseCategory !== "all" ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 mb-2">
            SUBCATEGORIES
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubCategory("all")}
              className={clsx(
                "rounded-2xl px-3 py-2 text-sm font-semibold border",
                subCategory === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              All subcategories
            </button>

            {availableSubCats.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubCategory(subCategory === s ? "all" : s)}
                className={clsx(
                  "rounded-2xl px-3 py-2 text-sm font-semibold border",
                  subCategory === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* SUBCATEGORY CARDS */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {baseCategory === "all" ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Select a base category to see subcategories.
          </div>
        ) : subCards.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No subcategories in this selection.
          </div>
        ) : (
          subCards.map((c) => {
            const active = subCategory === c.sub;
            const valueText =
              catMetric === "count" ? `${c.count} tranzacții` : formatAgg(c.sumByCur);

            return (
              <CategoryCard
                key={c.sub}
                title={c.sub}
                valueText={valueText}
                isActive={active}
                onClick={() => setSubCategory(active ? "all" : c.sub)}
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
