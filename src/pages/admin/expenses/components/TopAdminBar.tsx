// src/pages/admin/expenses/components/TopAdminBar.tsx
import type { PeriodKey } from "../types";
import { PERIODS } from "../constants";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function TopAdminBar(props: {
  period: PeriodKey;
  setPeriod: (v: PeriodKey) => void;

  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
}) {
  const { period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Period</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Expenses</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key as PeriodKey)}
              className={clsx(
                "rounded-2xl px-3 py-2 text-sm font-semibold border",
                period === p.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {period === "custom" ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-500">From</p>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-500">To</p>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
