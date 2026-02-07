import React, { useMemo, useState } from "react";
import {
  Plus,
  PiggyBank,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import { StatCards } from "../components/StatCards";
import { SectionCard } from "../components/SectionCard";
import { AddIncomeModal, type PersonalTxnDraft } from "../modals/AddIncomeModal";
import { AddExpenseModal } from "../modals/AddExpenseModal";

type Txn = {
  id: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD
  category: string;
  name: string;
  amount: number;
  note?: string;
};

export type PeriodState = {
  preset: "this_month" | "last_30" | "custom" | "all";
  fromISO: string | null;
  toISO: string | null;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function formatMoney(n: number) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} €`;
}

function inRangeISO(iso: string, fromISO: string | null, toISO: string | null) {
  if (!fromISO && !toISO) return true;
  if (fromISO && iso < fromISO) return false;
  if (toISO && iso > toISO) return false;
  return true;
}

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

/** ===== Small modal (inline, no deps) ===== */
function ModalShell(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <div className="text-base font-semibold text-slate-900">{props.title}</div>
              {props.subtitle ? <div className="mt-1 text-sm text-slate-500">{props.subtitle}</div> : null}
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl hover:bg-slate-50"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>
          </div>

          <div className="p-5">{props.children}</div>

          {props.footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">{props.footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function inputBase() {
  return "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300";
}

/** ===== Edit transaction modal ===== */
function EditTxnModal(props: {
  open: boolean;
  txn: Txn | null;
  onClose: () => void;
  onSave: (next: Txn) => void;
  onDelete: (id: string) => void;
}) {
  const t = props.txn;

  const [date, setDate] = useState(t?.date ?? "");
  const [category, setCategory] = useState(t?.category ?? "");
  const [name, setName] = useState(t?.name ?? "");
  const [amount, setAmount] = useState<string>(t ? String(t.amount) : "");
  const [note, setNote] = useState(t?.note ?? "");

  // sync when opening/changing txn
  useMemo(() => {
    if (!t) return null;
    setDate(t.date);
    setCategory(t.category);
    setName(t.name);
    setAmount(String(t.amount));
    setNote(t.note ?? "");
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t?.id, props.open]);

  const canSave =
    !!t &&
    !!date &&
    !!category.trim() &&
    !!name.trim() &&
    amount.trim() !== "" &&
    !Number.isNaN(Number(amount)) &&
    Number(amount) >= 0;

  return (
    <ModalShell
      open={props.open}
      title={t ? `Edit ${t.type === "income" ? "Income" : "Expense"}` : "Edit"}
      subtitle={t ? `Transaction • ${t.date}` : undefined}
      onClose={props.onClose}
      footer={
        t ? (
          <>
            <button
              type="button"
              onClick={() => props.onDelete(t.id)}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={props.onClose}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                if (!t) return;
                props.onSave({
                  ...t,
                  date,
                  category: category.trim(),
                  name: name.trim(),
                  amount: Number(amount),
                  note: note.trim() ? note.trim() : undefined,
                });
                props.onClose();
              }}
              className={clsx(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                canSave ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"
              )}
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </>
        ) : null
      }
    >
      {t ? (
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-slate-600">
              Date
              <input className={clsx(inputBase(), "mt-1")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="text-xs text-slate-600">
              Amount (€)
              <input
                className={clsx(inputBase(), "mt-1")}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>

          <label className="text-xs text-slate-600">
            Category
            <input className={clsx(inputBase(), "mt-1")} value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>

          <label className="text-xs text-slate-600">
            Name
            <input className={clsx(inputBase(), "mt-1")} value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="text-xs text-slate-600">
            Note (optional)
            <input className={clsx(inputBase(), "mt-1")} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
      ) : null}
    </ModalShell>
  );
}

export function PersonalFinancials(props: { period: PeriodState }) {
  const { period } = props;

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

  // edit
  const [editOpen, setEditOpen] = useState(false);
  const [editTxn, setEditTxn] = useState<Txn | null>(null);

  const filteredTxns = useMemo(() => {
    const list = [...txns].sort((a, b) => (a.date < b.date ? 1 : -1));
    return list.filter((t) => inRangeISO(t.date, period.fromISO, period.toISO));
  }, [txns, period.fromISO, period.toISO]);

  const incomeTotal = useMemo(
    () => filteredTxns.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0),
    [filteredTxns]
  );

  const expenseTotal = useMemo(
    () => filteredTxns.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0),
    [filteredTxns]
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

  function openEdit(t: Txn) {
    setEditTxn(t);
    setEditOpen(true);
  }

  function saveEdit(next: Txn) {
    setTxns((prev) => prev.map((x) => (x.id === next.id ? next : x)));
  }

  function deleteTxn(id: string) {
    setTxns((prev) => prev.filter((x) => x.id !== id));
    setEditOpen(false);
    setEditTxn(null);
  }

  return (
    <div className="space-y-4">
      <StatCards
        items={[
          { label: "Income", value: incomeTotal, tone: "good", hint: "Total venituri (în perioada selectată)" },
          { label: "Expenses", value: expenseTotal, tone: "bad", hint: "Total cheltuieli (în perioada selectată)" },
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
                Net: <span className="font-semibold text-slate-900">{formatMoney(net)}</span>
              </div>
              <div className="text-xs text-slate-500">(mock local) Următorul pas: legăm de DB</div>
            </div>

            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {filteredTxns.slice(0, 10).map((t) => (
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
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    {t.type === "income" ? (
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        title="Click to edit"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        {formatMoney(t.amount)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        title="Click to edit"
                      >
                        <ArrowDownRight className="h-4 w-4" />
                        {formatMoney(t.amount)}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredTxns.length === 0 ? <div className="p-5 text-sm text-slate-600">No transactions in this period.</div> : null}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Savings"
            subtitle="Buffer / cash management"
            right={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSavings((v) => v - 100)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  -100 €
                </button>
                <button
                  type="button"
                  onClick={() => setSavings((v) => v + 100)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  <PiggyBank className="h-4 w-4" />
                  +100 €
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInvestments((v) => v - 250)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  -250 €
                </button>
                <button
                  type="button"
                  onClick={() => setInvestments((v) => v + 250)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  <TrendingUp className="h-4 w-4" />
                  +250 €
                </button>
              </div>
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

      <EditTxnModal open={editOpen} txn={editTxn} onClose={() => setEditOpen(false)} onSave={saveEdit} onDelete={deleteTxn} />
    </div>
  );
}
