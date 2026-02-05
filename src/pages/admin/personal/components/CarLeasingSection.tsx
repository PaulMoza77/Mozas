import { useMemo } from "react";
import { Save, CreditCard } from "lucide-react";
import type { useCarLeasing } from "../hooks/useCarLeasing";
import { money } from "../utils/garageFormat";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function CarLeasingSection(props: {
  carId: string;
  hook: ReturnType<typeof useCarLeasing>;
  leasePaid: number;
  leaseTotal: number;
  leasePct: number;
}) {
  const { hook, leasePaid, leaseTotal, leasePct } = props;
  const { contract, loading, saving, draft, setDraft, saveDraft, includeAdvance, setIncludeAdvance } = hook;

  const currency = contract?.currency || draft.currency || "EUR";
  const remaining = useMemo(() => Math.max(0, leaseTotal - leasePaid), [leaseTotal, leasePaid]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CreditCard className="h-4 w-4 text-slate-700" />
            Leasing
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Progress = sum(expenses kind=leasing_rate) {contract?.advance_amount ? "+ advance (optional)" : ""}
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={saveDraft}
          className={clsx(
            "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
            saving ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          <Save className="h-4 w-4" />
          Save contract
        </button>
      </div>

      {/* progress */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            Paid: <span className="font-semibold text-slate-900">{money(leasePaid, currency)}</span>{" "}
            · Remaining: <span className="font-semibold text-slate-900">{money(remaining, currency)}</span>
          </div>
          <div className="text-sm font-semibold text-slate-900">{leasePct}%</div>
        </div>

        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-900" style={{ width: `${leasePct}%` }} />
        </div>

        {contract?.advance_amount != null ? (
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={includeAdvance}
              onChange={(e) => setIncludeAdvance(e.target.checked)}
            />
            Include advance ({money(Number(contract.advance_amount), currency)}) in “Paid”
          </label>
        ) : null}
      </div>

      {/* contract editor */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Contract no</div>
          <input
            value={draft.contract_no}
            onChange={(e) => setDraft((p) => ({ ...p, contract_no: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="ex: C182346"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Contract date</div>
          <input
            type="date"
            value={draft.contract_date}
            onChange={(e) => setDraft((p) => ({ ...p, contract_date: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Currency</div>
          <input
            value={draft.currency}
            onChange={(e) => setDraft((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="EUR"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Total payable</div>
          <input
            type="number"
            value={draft.total_payable}
            onChange={(e) => setDraft((p) => ({ ...p, total_payable: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="ex: 87006.80"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Advance amount</div>
          <input
            type="number"
            value={draft.advance_amount}
            onChange={(e) => setDraft((p) => ({ ...p, advance_amount: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="ex: 22950"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Installments count</div>
          <input
            type="number"
            value={draft.installments_count}
            onChange={(e) => setDraft((p) => ({ ...p, installments_count: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="ex: 55"
            disabled={loading}
          />
        </label>
      </div>
    </div>
  );
}
