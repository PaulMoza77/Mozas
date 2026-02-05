// src/pages/admin/expenses/components/modal/ExpenseEditorModal.tsx
import React, { useMemo } from "react";
import type { Draft, ExpenseStatus } from "../../types.ts";
import { EXPENSE_STATUS } from "../../types.ts";
import { BRAND_DISPLAY, CATEGORY_TREE, STATUS_META } from "../../constants.ts";

import { ModalShell } from "./ModalShell";
import { AiSuggestionBox } from "./AiSuggestionBox";
import { ReceiptPanel } from "./ReceiptPanel";

const CURRENCY_OPTIONS = ["AED", "EUR", "RON", "USD"] as const;

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

  if (!editorOpen || !editing) return null;

  const brandOptions = useMemo(() => Object.keys(BRAND_DISPLAY), []);

  const categoryRoot = useMemo(() => {
    const anyTree: any = CATEGORY_TREE as any;

    // dacă ai personal în constants, îl folosim; altfel fallback la business
    if (editing.brand === "Personal" && anyTree.personal) return anyTree.personal;

    // business poate fi direct obiect sau sub-cheie business
    if (anyTree.business) return anyTree.business;

    // fallback safe
    return {};
  }, [editing.brand]);

  const mainCategories = useMemo(() => Object.keys(categoryRoot || {}), [categoryRoot]);

  const subCategories = useMemo(() => {
    const main = String(editing.mainCategory || "").trim();
    if (!main) return [];
    const list = (categoryRoot as any)?.[main];
    return Array.isArray(list) ? list : [];
  }, [editing.mainCategory, categoryRoot]);

  return (
    <ModalShell
      title={editing.id ? "Edit expense" : "New expense"}
      subtitle="Categoria este obligatorie"
      onClose={closeEditor}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold">Date</p>
              <input
                type="date"
                value={editing.expense_date}
                onChange={(e) => setEditing({ ...editing, expense_date: e.target.value })}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold">Brand</p>
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
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {BRAND_DISPLAY[b] ?? b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold">Vendor</p>
            <input
              value={editing.vendor}
              onChange={(e) => setEditing({ ...editing, vendor: e.target.value })}
              className="w-full rounded-2xl border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-semibold">Amount</p>
              <input
                value={editing.amount}
                onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold">Currency</p>
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
              <p className="mb-1 text-xs font-semibold">Status</p>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as ExpenseStatus })
                }
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              >
                {EXPENSE_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {(STATUS_META as any)?.[s]?.label ?? s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold">Categorie *</p>
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
              <p className="mb-1 text-xs font-semibold">Subcategorie *</p>
              <select
                value={editing.subCategory}
                onChange={(e) => setEditing({ ...editing, subCategory: e.target.value })}
                disabled={!editing.mainCategory}
                className="w-full rounded-2xl border px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Select subcategory</option>
                {subCategories.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AiSuggestionBox
            editing={editing}
            onApply={() => {
              if (!editing.aiSuggestion) return;
              setEditing({
                ...editing,
                mainCategory: editing.aiSuggestion.main,
                subCategory: editing.aiSuggestion.sub,
              });
            }}
          />

          <div>
            <p className="mb-1 text-xs font-semibold">Note</p>
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
