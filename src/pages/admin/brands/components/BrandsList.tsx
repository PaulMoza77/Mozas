// src/pages/admin/brands/components/BrandsList.tsx

import type { BrandRow } from "../types";
import { BrandCard } from "./BrandCard";

export function BrandsList(props: {
  loading: boolean;
  rows: BrandRow[];
  onEdit: (r: BrandRow) => void;
  onDelete: (r: BrandRow) => void;
}) {
  const { loading, rows, onEdit, onDelete } = props;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <p className="text-sm font-semibold text-slate-900">{loading ? "Loading..." : `${rows.length} brands`}</p>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          <BrandCard key={r.id} row={r} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
