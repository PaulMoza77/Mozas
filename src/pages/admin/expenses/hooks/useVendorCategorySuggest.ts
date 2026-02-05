// src/pages/admin/expenses/hooks/useVendorCategorySuggest.ts
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DbExpense, Draft } from "../types.ts";
import { splitCategory, normalizeCategory } from "../utils";

export function useVendorCategorySuggest(opts: {
  editorOpen: boolean;
  editing: Draft | null;
  setEditing: Dispatch<SetStateAction<Draft | null>>;
  rows: DbExpense[];
}) {
  const { editorOpen, editing, setEditing, rows } = opts;

  useEffect(() => {
    if (!editorOpen || !editing) return;

    // only auto-fill when vendor exists and category is empty
    if (!editing.vendor || editing.mainCategory) return;

    const v = editing.vendor.toLowerCase().trim();
    if (!v) return;

    const match = rows.find((r) => {
      const rv = String(r.vendor ?? "").toLowerCase().trim();
      if (!rv || rv !== v) return false;

      // keep brand-specific suggestion
      if (String(r.brand || "") !== String(editing.brand || "")) return false;

      const c = normalizeCategory(r.category);
      return c.includes(" / ");
    });

    if (!match) return;

    const { main, sub } = splitCategory(match.category || "");
    if (!main || !sub) return;

    setEditing((prev) => (prev ? { ...prev, mainCategory: main, subCategory: sub } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorOpen, editing?.vendor, editing?.brand, editing?.mainCategory, rows]);
}
