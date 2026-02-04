// src/pages/admin/expenses/components/modals/ExpenseEditorModal.tsx
import React, { useMemo } from "react";
import type { Draft, ExpenseStatus } from "../../types";
import { EXPENSE_STATUS } from "../../types";
import {
  BRAND_OPTIONS,
  CURRENCY_OPTIONS,
  CATEGORY_TREE,
  STATUS_META,
} from "../../constants";
import { getBrandDisplay } from "../../utils";
import { ModalShell } from "./ModalShell";
import { AiSuggestionBox } from "./AiSuggestionBox";
import { ReceiptPanel } from "./ReceiptPanel";

export function ExpenseEditorModal(props: {
  editorOpen: boolean;
  editing: Draft | null;
  setEditing: React.Dispatch<React.SetStateAction<Draft | null>>;
  saving: boolean;

  closeEditor: () => void;
  onPickReceipt: (file: File) => void;
  onSave: () => void;
}) {
  const { editorOpen, editing, setEditing, saving, closeEditor, onPickReceipt, onSave } = props;

  const isPersonal = editing?.brand === "Personal";
  const categoryRoot = isPersonal ? CATEGORY_TREE.personal : CATEGORY_TREE.business;

  const mainCategories = useMemo(() => Object.keys(categoryRoot), [categoryRoot]);
  const subCategories = useMemo(() => {
    if (!editing?.mainCategory) return [];
    const list = categoryRoot[editing.mainCategory];
    return Array.isArray(list) ? list : [];
  }, [editing?.mainCategory, categoryRoot]);

  if (!editorOpen || !editing) return null;

  return (
    <ModalShell
      title={editing.id ? "Edit expense" : "New expense"}
      subtitle="Categoria este obligatorie"
      onClose={closeEditor}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* LEFT */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1">Date</p>
              <input
                type="date"
                value={editing.expense_date}
                onChange={(e) => setEditing({ ...editing, expense_date: e.target.value })}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-xs font-semibold mb-1">Brand</p>
              <select
                value={editing.brand}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    brand: e.target.value,
                    mainCategory: "",
                    subCategory: "",
                  })
                }
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              >
                {BRAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {getBrandDisplay(b)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1">Vendor</p>
            <input
              value={editing.vendor}
              onChange={(e) => setEditing({ ...editing, vendor: e.target.value })}
              className="w-full rounded-2xl border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1">Amount</p>
              <input
                value={editing.amount}
                onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-xs font-semibold mb-1">Currency</p>
              <select
                value={editing.currency}
                onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1">Status</p>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as ExpenseStatus })
                }
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              >
                {EXPENSE_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1">Categorie *</p>
              <select
                value={editing.mainCategory}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    mainCategory: e.target.value,
                    subCategory: "",
                  })
                }
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {mainCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1">Subcategorie *</p>
              <select
                value={editing.subCategory}
                onChange={(e) => setEditing({ ...editing, subCategory: e.target.value })}
                disabled={!editing.mainCategory}
                className="w-full rounded-2xl border px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Select subcategory</option>
                {subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AiSuggestionBox
            editing={editing}
            onApply={() =>
              setEditing({
                ...editing,
                mainCategory: editing.aiSuggestion!.main,
                subCategory: editing.aiSuggestion!.sub,
              })
            }
          />

          <div>
            <p className="text-xs font-semibold mb-1">Note</p>
            <textarea
              value={editing.note}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
              className="w-full min-h-[90px] rounded-2xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* RIGHT */}
        <ReceiptPanel
          editing={editing}
          setEditing={setEditing}
          onPickReceipt={onPickReceipt}
          closeEditor={closeEditor}
          onSave={onSave}
          saving={saving}
        />
      </div>
    </ModalShell>
  );
}
