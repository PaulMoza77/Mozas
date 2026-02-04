// src/pages/admin/expenses/components/StatusBadge.tsx

import { AlertTriangle } from "lucide-react";
import type { ExpenseStatus } from "../types";
import { STATUS_META } from "../constants";
import { clsx } from "../utils";

export function StatusBadge({ status }: { status: any }) {
  const s = (status || "Neplatit") as ExpenseStatus;
  const meta = STATUS_META[s] || STATUS_META.Neplatit;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
        meta.pill
      )}
      title={meta.label}
    >
      {meta.icon === "urgent" ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
      {meta.label}
    </span>
  );
}
