import { useMemo, useState } from "react";
import { Plus, PiggyBank, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { StatCards } from "../components/StatCards";
import { SectionCard } from "../components/SectionCard";
import { AddIncomeModal, type PersonalTxnDraft } from "../modals/AddIncomeModal";
import { AddExpenseModal } from "../modals/AddExpenseModal";

type Txn = {
  id: string;
  type: "income" | "expense";
  date: string;
  category: string;
  name: string;
  amount: number;
  note?: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function formatMoney(n: number) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} €`;
}

export function PersonalFinancials() {
  // ✅ momentan mock local (următorul pas: legăm de DB ca în expenses)
  const [txns, setTxns] = useState<Txn[]>([
    { id: uid(), type: "income", date: "2026-02-01", category: "Salary", name: "Salary", amount: 3000 },
    { id: uid(), type: "expense", date: "2026-02-02", category: "Food", name: "Groceries", amount: 120 },
    { id: uid(), type: "expense", date: "2026-02-03", category: "Transport", name: "Fuel", amount: 90 },
  ]);

  const [savings, setSavings] = useState<number>(1500);
  const [investments, setInvestments] = useState<number>(7200);

  const [openIncome, setOpenIncome] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);

  const incomeTotal = useMemo(
    () => txns.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0),
    [txns]
  );
  const expenseTotal = useMemo(
    () => txns.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0),
    [txns]
  );

  const net = useMemo(() => incomeTotal - expenseTotal, [incomeTotal, expenseTotal]);

  async function addIncome(d: PersonalTxnDraft) {
    setTxns((prev) => [
      { id: uid(), type: "income", date: d.date, category: d.category, name: d.name, amount: d.amount, note: d.note },
      ...prev,
    ]);
  }

  async function addExpense(d: PersonalTxnDraft) {
    setTxns((prev) => [
      { id: uid(), type: "expense", date: d.date, category: d.category, name: d.name, amount: d.amount, note: d.note },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: "Income", value: incomeTotal, tone: "good", hint: "Total venituri" },
          { label: "Expenses", value: expenseTotal, tone: "bad", hint: "Total cheltuieli" },
          { label: "Savings", value: savings, tone: "info", hint: "Cash / buffer" },
          { label: "Investments", value: investments, tone: "default", hint: "Portofoliu" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Financials"
          subtitle="Income + Expenses, quick add"
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenIncome(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Income
              </button>
              <button
                type="button"
                onClick={() => setOpenExpense(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </button>
            </div>
          }
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-700">
                Net:{" "}
                <span className="font-semibold text-slate-900">
                  {formatMoney(net)}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                (mock local) Următorul pas: legăm de DB
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {txns.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{t.date}</span>
                      <span className="text-xs font-semibold text-slate-700">{t.category}</span>
                    </div>
                    <div className="truncate text-sm font-semibold text-slate-900">{t.name}</div>
                    {t.note ? <div className="truncate text-xs text-slate-500">{t.note}</div> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {t.type === "income" ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <ArrowUpRight className="h-4 w-4" />
                        {formatMoney(t.amount)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                        <ArrowDownRight className="h-4 w-4" />
                        {formatMoney(t.amount)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Savings"
            subtitle="Buffer / cash management"
            right={
              <button
                type="button"
                onClick={() => setSavings((v) => v + 100)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <PiggyBank className="h-4 w-4" />
                +100 €
              </button>
            }
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">Current savings</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(savings)}</div>
              <div className="mt-2 text-xs text-slate-500">Mock. În DB îl facem ca “accounts / buckets”.</div>
            </div>
          </SectionCard>

          <SectionCard
            title="Investments"
            subtitle="Portfolio snapshot"
            right={
              <button
                type="button"
                onClick={() => setInvestments((v) => v + 250)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <TrendingUp className="h-4 w-4" />
                +250 €
              </button>
            }
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">Current investments</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(investments)}</div>
              <div className="mt-2 text-xs text-slate-500">Mock. În DB: holdings + transactions.</div>
            </div>
          </SectionCard>
        </div>
      </div>

      <AddIncomeModal open={openIncome} onClose={() => setOpenIncome(false)} onSave={addIncome} />
      <AddExpenseModal open={openExpense} onClose={() => setOpenExpense(false)} onSave={addExpense} />
    </div>
  );
}
