import { Wallet, Car, Target } from "lucide-react";

export type PersonalTabKey = "financials" | "garage" | "goals";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function PersonalTopMenu(props: { value: PersonalTabKey; onChange: (v: PersonalTabKey) => void }) {
  const { value, onChange } = props;

  const items: Array<{ key: PersonalTabKey; label: string; icon: React.ReactNode; desc: string }> = [
    { key: "financials", label: "Financials", icon: <Wallet className="h-4 w-4" />, desc: "Income, Expenses, Savings, Investments" },
    { key: "garage", label: "Garage", icon: <Car className="h-4 w-4" />, desc: "Cars + KPI per car" },
    { key: "goals", label: "Goals", icon: <Target className="h-4 w-4" />, desc: "Ținte & progres" },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map((it) => {
          const active = value === it.key;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onChange(it.key)}
              className={clsx(
                "group rounded-2xl px-4 py-3 text-left transition",
                active ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50 text-slate-900"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={clsx("inline-flex h-8 w-8 items-center justify-center rounded-xl",
                  active ? "bg-white/10" : "bg-slate-100 group-hover:bg-slate-200"
                )}>
                  {it.icon}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold">{it.label}</div>
                  <div className={clsx("mt-0.5 text-xs truncate",
                    active ? "text-white/70" : "text-slate-500"
                  )}>
                    {it.desc}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
