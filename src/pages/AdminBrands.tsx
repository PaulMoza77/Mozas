// src/pages/admin/AdminBrands.tsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, ExternalLink, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  overview_url: string;
  badges: string[]; // text[]
  sort_order: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

const BADGE_OPTIONS = ["Global", "EU", "SUA", "UAE", "Asia"] as const;

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isUrlLike(v: string) {
  const s = String(v || "").trim();
  if (!s) return true; // allow empty until submit
  return /^https?:\/\/.+/i.test(s);
}

export default function AdminBrands() {
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BrandRow | null>(null);

  // form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [overviewUrl, setOverviewUrl] = useState("");
  const [badges, setBadges] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<number>(100);
  const [isActive, setIsActive] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("mozas_brands")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
    } else {
      setRows((data || []) as BrandRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.name?.toLowerCase().includes(q) ||
        r.slug?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        (r.badges || []).join(" ").toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setLogoUrl("");
    setOverviewUrl("");
    setBadges([]);
    setSortOrder(100);
    setIsActive(true);
    setErrorMsg(null);
    setDialogOpen(true);
  }

  function openEdit(r: BrandRow) {
    setEditing(r);
    setName(r.name || "");
    setSlug(r.slug || "");
    setDescription(r.description || "");
    setLogoUrl(r.logo_url || "");
    setOverviewUrl(r.overview_url || "");
    setBadges(Array.isArray(r.badges) ? r.badges : []);
    setSortOrder(Number(r.sort_order ?? 100));
    setIsActive(Boolean(r.is_active));
    setErrorMsg(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setErrorMsg(null);
  }

  function toggleBadge(b: string) {
    setBadges((prev) => {
      if (prev.includes(b)) return prev.filter((x) => x !== b);
      return [...prev, b];
    });
  }

  function validate(): string | null {
    const n = name.trim();
    if (!n) return "Name is required.";
    const s = slugify(slug || name);
    if (!s) return "Slug is required.";
    if (!isUrlLike(logoUrl)) return "Logo URL must start with http(s)://";
    if (!overviewUrl.trim()) return "Overview URL is required.";
    if (!isUrlLike(overviewUrl)) return "Overview URL must start with http(s)://";
    if (!Number.isFinite(Number(sortOrder))) return "Sort order must be a number.";
    return null;
  }

  async function onSave() {
    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      slug: slugify(slug || name),
      description: description.trim(),
      logo_url: logoUrl.trim(),
      overview_url: overviewUrl.trim(),
      badges: badges,
      sort_order: Math.round(Number(sortOrder)),
      is_active: Boolean(isActive),
    };

    if (editing?.id) {
      const { error } = await supabase
        .from("mozas_brands")
        .update(payload)
        .eq("id", editing.id);

      if (error) {
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("mozas_brands").insert(payload);
      if (error) {
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setDialogOpen(false);
    await load();
  }

  async function onDelete(r: BrandRow) {
    const ok = window.confirm(`Delete brand "${r.name}"?`);
    if (!ok) return;

    setErrorMsg(null);
    const { error } = await supabase.from("mozas_brands").delete().eq("id", r.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    await load();
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Brands</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage the home cards (logo, description, overview redirect, badges).
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300 sm:w-72"
            />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Add new
            </button>
          </div>
        </div>

        {errorMsg ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMsg}
          </div>
        ) : null}

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="text-sm font-semibold text-slate-900">
              {loading ? "Loading..." : `${filtered.length} brands`}
            </p>
            <button
              type="button"
              onClick={load}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {r.logo_url ? (
                      <img
                        src={r.logo_url}
                        alt={r.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{r.name}</p>
                      <span
                        className={cx(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          r.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {r.is_active ? "Active" : "Hidden"}
                      </span>

                      {(r.badges || []).map((b) => (
                        <span
                          key={`${r.id}-${b}`}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{r.description}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500">
                        slug: {r.slug}
                      </span>
                      <span className="rounded-xl bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500">
                        order: {r.sort_order}
                      </span>
                      {r.overview_url ? (
                        <a
                          href={r.overview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-black"
                        >
                          Open overview <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(r)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {!loading && filtered.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-900">No brands found</p>
                <p className="mt-1 text-sm text-slate-500">Add your first brand card.</p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  <Plus className="h-4 w-4" />
                  Add new
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_40px_120px_-70px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {editing ? "Edit brand" : "Add brand"}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {editing ? editing.name : "New brand"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDialog}
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
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editing) setSlug(slugify(e.target.value));
                    }}
                    placeholder="e.g. TheDigitalGifter"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="e.g. thedigitalgifter"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Sort order</label>
                  <input
                    value={String(sortOrder)}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    type="number"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short card description shown on home."
                    rows={3}
                    className="mt-1 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Logo URL</label>
                  <input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://.../logo.png"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
                  />
                  {logoUrl ? (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-12 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <img src={logoUrl} alt="logo preview" className="h-full w-full object-contain" />
                      </div>
                      <a
                        href={logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-700 underline"
                      >
                        open
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Overview URL (redirect)</label>
                  <input
                    value={overviewUrl}
                    onChange={(e) => setOverviewUrl(e.target.value)}
                    placeholder="https://thedigitalgifter.com"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Badges</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map((b) => {
                      const on = badges.includes(b);
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
                      onClick={() => setIsActive(true)}
                      className={cx(
                        "rounded-2xl px-4 py-2 text-sm font-semibold",
                        isActive ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"
                      )}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={cx(
                        "rounded-2xl px-4 py-2 text-sm font-semibold",
                        !isActive ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
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
                  onClick={closeDialog}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {overviewUrl ? (
                    <a
                      href={overviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Test redirect <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}

                  <button
                    type="button"
                    disabled={saving}
                    onClick={onSave}
                    className={cx(
                      "inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black",
                      saving && "opacity-60 pointer-events-none"
                    )}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Tip: URL-urile trebuie să înceapă cu http(s)://
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
