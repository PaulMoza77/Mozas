// src/pages/admin/brands/components/BrandsTopBar.tsx
import { Plus, RefreshCw } from "lucide-react";
import { AdminTopNav } from "../../../../components/AdminTopNav";
import { cx } from "../utils";

export function BrandsTopBar(props: {
  query: string;
  setQuery: (v: string) => void;

  canImport: boolean;
  onImport: () => void;

  onRefresh: () => void;

  onCreate: () => void;

  saving: boolean;
}) {
  const { query, setQuery, canImport, onImport, onRefresh, onCreate, saving } = props;

  return (
    <div className="space-y-4">
      <AdminTopNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Brands</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage home cards (logo upload, description, overview redirect, badges).
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300 sm:w-72"
          />

          {canImport ? (
            <button
              type="button"
              disabled={saving}
              onClick={onImport}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50",
                saving && "opacity-60 pointer-events-none"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Import home projects
            </button>
          ) : null}

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            Add new
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
