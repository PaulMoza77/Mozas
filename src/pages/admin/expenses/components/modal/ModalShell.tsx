// src/pages/admin/expenses/components/modals/ModalShell.tsx
import React from "react";
import { X } from "lucide-react";

export function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full sm:w-[min(1040px,92vw)] max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{title}</p>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
        <div className="max-h-[calc(92vh-84px)] overflow-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
