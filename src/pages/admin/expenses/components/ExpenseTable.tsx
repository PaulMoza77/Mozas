// src/pages/admin/expenses/components/ExpenseTable.tsx

import { FileText, Trash2 } from "lucide-react";
import type { DbExpense } from "../types";
// import { money } from "../utils";
// import { money } from "../../../utils/money"; // Update this path to where 'money' is actually exported"
// import { money } from "../utils"; // Update this path if 'money' is defined elsewhere
// Simple money formatting fallback if the utility is missing
const money = (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
import { StatusBadge } from "./StatusBadge";

export function ExpenseTable(props: {
  loading: boolean;
  rows: DbExpense[];
  onEdit: (r: DbExpense) => void;
  onDelete: (r: DbExpense) => void;
}) {
  const { loading, rows, onEdit, onDelete } = props;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 overflow-hidden">
      {loading ? (
        <div className="p-6 text-sm text-slate-500">Loading expenses…</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-sm text-slate-500">No expenses yet.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Receipt</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="bg-white">
                  <td className="px-4 py-3 text-slate-700">{r.expense_date || "—"}</td>

                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {r.vendor || "—"}
                    {r.note ? (
                      <div className="mt-0.5 text-xs font-normal text-slate-500 line-clamp-1">
                        {r.note}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-slate-700">{r.brand || "—"}</td>

                  <td className="px-4 py-3 text-slate-700">
                    {r.category || "—"}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {(r.currency || "AED").toUpperCase()} {money(r.amount ?? 0)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-4 py-3">
                    {r.receipt_url ? (
                      <a
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
                        href={r.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(r)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r)}
                        className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4 inline-block -mt-0.5 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
