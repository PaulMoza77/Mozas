// src/pages/admin/personal/components/CarCard.tsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import type { GarageCarRow, GarageExpenseRow, GarageIncomeRow } from "../../../../lib/garage/types";

import { money, percent } from "../utils/garageFormat";
import { useCarImportant } from "../hooks/useCarImportant";
import { useCarExpenses } from "../hooks/useCarExpenses";
import { useCarIncome } from "../hooks/useCarIncome";
import { useCarLeasing } from "../hooks/useCarLeasing";

import { CarImportantSection } from "./CarImportantSection";
import { CarLeasingSection } from "./CarLeasingSection";

import { CarExpenseModal } from "../modals/CarExpenseModal";
import { CarIncomeModal } from "../modals/CarIncomeModal";
import { deleteCar } from "../../../../lib/garage/api";
import { supabase } from "../../../../lib/supabase";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

const GARAGE_BUCKET = "garage-private";

async function signedPhotoUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(GARAGE_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl || null;
}

export function CarCard(props: {
  car: GarageCarRow;
  onEdit: () => void;
  onCarSaved: (saved: GarageCarRow) => void;
}) {
  const { car, onEdit } = props;

  const [photoSigned, setPhotoSigned] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [openExpense, setOpenExpense] = useState(false);
  const [openIncome, setOpenIncome] = useState(false);

  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showAllIncome, setShowAllIncome] = useState(false);

  // ✅ edit rows (NOT ids)
  const [editExpense, setEditExpense] = useState<GarageExpenseRow | null>(null);
  const [editIncome, setEditIncome] = useState<GarageIncomeRow | null>(null);

  const imp = useCarImportant(car.id);
  const exp = useCarExpenses(car.id);
  const inc = useCarIncome(car.id);
  const lease = useCarLeasing(car.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!car.photo_url) {
        setPhotoSigned(null);
        setPhotoLoading(false);
        return;
      }
      setPhotoLoading(true);
      const url = await signedPhotoUrl(car.photo_url);
      if (!cancelled) {
        setPhotoSigned(url);
        setPhotoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [car.photo_url]);

  const expenseTotal = useMemo(() => exp.rows.reduce((a, r) => a + Number(r.amount || 0), 0), [exp.rows]);

  const advanceNum = useMemo(() => {
    const v = lease.contract?.advance_amount;
    const n = v != null ? Number(v) : 0;
    return Number.isFinite(n) ? n : 0;
  }, [lease.contract?.advance_amount]);

  const expenseTotalWithAdvance = useMemo(
    () => (lease.includeAdvance ? expenseTotal + advanceNum : expenseTotal),
    [expenseTotal, advanceNum, lease.includeAdvance]
  );

  const incomeTotal = useMemo(() => inc.rows.reduce((a, r) => a + Number(r.amount || 0), 0), [inc.rows]);

  const net = useMemo(() => incomeTotal - expenseTotalWithAdvance, [incomeTotal, expenseTotalWithAdvance]);

  const leasePaid = useMemo(() => {
    const paidRates = exp.rows.filter((r) => r.kind === "leasing_rate").reduce((a, r) => a + Number(r.amount || 0), 0);
    const adv = lease.contract?.advance_amount ? Number(lease.contract.advance_amount) : 0;
    return lease.includeAdvance ? paidRates + adv : paidRates;
  }, [exp.rows, lease.contract, lease.includeAdvance]);

  const leaseTotal = useMemo(() => {
    const c = lease.contract;
    if (!c) return 0;
    const t =
      (c.total_payable != null ? Number(c.total_payable) : null) ??
      (c.credit_value != null ? Number(c.credit_value) : null) ??
      0;
    return Number.isFinite(t) ? t : 0;
  }, [lease.contract]);

  const leasePct = useMemo(() => (leaseTotal > 0 ? percent(leasePaid, leaseTotal) : 0), [leasePaid, leaseTotal]);

  const shownExpenses = useMemo(() => (showAllExpenses ? exp.rows : exp.rows.slice(0, 6)), [exp.rows, showAllExpenses]);
  const shownIncome = useMemo(() => (showAllIncome ? inc.rows : inc.rows.slice(0, 6)), [inc.rows, showAllIncome]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative w-full bg-slate-100">
        <div className="aspect-[21/9] w-full">
          {car.photo_url ? (
            photoSigned ? (
              <img src={photoSigned} alt={car.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                {photoLoading ? "Loading photo…" : "Photo unavailable (signed url failed)"}
              </div>
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">No photo</div>
          )}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={async () => {
              const ok = window.confirm("Delete this car (and all related data)?");
              if (!ok) return;
              try {
                await deleteCar(car.id);
                window.location.reload();
              } catch (e: any) {
                alert(e?.message || "Delete failed.");
              }
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-sm font-semibold text-rose-700 shadow hover:bg-white"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-xl font-semibold tracking-tight text-slate-900">{car.name}</div>
            <div className="mt-1 text-sm text-slate-600">
              Purchase: <span className="font-semibold">{money(car.purchase_price, car.purchase_currency)}</span> ·{" "}
              {Number(car.purchase_km || 0).toLocaleString()} km
              {car.purchase_date ? ` · ${car.purchase_date}` : ""}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditExpense(null);
                setOpenExpense(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>

            <button
              type="button"
              onClick={() => {
                setEditIncome(null);
                setOpenIncome(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Income
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Expenses</div>
            <div className="mt-1 text-lg font-semibold text-rose-700">
              {money(expenseTotalWithAdvance, car.purchase_currency)}
            </div>
            {lease.includeAdvance && advanceNum > 0 ? (
              <div className="mt-1 text-xs text-slate-500">
                Includes advance: {money(advanceNum, car.purchase_currency)}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Income</div>
            <div className="mt-1 text-lg font-semibold text-emerald-700">{money(incomeTotal, car.purchase_currency)}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Net</div>
            <div className={clsx("mt-1 text-lg font-semibold", net >= 0 ? "text-slate-900" : "text-rose-700")}>
              {money(net, car.purchase_currency)}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <CarImportantSection carId={car.id} hook={imp} />
          <CarLeasingSection carId={car.id} hook={lease} leasePaid={leasePaid} leaseTotal={leaseTotal} leasePct={leasePct} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* EXPENSES */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Recent expenses</div>
                <div className="mt-0.5 text-xs text-slate-500">{exp.rows.length} items</div>
              </div>

              {exp.rows.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setShowAllExpenses((v) => !v)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {showAllExpenses ? "Show less" : "Show all"}
                </button>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {exp.loading ? (
                <div className="text-sm text-slate-500">Loading…</div>
              ) : exp.rows.length === 0 ? (
                <div className="text-sm text-slate-500">No expenses yet.</div>
              ) : (
                shownExpenses.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{r.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {r.date} · {r.vendor || "—"} · {r.kind}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">{money(r.amount, r.currency)}</div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditExpense(r);
                          setOpenExpense(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => exp.remove(r.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* INCOME */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Recent income</div>
                <div className="mt-0.5 text-xs text-slate-500">{inc.rows.length} items</div>
              </div>

              {inc.rows.length > 6 ? (
                <button
                  type="button"
                  onClick={() => setShowAllIncome((v) => !v)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {showAllIncome ? "Show less" : "Show all"}
                </button>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {inc.loading ? (
                <div className="text-sm text-slate-500">Loading…</div>
              ) : inc.rows.length === 0 ? (
                <div className="text-sm text-slate-500">No income yet.</div>
              ) : (
                shownIncome.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{r.source}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{r.date}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">{money(r.amount, r.currency)}</div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditIncome(r);
                          setOpenIncome(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => inc.remove(r.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronDown className="h-4 w-4" />
          Back to top
        </button>
      </div>

      {/* Expense modal (add / edit) */}
      <CarExpenseModal
        open={openExpense}
        onClose={() => {
          setOpenExpense(false);
          setEditExpense(null);
        }}
        carId={car.id}
        defaultCurrency={car.purchase_currency}
        initial={editExpense}
        onSaved={async () => {
          await exp.reload();
          await lease.reload();
          setOpenExpense(false);
          setEditExpense(null);
        }}
      />

      {/* Income modal (add / edit) */}
      <CarIncomeModal
        open={openIncome}
        onClose={() => {
          setOpenIncome(false);
          setEditIncome(null);
        }}
        carId={car.id}
        defaultCurrency={car.purchase_currency}
        initial={editIncome}
        onSaved={async () => {
          await inc.reload();
          setOpenIncome(false);
          setEditIncome(null);
        }}
      />
    </div>
  );
}
