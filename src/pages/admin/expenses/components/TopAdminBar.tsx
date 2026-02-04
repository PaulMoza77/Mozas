// src/pages/admin/expenses/components/TopAdminBar.tsx
import { NavLink } from "react-router-dom";
import type { PeriodKey } from "../types";
import { PERIODS } from "../constants";
import { clsx } from "../utils";

export function TopAdminBar({
  period,
  setPeriod,
}: {
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
}) {
  const linkBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold border";
  const active = "bg-slate-900 text-white border-slate-900";
  const inactive = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-start lg:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Admin
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Expenses</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={clsx(
                  "rounded-2xl px-3 py-2 text-sm font-semibold border",
                  period === p.key ? active : inactive
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <NavLink to="/admin" className={({ isActive }) => clsx(linkBase, isActive ? active : inactive)} end>
            Overview
          </NavLink>
          <NavLink to="/admin/brands" className={({ isActive }) => clsx(linkBase, isActive ? active : inactive)}>
            Brands
          </NavLink>
          <NavLink to="/admin/expenses" className={({ isActive }) => clsx(linkBase, isActive ? active : inactive)}>
            Expenses
          </NavLink>
        </div>
      </div>
    </div>
  );
}
