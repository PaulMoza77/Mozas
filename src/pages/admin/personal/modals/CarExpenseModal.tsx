// src/pages/admin/personal/modals/CarExpenseModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, Save } from "lucide-react";

import { addCarExpense } from "../../../../lib/garage/api";
import type { GarageExpenseKind } from "../../../../lib/garage/types";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseAmount(v: string): number {
  const n = Number(String(v || "").trim().replace(",", "."));
  return n;
}

export function CarExpenseModal(props: {
  open: boolean;
  onClose: () => void;
  carId: string;
  defaultCurrency: string;
  onSaved: () => Promise<void> | void;
}) {
  const { open, onClose, carId, defaultCurrency, onSaved } = props;

  const [busy, setBusy] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency || "EUR");
  const [kind, setKind] = useState<GarageExpenseKind>("general");

  // reset when opening
  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setDate(todayISO());
    setName("");
    setVendor("");
    setAmount("");
    setCurrency(defaultCurrency || "EUR");
    setKind("general");
  }, [open, defaultCurrency]);

  const amountNum = useMemo(() => parseAmount(amount), [amount]);

  const canSave = useMemo(() => {
    if (busy) return false;
    if (!carId) return false;
    if (!date) return false;
    if (!name.trim()) return false;
    if (!Number.isFinite(amountNum) || amountNum <= 0) return false;
    return true;
  }, [busy, carId, date, name, amountNum]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <div className="text-lg font-semibold">Add Expense</div>
            <div className="mt-1 text-sm text-slate-600">Denumire, furnizor, sumă, dată.</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-slate-50"
            disabled={busy}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 text-slate-600">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                disabled={busy}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Kind</div>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as GarageExpenseKind)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                disabled={busy}
              >
                <option value="general">General</option>
                <option value="leasing_rate">Leasing rate</option>
                <option value="insurance">Insurance</option>
                <option value="service">Service</option>
                <option value="tax">Tax</option>
              </select>
            </label>
          </div>

          <label className="text-sm block">
            <div className="mb-1 text-slate-600">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="ex: Rată leasing / RCA / Service"
              disabled={busy}
            />
          </label>

          <label className="text-sm block">
            <div className="mb-1 text-slate-600">Vendor</div>
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="ex: Bancă / Service / Asigurator"
              disabled={busy}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 text-slate-600">Amount</div>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="ex: 1581.94"
                inputMode="decimal"
                disabled={busy}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Currency</div>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="EUR / AED / RON"
                disabled={busy}
              />
            </label>
          </div>

          <div className="text-xs text-slate-500">
            Tip: dacă alegi <span className="font-semibold">Leasing rate</span>, progress bar-ul se actualizează automat.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSave}
            onClick={async () => {
              if (!canSave) return;
              setBusy(true);
              try {
                await addCarExpense({
                  car_id: carId,
                  date,
                  name: name.trim(),
                  vendor: vendor.trim() || null,
                  amount: amountNum,
                  currency: (currency || defaultCurrency || "EUR").trim().toUpperCase(),
                  kind,
                });

                await onSaved();
              } catch (e: any) {
                alert(e?.message || "Save failed.");
              } finally {
                setBusy(false);
              }
            }}
            className={clsx(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
              canSave ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
