import React from "react";

import RevenueTable from "./admin/revenues/components/RevenueTable";
import ImportXlsxButton from "./admin/revenues/components/ImportXlsxButton";
import AddRevenueModal from "./admin/revenues/components/AddRevenueModal";
import MonthSummaryCard from "./admin/revenues/components/MonthSummaryCard";

import type { Revenue } from "./admin/revenues/types";
import { fetchRevenues, addRevenue } from "./admin/revenues/api";
import { parseRevenuesXlsx } from "../lib/parseRevenuesXlsx";

type PeriodKey = "today" | "7d" | "30d" | "custom" | "all";

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inRange(dateISO: string, from?: string, to?: string) {
  if (!dateISO) return false;
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}

export default function Revenues() {
  const [revenues, setRevenues] = React.useState<Revenue[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [modalOpen, setModalOpen] = React.useState(false);

  // Period pills
  const [period, setPeriod] = React.useState<PeriodKey>("30d");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  // Filters
  const [q, setQ] = React.useState("");
  const [brand, setBrand] = React.useState<string>("all");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const rev = await fetchRevenues();
      setRevenues(rev);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const range = React.useMemo(() => {
    const now = new Date();

    if (period === "all") return { from: undefined as string | undefined, to: undefined as string | undefined };
    if (period === "today") {
      const t = iso(now);
      return { from: t, to: t };
    }
    if (period === "7d") {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: iso(from), to: iso(now) };
    }
    if (period === "30d") {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from: iso(from), to: iso(now) };
    }
    // custom
    return { from: customFrom || undefined, to: customTo || undefined };
  }, [period, customFrom, customTo]);

  const brands = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of revenues) if (r.brand) set.add(r.brand);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [revenues]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();

    return revenues.filter((r) => {
      if (range.from || range.to) {
        if (!inRange(r.date, range.from, range.to)) return false;
      }

      if (brand !== "all" && r.brand !== brand) return false;

      if (qq) {
        const hay = `${r.description ?? ""} ${r.market ?? ""} ${r.brand ?? ""} ${r.amount ?? ""} ${r.date ?? ""}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }

      return true;
    });
  }, [revenues, range.from, range.to, brand, q]);

  // Monthly cards (gross only) grouped by YYYY-MM + market(currency)
  const months = React.useMemo(() => {
    const map = new Map<string, { gross: number; currency: string }>();

    for (const r of filtered) {
      const month = r.date?.slice(0, 7) || "";
      if (!month) continue;

      const cur = String(r.market || "RON").toUpperCase();
      const key = `${month}-${cur}`;

      const prev = map.get(key) ?? { gross: 0, currency: cur };
      prev.gross += Number(r.amount) || 0;
      map.set(key, prev);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([k, v]) => ({
        month: k.slice(0, 7),
        currency: v.currency,
        totalGross: v.gross,
      }));
  }, [filtered]);

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const parsed = await parseRevenuesXlsx(file); // amount,date,market,brand,description
      const added: Revenue[] = [];

      for (const rev of parsed) {
        const newRev = await addRevenue(rev);
        if (newRev) added.push(newRev);
      }

      if (added.length) setRevenues((prev) => [...added, ...prev]);
    } catch (err: any) {
      alert("Eroare la import: " + String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: Omit<Revenue, "id">) => {
    setLoading(true);
    try {
      const newRev = await addRevenue(data);
      if (newRev) setRevenues((prev) => [newRev, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header (like Expenses) */}
      <div className="rounded-2xl border bg-white p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs tracking-widest text-slate-400 font-semibold">PERIOD</div>
          <div className="text-2xl font-semibold text-slate-900">Încasări</div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`px-3 py-2 rounded-full border text-sm ${period === "today" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
            onClick={() => setPeriod("today")}
          >
            Today
          </button>
          <button
            className={`px-3 py-2 rounded-full border text-sm ${period === "7d" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
            onClick={() => setPeriod("7d")}
          >
            Last 7 days
          </button>
          <button
            className={`px-3 py-2 rounded-full border text-sm ${period === "30d" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
            onClick={() => setPeriod("30d")}
          >
            Last 30 days
          </button>
          <button
            className={`px-3 py-2 rounded-full border text-sm ${period === "custom" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
            onClick={() => setPeriod("custom")}
          >
            Custom
          </button>
          <button
            className={`px-3 py-2 rounded-full border text-sm ${period === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
            onClick={() => setPeriod("all")}
          >
            All time
          </button>
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-2 w-full">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-10 rounded-md border px-3 text-sm"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-10 rounded-md border px-3 text-sm"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 flex-wrap">
        <ImportXlsxButton onImport={handleImport} />
        <button
          className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => setModalOpen(true)}
        >
          + New revenue
        </button>
      </div>

      {/* Monthly cards */}
      <div className="mt-6 rounded-2xl border bg-white p-5">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {months.length === 0 ? (
            <div className="text-slate-400">Nicio încasare în perioada selectată.</div>
          ) : (
            months.map((m) => (
              <MonthSummaryCard key={m.month + m.currency} {...m} />
            ))
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-6 rounded-2xl border bg-white p-5">
        <div className="text-xs tracking-widest text-slate-400 font-semibold">TRANSACTIONS</div>
        <div className="text-xl font-semibold mt-1">All revenues</div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <input
            className="h-10 rounded-md border px-3 text-sm w-full max-w-md"
            placeholder="Search description, market, brand..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-slate-500">
            {loading ? "Se încarcă..." : `${filtered.length} items`}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-10 text-center text-slate-400">Se încarcă...</div>
          ) : (
            <RevenueTable revenues={filtered} />
          )}
        </div>
      </div>

      <AddRevenueModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}