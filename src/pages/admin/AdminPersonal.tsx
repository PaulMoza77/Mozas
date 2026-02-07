import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

import { PersonalTopMenu, type PersonalTabKey } from "./personal/components/PersonalTopMenu";
import { PersonalFinancials } from "./personal/pages/PersonalFinancials";
import { PersonalGarage } from "./personal/pages/PersonalGarage";
import { PersonalGoals } from "./personal/pages/PersonalGoals";

/** ===== Period model shared across tabs (for now: used by Financials) ===== */
export type PeriodPreset = "this_month" | "last_30" | "custom" | "all";
export type PeriodState = { preset: PeriodPreset; fromISO: string | null; toISO: string | null };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function PeriodPicker(props: { value: PeriodState; onChange: (v: PeriodState) => void }) {
  const { value, onChange } = props;
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (value.preset === "all") return "All time";
    if (value.preset === "this_month") return "This month";
    if (value.preset === "last_30") return "Last 30 days";
    if (value.fromISO && value.toISO) return `${value.fromISO} → ${value.toISO}`;
    if (value.fromISO) return `From ${value.fromISO}`;
    if (value.toISO) return `Until ${value.toISO}`;
    return "Custom range";
  }, [value]);

  function applyPreset(p: PeriodPreset) {
    const now = new Date();
    if (p === "all") {
      onChange({ preset: "all", fromISO: null, toISO: null });
      return;
    }
    if (p === "this_month") {
      onChange({ preset: "this_month", fromISO: toISODate(startOfMonth(now)), toISO: toISODate(endOfMonth(now)) });
      return;
    }
    if (p === "last_30") {
      onChange({ preset: "last_30", fromISO: toISODate(addDays(now, -29)), toISO: toISODate(now) });
      return;
    }
    onChange({ preset: "custom", fromISO: value.fromISO, toISO: value.toISO });
  }

  const inputBase =
    "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 shadow-sm"
      >
        <CalendarDays className="h-4 w-4" />
        <span className="max-w-[220px] truncate">{label}</span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="p-4">
            <div className="text-xs font-semibold tracking-wide text-slate-500">PERIOD</div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset("this_month")}
                className={clsx(
                  "rounded-2xl border px-3 py-2 text-sm font-semibold",
                  value.preset === "this_month"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                This month
              </button>
              <button
                type="button"
                onClick={() => applyPreset("last_30")}
                className={clsx(
                  "rounded-2xl border px-3 py-2 text-sm font-semibold",
                  value.preset === "last_30"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                Last 30
              </button>
              <button
                type="button"
                onClick={() => applyPreset("all")}
                className={clsx(
                  "rounded-2xl border px-3 py-2 text-sm font-semibold",
                  value.preset === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"
                )}
              >
                All
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold tracking-wide text-slate-500">CUSTOM</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-600">
                  From
                  <input
                    className={clsx(inputBase, "mt-1")}
                    type="date"
                    value={value.fromISO ?? ""}
                    onChange={(e) => onChange({ preset: "custom", fromISO: e.target.value || null, toISO: value.toISO })}
                  />
                </label>
                <label className="text-xs text-slate-600">
                  To
                  <input
                    className={clsx(inputBase, "mt-1")}
                    type="date"
                    value={value.toISO ?? ""}
                    onChange={(e) => onChange({ preset: "custom", fromISO: value.fromISO, toISO: e.target.value || null })}
                  />
                </label>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminPersonal() {
  const [tab, setTab] = useState<PersonalTabKey>("financials");

  // ✅ shared period (used in Financials; later you can reuse for Garage/Goals)
  const [period, setPeriod] = useState<PeriodState>(() => {
    const now = new Date();
    return { preset: "this_month", fromISO: toISODate(startOfMonth(now)), toISO: toISODate(endOfMonth(now)) };
  });

  const title = useMemo(() => {
    if (tab === "financials") return "Personal · Financials";
    if (tab === "garage") return "Personal · Garage";
    return "Personal · Goals";
  }, [tab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400">ADMIN</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Overview personal: Income, Expenses, Savings, Investments + Garage + Goals.
            </p>
          </div>

          {/* ✅ Replaces “Acțiuni rapide...” badge */}
          <div className="flex items-center justify-start sm:justify-end">
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>
        </div>

        {/* Top tabs */}
        <PersonalTopMenu value={tab} onChange={setTab} />

        {/* Content */}
        <div className="mt-5">
          {tab === "financials" && <PersonalFinancials period={period} />}
          {tab === "garage" && <PersonalGarage />}
          {tab === "goals" && <PersonalGoals />}
        </div>
      </div>
    </div>
  );
}
