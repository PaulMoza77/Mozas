// src/pages/admin/brands/components/EmptyState.tsx
import { Plus, RefreshCw } from "lucide-react";
import { cx } from "../utils";

export function EmptyState(props: {
  saving: boolean;
  onCreate: () => void;
  onImport: () => void;
  showImport: boolean;
}) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_20px_60px_-40px_rgba(0,0,0,0.25)]">
      <p className="text-sm font-semibold text-slate-900">No brands found</p>
      <p className="mt-1 text-sm text-slate-500">Add your first brand card.</p>

      <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={props.onCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          Add new
        </button>

        {props.showImport ? (
          <button
            type="button"
            disabled={props.saving}
            onClick={props.onImport}
            className={cx(
              "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50",
              props.saving && "opacity-60 pointer-events-none"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Import home projects
          </button>
        ) : null}
      </div>
    </div>
  );
}
