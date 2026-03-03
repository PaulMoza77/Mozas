import React from "react";
import RevenueTable from "./admin/revenues/components/RevenueTable";
import ImportXlsxButton from "./admin/revenues/components/ImportXlsxButton";
import AddRevenueModal from "./admin/revenues/components/AddRevenueModal";
import MonthSummaryCard from "./admin/revenues/components/MonthSummaryCard";

import type { Revenue } from "./admin/revenues/types";
import { fetchRevenues, addRevenue } from "./admin/revenues/api";
import { fetchExpenses, type DbExpense } from "../lib/expensesApi";
import { parseRevenuesXlsx } from "../lib/parseRevenuesXlsx";

// import { Button } from "../../components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";

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

const Revenues: React.FC = () => {
  const [revenues, setRevenues] = React.useState<Revenue[]>([]);
  const [expenses, setExpenses] = React.useState<DbExpense[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [modalOpen, setModalOpen] = React.useState(false);

  // Period
  const [period, setPeriod] = React.useState<PeriodKey>("30d");
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");

  // Filters (Transactions)
  const [q, setQ] = React.useState("");
  const [brand, setBrand] = React.useState<string>("all");

  React.useEffect(() => {
    let alive = true;
    setLoading(true);

    Promise.all([fetchRevenues(), fetchExpenses()])
      .then(([rev, exp]) => {
        if (!alive) return;
        setRevenues(rev);
        setExpenses(exp);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

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
    return {
      from: customFrom || undefined,
      to: customTo || undefined,
    };
  }, [period, customFrom, customTo]);

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const parsed = await parseRevenuesXlsx(file);

      const added: Revenue[] = [];
      for (const rev of parsed) {
        const newRev = await addRevenue(rev);
        if (newRev) added.push(newRev);
      }

      if (added.length) setRevenues((prev) => [...added, ...prev]);
    } catch (err) {
      alert("Eroare la import: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRevenue = async (data: Omit<Revenue, "id">) => {
    setLoading(true);
    try {
      const newRev = await addRevenue(data);
      if (newRev) setRevenues((prev) => [newRev, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const brands = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of revenues) if (r.brand) set.add(r.brand);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [revenues]);

  const filteredRevenues = React.useMemo(() => {
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

  // Monthly cards (gross + net) by YYYY-MM + currency (market)
  const months = React.useMemo(() => {
    const map = new Map<string, { gross: number; net: number; currency: string }>();

    // gross from revenues
    for (const r of revenues) {
      if (range.from || range.to) {
        if (!inRange(r.date, range.from, range.to)) continue;
      }
      const month = r.date?.slice(0, 7) || "";
      const cur = String(r.market || "RON").toUpperCase(); // la tine market = currency
      const key = `${month}-${cur}`;
      const prev = map.get(key) ?? { gross: 0, net: 0, currency: cur };
      prev.gross += Number(r.amount) || 0;
      map.set(key, prev);
    }

    // start net = gross
    for (const [k, v] of map.entries()) {
      map.set(k, { ...v, net: v.gross });
    }

    // subtract expenses by month + currency
    for (const e of expenses) {
      const month = e.expense_date?.slice(0, 7) || "";
      const cur = String(e.currency || "RON").toUpperCase();
      const key = `${month}-${cur}`;

      // dacă nu există venituri în luna aia, tot arătăm card (0 brut, net negativ)
      const prev = map.get(key) ?? { gross: 0, net: 0, currency: cur };
      const amount = Number(e.amount) || 0;
      prev.net = (typeof prev.net === "number" ? prev.net : prev.gross) - amount;
      map.set(key, prev);
    }

    return Array.from(map.entries())
      .filter(([k]) => k.slice(0, 7)) // ignore empty
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([k, v]) => ({
        month: k.slice(0, 7),
        currency: v.currency,
        totalGross: v.gross,
        totalNet: v.net,
      }));
  }, [revenues, expenses, range.from, range.to]);

  return (
    <div className="p-6">
      {/* Header + Period like Expenses */}
      <div className="rounded-2xl border bg-white p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs tracking-widest text-slate-400 font-semibold">PERIOD</div>
          <div className="text-2xl font-semibold text-slate-900">Încasări</div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className={period === "today" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setPeriod("today")}>Today</button>
          <button className={period === "7d" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setPeriod("7d")}>Last 7 days</button>
          <button className={period === "30d" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setPeriod("30d")}>Last 30 days</button>
          <button className={period === "custom" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setPeriod("custom")}>Custom</button>
          <button className={period === "all" ? "btn btn-primary" : "btn btn-outline"} onClick={() => setPeriod("all")}>All time</button>
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-2 w-full">
            <input type="date" value={customFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomFrom(e.target.value)} className="input input-bordered" />
            <input type="date" value={customTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTo(e.target.value)} className="input input-bordered" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 mt-6 flex-wrap">
        <div className="flex items-center gap-3">
          <ImportXlsxButton onImport={handleImport} />
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ New revenue</button>
        </div>
      </div>

      {/* Monthly cards */}
      <div className="mt-6 rounded-2xl border bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {months.length === 0 ? (
            <div className="md:col-span-3 border rounded-xl p-4 bg-slate-50 text-sm text-slate-600">Nicio lună găsită în perioada selectată.</div>
          ) : (
            months.map((m) => (
              <MonthSummaryCard key={m.month + m.currency} {...m} />
            ))
          )}
        </div>
      </div>

      {/* Transactions (like Expenses) */}
      <div className="mt-6 rounded-2xl border bg-white p-5">
        <div className="text-xs tracking-widest text-slate-400 font-semibold">TRANSACTIONS</div>
        <div className="text-xl font-semibold mt-1">All revenues</div>
        <div className="text-sm text-slate-500 mt-1">Caută după descriere, market, brand.</div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <input
            className="max-w-md input input-bordered"
            placeholder="Search description, market, brand..."
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          />

          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={brand}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBrand(e.target.value)}
          >
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-slate-500">
            {loading ? "Se încarcă..." : `${filteredRevenues.length} items`}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-10 text-center text-slate-400">Se încarcă...</div>
          ) : (
            <RevenueTable revenues={filteredRevenues} />
          )}
        </div>
      </div>

      <AddRevenueModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddRevenue} />
    </div>
  );
};

export default Revenues;