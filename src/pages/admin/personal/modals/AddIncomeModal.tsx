import { useMemo, useState } from "react";
import { X } from "lucide-react";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export type PersonalTxnDraft = {
  date: string; // YYYY-MM-DD
  category: string;
  name: string;
  amount: number;
  note?: string;
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function AddIncomeModal(props: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: PersonalTxnDraft) => Promise<void> | void;
}) {
  const { open, onClose, onSave } = props;
  const [busy, setBusy] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState("Salary");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");

  const canSave = useMemo(() => {
    return !!date && !!category && !!name && amount > 0 && !busy;
  }, [date, category, name, amount, busy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <div className="text-lg font-semibold">Add Income</div>
            <div className="mt-1 text-sm text-slate-600">Adaugă o intrare de venit.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-slate-50"
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
              <div className="mb-1 text-slate-600">Category</div>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Salary / Dividends / Other"
              />
            </label>
          </div>

          <label className="text-sm block">
            <div className="mb-1 text-slate-600">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="ex: Client payment / Salary January"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 text-slate-600">Amount (€)</div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                min={0}
                step="0.01"
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Note (optional)</div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="ex: transfer / cash"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
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
                await onSave({ date, category, name, amount, note: note || undefined });
                onClose();
              } finally {
                setBusy(false);
              }
            }}
            className={clsx(
              "rounded-2xl px-4 py-2 text-sm font-semibold text-white",
              canSave ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
