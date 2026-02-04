// src/pages/admin/expenses/components/modals/ReceiptPanel.tsx
import React from "react";
import { Upload } from "lucide-react";
import type { Draft } from "../../types";

export function ReceiptPanel(props: {
  editing: Draft;
  setEditing: React.Dispatch<React.SetStateAction<Draft | null>>;
  onPickReceipt: (file: File) => void;
  closeEditor: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const { editing, setEditing, onPickReceipt, closeEditor, onSave, saving } = props;

  return (
    <div className="rounded-3xl border bg-slate-50 p-4 sm:p-6">
      <p className="text-sm font-semibold">Receipt</p>

      <div className="mt-3 aspect-[4/3] rounded-2xl border bg-white flex items-center justify-center overflow-hidden">
        {editing.receiptPreview ? (
          <img src={editing.receiptPreview} className="w-full h-full object-cover" alt="Receipt" />
        ) : (
          <Upload className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <label className="flex-1 text-center rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer">
          Upload
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickReceipt(f);
              e.currentTarget.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={() =>
            setEditing((prev) =>
              prev
                ? {
                    ...prev,
                    receiptPreview: "",
                    receiptFile: null,
                    receipt_url: "",
                    aiSuggestion: null,
                  }
                : prev
            )
          }
          className="flex-1 rounded-xl border px-3 py-2 text-xs font-semibold"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={closeEditor} className="rounded-2xl border px-4 py-2 text-sm" disabled={saving}>
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!editing.mainCategory || !editing.subCategory || saving}
          className="rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
