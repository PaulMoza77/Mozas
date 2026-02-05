import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PersonalTopMenu, type PersonalTabKey } from "./personal/components/PersonalTopMenu";
import { PersonalFinancials } from "./personal/pages/PersonalFinancials";
import { PersonalGarage } from "./personal/pages/PersonalGarage";
import { PersonalGoals } from "./personal/pages/PersonalGoals";

export default function AdminPersonal() {
  const [tab, setTab] = useState<PersonalTabKey>("financials");

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

          {/* Action hint (tab-specific buttons sunt în paginile tab-urilor) */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              <Plus className="h-4 w-4" />
              Acțiuni rapide sunt în fiecare tab
            </div>
          </div>
        </div>

        {/* Top tabs */}
        <PersonalTopMenu value={tab} onChange={setTab} />

        {/* Content */}
        <div className="mt-5">
          {tab === "financials" && <PersonalFinancials />}
          {tab === "garage" && <PersonalGarage />}
          {tab === "goals" && <PersonalGoals />}
        </div>
      </div>
    </div>
  );
}
