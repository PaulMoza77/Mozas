// src/pages/admin/expenses/components/StatusBadge.tsx

import { AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { ExpenseStatus } from "../types";
import { STATUS_META } from "../constants";

export function StatusBadge({ status }: { status: ExpenseStatus | string | null | undefined }) {
  const s: ExpenseStatus =
    (status as ExpenseStatus) && STATUS_META[status as ExpenseStatus]
      ? (status as ExpenseStatus)
      : "Neplatit";

  const meta = STATUS_META[s];

  const pillClass =
    meta.tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : meta.tone === "warning"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : meta.tone === "danger"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
        pillClass
      )}
      title={meta.label}
    >
      {s === "Urgent" ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
      {meta.label}
    </span>
  );
}
