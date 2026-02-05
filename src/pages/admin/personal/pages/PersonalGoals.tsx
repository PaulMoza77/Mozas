import { useMemo, useState } from "react";
import { Target, CheckCircle2 } from "lucide-react";
import { SectionCard } from "../components/SectionCard";

type Goal = {
  id: string;
  title: string;
  desc?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // "€" / "kg" / "bookings" etc
};

function pct(cur: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((cur / target) * 100)));
}

export function PersonalGoals() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", title: "Savings buffer", desc: "Țintă cash buffer", targetValue: 5000, currentValue: 1500, unit: "€" },
    { id: "g2", title: "Weight", desc: "Țintă greutate", targetValue: 115, currentValue: 122, unit: "kg" },
    { id: "g3", title: "Monthly bookings", desc: "Volocar target", targetValue: 300, currentValue: 120, unit: "bookings" },
  ]);

  const doneCount = useMemo(
    () => goals.filter((g) => g.currentValue >= g.targetValue).length,
    [goals]
  );

  return (
    <div className="space-y-4">
      <SectionCard
        title="Goals"
        subtitle={`Completed: ${doneCount}/${goals.length}`}
        right={
          <button
            type="button"
            onClick={() => {
              // mock: increment first goal a bit
              setGoals((prev) =>
                prev.map((g, i) => (i === 0 ? { ...g, currentValue: g.currentValue + 250 } : g))
              );
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            <Target className="h-4 w-4" />
            Quick progress
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const progress = pct(g.currentValue, g.targetValue);
            const done = g.currentValue >= g.targetValue;

            return (
              <div key={g.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold tracking-tight">{g.title}</div>
                    {g.desc ? <div className="mt-1 text-sm text-slate-600">{g.desc}</div> : null}
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-xl bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {progress}%
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {g.currentValue} {g.unit} / {g.targetValue} {g.unit}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Mock. Următorul pas: DB table `personal_goals` + editor modal.
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
