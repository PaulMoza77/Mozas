import React, { useEffect, useMemo, useState } from "react";
import { Plus, PiggyBank, TrendingUp, ArrowDownRight, ArrowUpRight, Pencil, Trash2, X, Save, RefreshCw } from "lucide-react";

import { StatCards } from "../components/StatCards";
import { SectionCard } from "../components/SectionCard";
import { AddIncomeModal, type PersonalTxnDraft } from "../modals/AddIncomeModal";
import { AddExpenseModal } from "../modals/AddExpenseModal";

// ✅ adjust path if needed
import { supabase } from "../../../../lib/supabase";

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

type AccountKey = "savings" | "investments";

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

function toNumberSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

/** ===== Edit transaction modal ===== */
function EditTxnModal(props: {
  open: boolean;
  txn: Txn | null;
  onClose: () => void;
  onSave: (next: Txn) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const t = props.txn;

  const [date, setDate] = useState(t?.date ?? "");
  const [category, setCategory] = useState(t?.category ?? "");
  const [name, setName] = useState(t?.name ?? "");
  const [amount, setAmount] = useState<string>(t ? String(t.amount) : "");
  const [note, setNote] = useState(t?.note ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!t || !props.open) return;
    setDate(t.date);
    setCategory(t.category);
    setName(t.name);
    setAmount(String(t.amount));
    setNote(t.note ?? "");
  }, [t?.id, props.open]);

  const canSave =
    !!t &&
    !!date &&
    !!category.trim() &&
    !!name.trim() &&
    amount.trim() !== "" &&
    !Number.isNaN(toNumberSafe(amount)) &&
    toNumberSafe(amount) >= 0;

  return (
    <ModalShell
      open={props.open}
      title={t ? `Edit ${t.type === "income" ? "Income" : "Expense"}` : "Edit"}
      subtitle={t ? `Transaction • ${t.date}` : undefined}
      onClose={() => (busy ? null : props.onClose())}
      footer={
        t ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await props.onDelete(t.id);
                  props.onClose();
                } finally {
                  setBusy(false);
                }
              }}
              className={clsx(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold",
                busy ? "cursor-not-allowed opacity-60" : "",
                "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <div className="flex-1" />

            <button
              type="button"
              disabled={busy}
              onClick={props.onClose}
              className={clsx(
                "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50",
                busy ? "cursor-not-allowed opacity-60" : ""
              )}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSave || busy}
              onClick={async () => {
                if (!t) return;
                setBusy(true);
                try {
                  await props.onSave({
                    ...t,
                    date,
                    category: category.trim(),
                    name: name.trim(),
                    amount: toNumberSafe(amount),
                    note: note.trim() ? note.trim() : undefined,
                  });
                  props.onClose();
                } finally {
                  setBusy(false);
                }
              }}
              className={clsx(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                !canSave || busy ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"
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
              <input className={clsx(inputBase(), "mt-1")} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
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

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const id = data.user?.id;
  if (!id) throw new Error("Not authenticated (no user).");
  return id;
}

function mapRowToTxn(r: any): Txn {
  return {
    id: r.id,
    type: r.type,
    date: r.date,
    category: r.category,
    name: r.name,
    amount: Number(r.amount),
    note: r.note ?? undefined,
  };
}

export function PersonalFinancials(props: { period: PeriodState }) {
  const { period } = props;

  const [txns, setTxns] = useState<Txn[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);

  const [openIncome, setOpenIncome] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTxn, setEditTxn] = useState<Txn | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    setErr(null);
    setLoading(true);
    try {
      const userId = await requireUserId();

      // accounts (ensure they exist)
      const { data: accRows, error: accErr } = await supabase
        .from("personal_accounts")
        .select("key,balance")
        .eq("user_id", userId);

      if (accErr) throw accErr;

      const byKey = new Map<string, number>();
      (accRows || []).forEach((r: any) => byKey.set(r.key, Number(r.balance)));

      // ensure savings/investments exist
      const missing: AccountKey[] = [];
      if (!byKey.has("savings")) missing.push("savings");
      if (!byKey.has("investments")) missing.push("investments");

      if (missing.length) {
        const { error: upErr } = await supabase.from("personal_accounts").upsert(
          missing.map((k) => ({ user_id: userId, key: k, balance: 0 })),
          { onConflict: "user_id,key" }
        );
        if (upErr) throw upErr;
        missing.forEach((k) => byKey.set(k, 0));
      }

      setSavings(byKey.get("savings") ?? 0);
      setInvestments(byKey.get("investments") ?? 0);

      // txns
      const { data: rows, error: tErr } = await supabase
        .from("personal_txns")
        .select("id,type,date,category,name,amount,note,created_at")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500);

      if (tErr) throw tErr;

      setTxns((rows || []).map(mapRowToTxn));
    } catch (e: any) {
      setErr(e?.message || "Failed to load personal financials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function addTxn(type: "income" | "expense", d: PersonalTxnDraft) {
    setErr(null);
    setBusy(true);
    try {
      const userId = await requireUserId();
      const payload = {
        user_id: userId,
        type,
        date: d.date,
        category: d.category,
        name: d.name,
        amount: d.amount,
        note: d.note ?? null,
      };

      const { data, error } = await supabase
        .from("personal_txns")
        .insert(payload)
        .select("id,type,date,category,name,amount,note")
        .single();

      if (error) throw error;

      setTxns((prev) => [mapRowToTxn(data), ...prev]);
    } catch (e: any) {
      setErr(e?.message || "Failed to add transaction.");
    } finally {
      setBusy(false);
    }
  }

  async function updateTxn(next: Txn) {
    setErr(null);
    setBusy(true);
    try {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("personal_txns")
        .update({
          date: next.date,
          category: next.category,
          name: next.name,
          amount: next.amount,
          note: next.note ?? null,
        })
        .eq("id", next.id)
        .eq("user_id", userId);

      if (error) throw error;

      setTxns((prev) => prev.map((x) => (x.id === next.id ? next : x)));
    } catch (e: any) {
      setErr(e?.message || "Failed to update transaction.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTxn(id: string) {
    setErr(null);
    setBusy(true);
    try {
      const userId = await requireUserId();
      const { error } = await supabase.from("personal_txns").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;

      setTxns((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e?.message || "Failed to delete transaction.");
    } finally {
      setBusy(false);
    }
  }

  async function setAccount(key: AccountKey, nextBalance: number) {
    setErr(null);
    setBusy(true);
    try {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("personal_accounts")
        .upsert({ user_id: userId, key, balance: nextBalance }, { onConflict: "user_id,key" });
      if (error) throw error;

      if (key === "savings") setSavings(nextBalance);
      if (key === "investments") setInvestments(nextBalance);
    } catch (e: any) {
      setErr(e?.message || "Failed to update account.");
    } finally {
      setBusy(false);
    }
  }

  function openEdit(t: Txn) {
    setEditTxn(t);
    setEditOpen(true);
  }

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {loading ? "Loading…" : `Loaded ${txns.length} transactions`}
        </div>
        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

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
                disabled={busy}
                onClick={() => setOpenIncome(true)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                  busy ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"
                )}
              >
                <Plus className="h-4 w-4" />
                Add Income
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpenExpense(true)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50",
                  busy ? "cursor-not-allowed opacity-60" : ""
                )}
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
              <div className="text-xs text-slate-500">Supabase: personal_txns</div>
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
                      disabled={busy}
                      onClick={() => openEdit(t)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50",
                        busy ? "cursor-not-allowed opacity-60" : ""
                      )}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

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

              {!loading && filteredTxns.length === 0 ? (
                <div className="p-5 text-sm text-slate-600">No transactions in this period.</div>
              ) : null}
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
                  disabled={busy}
                  onClick={() => setAccount("savings", Math.max(0, savings - 100))}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50",
                    busy ? "cursor-not-allowed opacity-60" : ""
                  )}
                >
                  -100 €
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAccount("savings", savings + 100)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50",
                    busy ? "cursor-not-allowed opacity-60" : ""
                  )}
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
              <div className="mt-2 text-xs text-slate-500">Supabase: personal_accounts (key=savings)</div>
            </div>
          </SectionCard>

          <SectionCard
            title="Investments"
            subtitle="Portfolio snapshot"
            right={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAccount("investments", Math.max(0, investments - 250))}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50",
                    busy ? "cursor-not-allowed opacity-60" : ""
                  )}
                >
                  -250 €
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setAccount("investments", investments + 250)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50",
                    busy ? "cursor-not-allowed opacity-60" : ""
                  )}
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
              <div className="mt-2 text-xs text-slate-500">Supabase: personal_accounts (key=investments)</div>
            </div>
          </SectionCard>
        </div>
      </div>

      <AddIncomeModal
        open={openIncome}
        onClose={() => setOpenIncome(false)}
        onSave={(d) => addTxn("income", d)}
      />
      <AddExpenseModal
        open={openExpense}
        onClose={() => setOpenExpense(false)}
        onSave={(d) => addTxn("expense", d)}
      />

      <EditTxnModal
        open={editOpen}
        txn={editTxn}
        onClose={() => setEditOpen(false)}
        onSave={updateTxn}
        onDelete={removeTxn}
      />
    </div>
  );
}
