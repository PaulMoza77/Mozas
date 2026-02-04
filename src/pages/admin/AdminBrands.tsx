import { useMemo, useState } from "react";

import type { BrandDraft, BrandRow } from "./brands/types";
import { useBrands } from "./brands/hooks/useBrands";

import { BrandsTopBar } from "./brands/components/BrandsTopBar";
import { BrandsList } from "./brands/components/BrandsList";
import { BrandEditorModal } from "./brands/components/BrandEditorModal";
import { EmptyState } from "./brands/components/EmptyState";

import { emptyDraft, toDraftFromRow } from "./brands/utils";

export default function AdminBrands() {
  const {
    rows,
    loading,
    saving,
    errorMsg,
    setErrorMsg,
    isEmpty,
    load,
    upsert,
    remove,
    importDefaultsIfEmpty,
    uploadLogo,
  } = useBrands();

  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BrandRow | null>(null);
  const [draft, setDraft] = useState<BrandDraft | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const badgesText = Array.isArray(r.badges) ? r.badges.join(" ") : "";
      return (
        (r.name || "").toLowerCase().includes(q) ||
        (r.slug || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        badgesText.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const openCreate = () => {
    setErrorMsg(null);
    setEditingRow(null);
    setDraft(emptyDraft());
    setEditorOpen(true);
  };

  const openEdit = (row: BrandRow) => {
    setErrorMsg(null);
    setEditingRow(row);
    setDraft(toDraftFromRow(row));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorOpen(false);
    setEditingRow(null);
    setDraft(null);
  };

  const onSave = async () => {
    if (!draft) return;
    await upsert(draft);
    closeEditor();
  };

  const onDelete = async (row: BrandRow) => {
    const ok = window.confirm(`Delete brand "${row.name}"?`);
    if (!ok) return;
    await remove(row.id);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <BrandsTopBar
          query={query}
          setQuery={setQuery}
          canImport={isEmpty}
          onImport={importDefaultsIfEmpty}
          onRefresh={load}
          onCreate={openCreate}
          saving={saving}
        />

        {errorMsg ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMsg}
          </div>
        ) : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState
            saving={saving}
            onCreate={openCreate}
            onImport={importDefaultsIfEmpty}
            showImport={isEmpty}
          />
        ) : (
          <BrandsList
            loading={loading}
            rows={filtered}
            onEdit={openEdit}
            onDelete={onDelete}
          />
        )}

        <BrandEditorModal
          open={editorOpen}
          saving={saving}
          editingRow={editingRow}
          draft={draft}
          setDraft={setDraft}
          onClose={closeEditor}
          onSave={onSave}
          uploadLogo={uploadLogo}
        />
      </div>
    </div>
  );
}
