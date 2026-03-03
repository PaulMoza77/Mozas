
interface MonthSummaryCardProps {
  month: string; // YYYY-MM
  totalGross: number;
  currency: string; // RON/EUR/AED
}

export default function MonthSummaryCard({ month, totalGross, currency }: MonthSummaryCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500 font-medium mb-1">{month}</div>
      <div className="text-lg font-bold text-slate-900">
        {totalGross.toLocaleString("ro-RO", { style: "currency", currency })}
      </div>
      <div className="text-xs text-slate-500 mt-1">BRUT</div>
    </div>
  );
}