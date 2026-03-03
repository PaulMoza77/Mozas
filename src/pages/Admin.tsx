
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult, type DraggableProvided, type DraggableStateSnapshot, type DroppableProvided } from "@hello-pangea/dnd";
import { fetchExpenses, type DbExpense } from "../lib/expensesApi";
import { fetchRevenuesAgg } from "../lib/revenuesApi";

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0.00";
  return v.toFixed(2);
}

function sumByCurrency(rows: DbExpense[]) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const cur = (r.currency || "AED").toUpperCase();
    const amt = Number(r.amount);
    if (!Number.isFinite(amt)) continue;
    out[cur] = (out[cur] || 0) + amt;
  }
  return out;
}

function formatAgg(agg: Record<string, number>, opts?: { sign?: 1 | -1 }) {
  const sign = opts?.sign ?? 1;
  const entries = Object.entries(agg)
    .filter(([, v]) => Number.isFinite(v) && v !== 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return "—";
  return entries.map(([cur, v]) => `${cur} ${money(v * sign)}`).join(" · ");
}

function parseISOToDate(iso?: string | null) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

function daysAgo(n: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getAllBrands(expenses: DbExpense[], incomeAggByBrand: Record<string, any>) {
  const set = new Set<string>();
  expenses.forEach(e => e.brand && set.add(e.brand));
  Object.keys(incomeAggByBrand).forEach(b => set.add(b));
  return Array.from(set);
}

const PAID_LIKE = new Set(["Platit", "Preplatit"]);
const PENDING_LIKE = new Set(["Neplatit", "In Asteptare", "Urgent"]);

export default function MozasOverview() {
  const [expenses, setExpenses] = useState<DbExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [incomeAggAll, setIncomeAggAll] = useState<Record<string, number>>({});
  const [incomeAggByBrand, setIncomeAggByBrand] = useState<Record<string, Record<string, number>>>({});
  const [brandOrder, setBrandOrder] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingExpenses(true);
      try {
        const rows = await fetchExpenses();
        if (!alive) return;
        setExpenses(Array.isArray(rows) ? rows : []);
      } catch {
        if (!alive) return;
        setExpenses([]);
      } finally {
        if (!alive) return;
        setLoadingExpenses(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Branduri distincte din expenses și revenues
  const allBrands = useMemo(() => getAllBrands(expenses, incomeAggByBrand), [expenses, incomeAggByBrand]);
  useEffect(() => {
    if (allBrands.length && brandOrder.length === 0) setBrandOrder(allBrands);
  }, [allBrands]);

  useEffect(() => {
    fetchRevenuesAgg().then(setIncomeAggAll).catch(() => setIncomeAggAll({}));
    Promise.all(brandOrder.map(async (brand) => [brand, await fetchRevenuesAgg(brand)]))
      .then((pairs) => {
        const obj: Record<string, Record<string, number>> = {};
        for (const [brand, agg] of pairs) obj[brand as string] = agg as Record<string, number>;
        setIncomeAggByBrand(obj);
      });
  }, [brandOrder]);

  const expenseAggAll = useMemo(() => sumByCurrency(expenses), [expenses]);
  const expenseAggByBrand = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    for (const b of brandOrder) out[b] = {};
    for (const r of expenses) {
      const b = r.brand || "Mozas";
      if (!out[b]) out[b] = {};
      const cur = (r.currency || "AED").toUpperCase();
      const amt = Number(r.amount);
      if (!Number.isFinite(amt)) continue;
      out[b][cur] = (out[b][cur] || 0) + amt;
    }
    return out;
  }, [expenses, brandOrder]);

  const cashflow30d = useMemo(() => {
    const since = daysAgo(29);
    const rows30d = expenses.filter((r) => {
      const d = parseISOToDate(r.expense_date);
      if (!d) return false;
      return d >= since;
    });
    const paidRows = rows30d.filter((r) => PAID_LIKE.has(String(r.status || "Neplatit")));
    const pendingRows = rows30d.filter((r) => PENDING_LIKE.has(String(r.status || "Neplatit")));
    return {
      paidAgg: sumByCurrency(paidRows),
      pendingAgg: sumByCurrency(pendingRows),
      totalAgg: sumByCurrency(rows30d),
    };
  }, [expenses]);

  const netProfitAgg = useMemo(() => {
    const out: Record<string, number> = {};
    const allCurrencies = new Set([
      ...Object.keys(expenseAggAll),
      ...Object.keys(incomeAggAll),
    ]);
    for (const cur of allCurrencies) {
      const inc = incomeAggAll[cur] || 0;
      const exp = expenseAggAll[cur] || 0;
      out[cur] = inc - exp;
    }
    return out;
  }, [expenseAggAll, incomeAggAll]);

  const netProfitAggByBrand = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    for (const brand of brandOrder) {
      const incAgg = incomeAggByBrand[brand] || {};
      const expAgg = expenseAggByBrand[brand] || {};
      const allCurrencies = new Set([
        ...Object.keys(incAgg),
        ...Object.keys(expAgg),
      ]);
      const brandOut: Record<string, number> = {};
      for (const cur of allCurrencies) {
        const inc = incAgg[cur] || 0;
        const exp = expAgg[cur] || 0;
        brandOut[cur] = inc - exp;
      }
      out[brand] = brandOut;
    }
    return out;
  }, [incomeAggByBrand, expenseAggByBrand, brandOrder]);

  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Admin Panel / Mozas
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold">
            Mozas Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            Central hub to monitor revenue, profit and performance across all your
            businesses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/brands"
            className="px-3 py-1.5 text-xs rounded-full border border-slate-900 bg-slate-900 text-white font-medium hover:bg-black"
          >
            Manage brands
          </a>

          <a
            href="/admin/expenses"
            className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50"
          >
            Expenses
          </a>

          <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50 text-slate-700">
            Last 30 days
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-700">
            This month
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-700">
            Custom range
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full border border-emerald-500 bg-emerald-500 text-white font-medium">
            Export report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
        {/* Left sidebar: Carduri branduri drag & drop */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Businesses</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {allBrands.length} active
              </span>
            </div>
            <DragDropContext
              onDragEnd={(result: DropResult) => {
                if (!result.destination) return;
                const newOrder = Array.from(brandOrder);
                const [removed] = newOrder.splice(result.source.index, 1);
                newOrder.splice(result.destination.index, 0, removed);
                setBrandOrder(newOrder);
              }}
            >
              <Droppable droppableId="brands-droppable">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm"
                  >
                    {brandOrder.map((brand, idx) => (
                      <Draggable key={brand} draggableId={brand} index={idx}>
                        {(prov: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <button
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={
                              "w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100 transition " +
                              (snapshot.isDragging ? "ring-2 ring-emerald-400" : "")
                            }
                          >
                            <div>
                              <p className="text-xs font-medium">{brand}</p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                Revenues: <span className="font-semibold">{formatAgg(incomeAggByBrand[brand] || {})}</span>
                              </p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                Expenses: <span className="font-semibold">{formatAgg(expenseAggByBrand[brand] || {})}</span>
                              </p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                Net profit: <span className="font-semibold">{formatAgg(netProfitAggByBrand[brand] || {})}</span>
                              </p>
                            </div>
                          </button>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <button className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50">
                Add new business
              </button>
              <button className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50">
                Update targets
              </button>
              <button className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50">
                Task board
              </button>
            </div>

            <div className="mt-3">
              <a
                href="/admin/expenses"
                className="block w-full rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-left text-[11px] font-medium text-white hover:bg-black"
              >
                Open Expenses
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {/* Overview KPIs */}
          <section>
            <h2 className="text-sm font-semibold mb-3">Portfolio overview</h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="mt-2 text-2xl font-semibold">
                  {Object.keys(incomeAggAll).length === 0 ? "—" : formatAgg(incomeAggAll)}
                </p>
                <div className="mt-2 text-xs text-slate-500">
                  {brandOrder.map((brand: string) => (
                    <div key={brand}>
                      <span className="font-semibold">{brand}:</span> {formatAgg(incomeAggByBrand[brand] || {})}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>vs last 30 days</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium text-[10px]">
                    ▲ 18.2%
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Net Profit</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loadingExpenses ? "…" : formatAgg(netProfitAgg)}
                </p>
                <div className="mt-2 text-xs text-slate-500">
                  {brandOrder.map((brand: string) => (
                    <div key={brand}>
                      <span className="font-semibold">{brand}:</span> {formatAgg(netProfitAggByBrand[brand] || {})}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Income − Expenses</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-700 font-medium text-[10px]">
                    income not linked
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Cash Flow (30d)</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loadingExpenses ? "…" : formatAgg(cashflow30d.totalAgg, { sign: -1 })}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Paid / Pending (out)</span>
                  <span className="text-[11px]">
                    <span className="font-medium">
                      {loadingExpenses ? "…" : formatAgg(cashflow30d.paidAgg, { sign: -1 })}
                    </span>{" "}
                    / {loadingExpenses ? "…" : formatAgg(cashflow30d.pendingAgg, { sign: -1 })}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Total Expenses</p>
                <p className="mt-2 text-2xl font-semibold">
                  {loadingExpenses ? "…" : formatAgg(expenseAggAll)}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>All businesses • selected period</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                    Live from Expenses
                  </span>
                </div>
              </div>
            </div>

            {/* Restul paginii tale rămâne identic mai jos */}
            {/* Focus Signals */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Focus Signals</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Quick health indicators across the portfolio.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 font-medium text-[10px]">
                  Live
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-[11px] text-slate-600">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Volocar CAC</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[10px]">
                    Slightly high
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>DigitalGifter ARPU</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                    Improving
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Starscale pipeline</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                    Stable
                  </span>
                </div>
              </div>
            </div>

            {/* Restul componentului tău rămâne exact cum era */}
            {/* … (nu am schimbat restul blocurilor) */}
          </section>

          {/* păstrează restul secțiunilor tale nemodificate */}
        </main>
      </div>
    </div>
  );
}
