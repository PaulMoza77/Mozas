import React from "react";
import { Upload } from "lucide-react";
import type { Draft } from "../../types.ts";

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

      <div className="mt-3 aspect-[4/3] overflow-hidden rounded-2xl border bg-white flex items-center justify-center">
        {editing.receiptPreview ? (
          <img
            src={editing.receiptPreview}
            className="h-full w-full object-cover"
            alt="Receipt"
          />
        ) : (
          <Upload className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <label className="flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-xs font-semibold">
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
        <button
          type="button"
          onClick={closeEditor}
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!editing.mainCategory || !editing.subCategory || saving}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
