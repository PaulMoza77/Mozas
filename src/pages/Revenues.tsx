import React from "react";
import RevenueTable from "./admin/revenues/components/RevenueTable";
import ImportXlsxButton from "./admin/revenues/components/ImportXlsxButton";
import AddRevenueModal from "./admin/revenues/components/AddRevenueModal";
import type { Revenue } from "./admin/revenues/types";
import MonthSummaryCard from "./admin/revenues/components/MonthSummaryCard";
import { fetchRevenues, addRevenue } from "./admin/revenues/api";
import { fetchExpenses, type DbExpense } from "../lib/expensesApi";
import { parseRevenuesXlsx } from "../lib/parseRevenuesXlsx";


// Revenues are loaded from Supabase

const Revenues: React.FC = () => {
  const [revenues, setRevenues] = React.useState<Revenue[]>([]);
  const [expenses, setExpenses] = React.useState<DbExpense[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      fetchRevenues(),
      fetchExpenses()
    ]).then(([rev, exp]) => {
      if (!alive) return;
      setRevenues(rev);
      setExpenses(exp);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const parsed = await parseRevenuesXlsx(file, "Mozas");
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

  // Grupare pe luni (YYYY-MM)
  const months = React.useMemo(() => {
    const map = new Map<string, { gross: number; net: number; currency: string }>();
    // Grupăm revenues pe lună/valută
    for (const r of revenues) {
      const month = r.date?.slice(0, 7) || "";
      const cur = (r.market || "RON").toUpperCase();
      const key = `${month}-${cur}`;
      if (!map.has(key)) map.set(key, { gross: 0, net: 0, currency: cur });
      map.get(key)!.gross += Number(r.amount) || 0;
    }
    // Scădem cheltuielile pe lună/valută
    for (const e of expenses) {
      const month = e.expense_date?.slice(0, 7) || "";
      const cur = (e.currency || "RON").toUpperCase();
      const key = `${month}-${cur}`;
      if (!map.has(key)) map.set(key, { gross: 0, net: 0, currency: cur });
      map.get(key)!.net = (map.get(key)!.net || map.get(key)!.gross) - (Number(e.amount) || 0);
    }
    // Dacă nu există cheltuieli, net = brut
    for (const v of map.values()) {
      if (typeof v.net !== "number") v.net = v.gross;
    }
    // sort desc
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([k, v]) => ({ month: k.slice(0, 7), currency: v.currency, totalGross: v.gross, totalNet: v.net }));
  }, [revenues, expenses]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Încasări</h1>
      <div className="flex gap-4 mb-4">
        <ImportXlsxButton onImport={handleImport} />
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => setModalOpen(true)}
        >
          Adaugă manual
        </button>
      </div>
      {/* Carduri calendaristice pe luni */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
        {months.map((m) => (
          <MonthSummaryCard key={m.month + m.currency} {...m} />
        ))}
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-400">Se încarcă...</div>
      ) : (
        <RevenueTable revenues={revenues} />
      )}
      <AddRevenueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddRevenue}
      />
    </div>
  );
};

export default Revenues;
