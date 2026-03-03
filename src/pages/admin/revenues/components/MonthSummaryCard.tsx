import React from "react";

interface MonthSummaryCardProps {
  month: string; // ex: 2026-03
  totalGross: number;
  totalNet: number;
  currency: string;
}

const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({ month, totalGross, totalNet, currency }) => {
  return (
    <div className="rounded-xl border bg-white shadow p-4 flex flex-col min-w-[180px]">
      <div className="text-xs text-slate-500 font-medium mb-1">{month}</div>
      <div className="text-lg font-bold text-slate-900">{totalGross.toLocaleString("ro-RO", { style: "currency", currency })}</div>
      <div className="text-xs text-slate-500 mt-1">BRUT</div>
      <div className="text-lg font-semibold text-emerald-700 mt-2">{totalNet.toLocaleString("ro-RO", { style: "currency", currency })}</div>
      <div className="text-xs text-slate-500 mt-1">NET</div>
    </div>
  );
};

export default MonthSummaryCard;
