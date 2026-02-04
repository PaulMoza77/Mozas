// src/pages/admin/brands/components/BrandCard.tsx

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { BrandRow } from "../types";
import { cx } from "../utils";

export function BrandCard(props: {
  row: BrandRow;
  onEdit: (r: BrandRow) => void;
  onDelete: (r: BrandRow) => void;
}) {
  const r = props.row;

  return (
    <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {r.logo_url ? (
            <img
              src={r.logo_url}
              alt={r.name}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{r.name}</p>

            <span
              className={cx(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                r.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}
            >
              {r.is_active ? "Active" : "Hidden"}
            </span>

            {(Array.isArray(r.badges) ? r.badges : []).map((b) => (
              <span
                key={`${r.id}-${b}`}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
              >
                {b}
              </span>
            ))}
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{r.description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500">
              slug: {r.slug}
            </span>
            <span className="rounded-xl bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500">
              order: {r.sort_order ?? 0}
            </span>

            {r.overview_url ? (
              <a
                href={r.overview_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-black"
              >
                Open overview <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => props.onEdit(r)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => props.onDelete(r)}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
