// src/pages/admin/personal/modals/CarIncomeModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, Save } from "lucide-react";

import type { GarageIncomeRow } from "../../../../lib/garage/types";
import { addCarIncome, updateCarIncome } from "../../../../lib/garage/api";

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

export function CarIncomeModal(props: {
  open: boolean;
  onClose: () => void;
  carId: string;
  defaultCurrency: string;
  initial?: GarageIncomeRow | null; // ✅ edit row
  onSaved: () => Promise<void> | void;
}) {
  const { open, onClose, carId, defaultCurrency, initial = null, onSaved } = props;

  const [busy, setBusy] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState((defaultCurrency || "EUR").toUpperCase());
  const [note, setNote] = useState("");

  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setDate(initial.date || todayISO());
      setSource(initial.source || "");
      setAmount(initial.amount != null ? String(initial.amount) : "");
      setCurrency((initial.currency || defaultCurrency || "EUR").toUpperCase());
      setNote(initial.note || "");
    } else {
      setDate(todayISO());
      setSource("");
      setAmount("");
      setCurrency((defaultCurrency || "EUR").toUpperCase());
      setNote("");
    }
  }, [open, initial, defaultCurrency]);

  const canSave = useMemo(() => {
    if (busy) return false;
    if (!date) return false;
    if (!source.trim()) return false;
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) return false;
    if (!currency.trim()) return false;
    return true;
  }, [busy, date, source, amount, currency]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <div className="text-lg font-semibold">{isEdit ? "Edit Income" : "Add Income"}</div>
            <div className="mt-1 text-sm text-slate-600">Source + amount.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-slate-50"
            disabled={busy}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 text-slate-600">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Currency</div>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="EUR / RON / AED"
              />
            </label>
          </div>

          <label className="text-sm block">
            <div className="mb-1 text-slate-600">Source</div>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="ex: Rent / Sale / Bonus"
            />
          </label>

          <label className="text-sm block">
            <div className="mb-1 text-slate-600">Amount</div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="ex: 500"
            />
          </label>

          <label className="text-sm block">
            <div className="mb-1 text-slate-600">Note (optional)</div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="ex: cash / invoice / etc."
            />
          </label>
        </div>

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
              setBusy(true);
              try {
                const a = Number(amount);

                if (isEdit && initial?.id) {
                  await updateCarIncome(initial.id, {
                    date,
                    source: source.trim(),
                    amount: a,
                    currency: currency.trim(),
                    note: note.trim() || null,
                  });
                } else {
                  await addCarIncome({
                    car_id: carId,
                    date,
                    source: source.trim(),
                    amount: a,
                    currency: currency.trim() || defaultCurrency || "EUR",
                    note: note.trim() || null,
                  });
                }

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
