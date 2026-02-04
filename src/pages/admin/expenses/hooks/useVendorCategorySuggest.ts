// src/pages/admin/expenses/hooks/useVendorCategorySuggest.ts
import { useEffect } from "react";
import type { DbExpense, Draft } from "../types";
import { normalizeCategory, splitCategory } from "../utils";

export function useVendorCategorySuggest(opts: {
  editorOpen: boolean;
  editing: Draft | null;
  setEditing: React.Dispatch<React.SetStateAction<Draft | null>>;
  rows: DbExpense[];
}) {
  const { editorOpen, editing, setEditing, rows } = opts;

  useEffect(() => {
    if (!editorOpen || !editing) return;
    if (!editing.vendor || editing.mainCategory) return;

    const v = editing.vendor.toLowerCase().trim();
    if (!v) return;

    const match = rows.find((r) => {
      const rv = String(r.vendor ?? "").toLowerCase().trim();
      if (!rv || rv !== v) return false;
      if ((r.brand || "") !== editing.brand) return false;
      const c = normalizeCategory(r.category);
      return c.includes(" / ");
    });

    if (match) {
      const { main, sub } = splitCategory(match.category || "");
      if (main && sub) {
        setEditing((prev) => (prev ? { ...prev, mainCategory: main, subCategory: sub } : prev));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorOpen, editing?.vendor, editing?.brand, editing?.mainCategory, rows]);
}
