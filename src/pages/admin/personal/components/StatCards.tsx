function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function formatMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  return `${sign}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} €`;
}

export type StatCard = {
  label: string;
  value: number;
  hint?: string;
  tone?: "default" | "good" | "bad" | "info";
};

export function StatCards(props: { items: StatCard[] }) {
  const { items } = props;

  const toneCls = (t: StatCard["tone"]) => {
    if (t === "good") return "border-emerald-200 bg-emerald-50";
    if (t === "bad") return "border-rose-200 bg-rose-50";
    if (t === "info") return "border-sky-200 bg-sky-50";
    return "border-slate-200 bg-white";
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((c, idx) => (
        <div key={idx} className={clsx("rounded-3xl border p-4 shadow-sm", toneCls(c.tone))}>
          <div className="text-[11px] font-semibold tracking-[0.28em] text-slate-500">{c.label.toUpperCase()}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(c.value)}</div>
          {c.hint ? <div className="mt-1 text-sm text-slate-600">{c.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
