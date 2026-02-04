// src/pages/admin/brands/components/BrandEditorModal.tsx
import React, { useMemo, useState } from "react";
import { ExternalLink, Save, X } from "lucide-react";
import type { BrandDraft, BrandRow } from "../types";
import { BADGE_OPTIONS, LOGO_BUCKET } from "../constants";
import { cx, isUrlLike, slugify } from "../utils";
import { LogoUploader } from "./LogoUploader";

export function BrandEditorModal(props: {
  open: boolean;
  saving: boolean;

  editingRow: BrandRow | null;

  draft: BrandDraft | null;
  setDraft: React.Dispatch<React.SetStateAction<BrandDraft | null>>;

  onClose: () => void;
  onSave: () => Promise<void>;

  uploadLogo: (file: File, slugOrName: string) => Promise<string>;
}) {
  const { open, saving, editingRow, draft, setDraft, onClose, onSave, uploadLogo } = props;

  const [logoUploading, setLogoUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const title = editingRow ? "Edit brand" : "Add brand";
  const nameTitle = editingRow ? editingRow.name : "New brand";

  const canSave = useMemo(() => {
    if (!draft) return false;
    if (!draft.name.trim()) return false;
    if (!draft.description.trim()) return false;
    if (!draft.overview_url.trim()) return false;
    if (!isUrlLike(draft.overview_url)) return false;
    if (!Number.isFinite(Number(draft.sort_order))) return false;
    return true;
  }, [draft]);

  if (!open || !draft) return null;

  const toggleBadge = (b: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const on = prev.badges.includes(b);
      return { ...prev, badges: on ? prev.badges.filter((x) => x !== b) : [...prev.badges, b] };
    });
  };

  const onPickLogo = async (file: File) => {
    try {
      setErrorMsg(null);
      setLogoUploading(true);

      const base = slugify(draft.slug || draft.name) || "brand";
      const url = await uploadLogo(file, base);
      setDraft({ ...draft, logo_url: url });
    } catch (e: any) {
      setErrorMsg(e?.message || "Upload failed.");
    } finally {
      setLogoUploading(false);
    }
  };

  const doSave = async () => {
    setErrorMsg(null);

    if (!draft.name.trim()) return setErrorMsg("Name is required.");
    if (!draft.description.trim()) return setErrorMsg("Description is required.");
    if (!draft.overview_url.trim()) return setErrorMsg("Overview URL is required.");
    if (!isUrlLike(draft.overview_url)) return setErrorMsg("Overview URL must start with http(s)://");
    if (!Number.isFinite(Number(draft.sort_order))) return setErrorMsg("Sort order must be a number.");

    await onSave().catch((e: any) => setErrorMsg(e?.message || "Save failed."));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_40px_120px_-70px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{nameTitle}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        <div className="px-6 py-5">
          {errorMsg ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Name</label>
              <input
                value={draft.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft({ ...draft, name: v, slug: draft.id ? draft.slug : slugify(v) });
                }}
                placeholder="e.g. GetSureDrive"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Slug</label>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                placeholder="e.g. getsuredrive"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Sort order</label>
              <input
                value={String(draft.sort_order)}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                type="number"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Short card description shown on home."
                rows={3}
                className="mt-1 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Logo</label>
              <LogoUploader logoUrl={draft.logo_url} uploading={logoUploading} onPick={onPickLogo} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Overview URL (redirect)</label>
              <input
                value={draft.overview_url}
                onChange={(e) => setDraft({ ...draft, overview_url: e.target.value })}
                placeholder="https://getsuredrive.com"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Badges</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((b) => {
                  const on = draft.badges.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={cx(
                        "rounded-full px-3 py-1 text-xs font-semibold transition",
                        on
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Visibility</label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, is_active: true })}
                  className={cx(
                    "rounded-2xl px-4 py-2 text-sm font-semibold",
                    draft.is_active ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, is_active: false })}
                  className={cx(
                    "rounded-2xl px-4 py-2 text-sm font-semibold",
                    !draft.is_active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
                  )}
                >
                  Hidden
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {draft.overview_url ? (
                <a
                  href={draft.overview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Test redirect <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}

              <button
                type="button"
                disabled={saving || logoUploading || !canSave}
                onClick={doSave}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black",
                  (saving || logoUploading || !canSave) && "opacity-60 pointer-events-none"
                )}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Logo uploads to Supabase Storage bucket: <b>{LOGO_BUCKET}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
