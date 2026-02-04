// src/pages/admin/AdminExpenses.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Plus,
  Upload,
  X,
  Trash2,
  FileText,
  Search,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  fetchExpenses,
  upsertExpenseDb,
  deleteExpenseDb,
  type DbExpense,
} from "../lib/expensesApi";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseISOToDate(iso?: string | null) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0.00";
  return v.toFixed(2);
}

function formatAgg(agg: Record<string, number>) {
  const entries = Object.entries(agg).filter(
    ([, v]) => Number.isFinite(v) && v !== 0
  );
  if (entries.length === 0) return "—";
  return entries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cur, v]) => `${cur} ${money(v)}`)
    .join(" · ");
}

function sumByCurrency(rows: DbExpense[]) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const cur = (r.currency || "AED").toUpperCase();
    const amt = Number(r.amount);
    if (!Number.isFinite(amt)) continue;
    out[cur] = (out[cur] || 0) + amt;
  }
  return out;
}

function normalizeCategory(s: any) {
  return String(s ?? "").trim();
}

/** =========================
 * Modal
 * ========================= */
function ModalShell({
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
            <p className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
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
        <div className="max-h-[calc(92vh-84px)] overflow-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/** =========================
 * Category Tree (edit as you want)
 * ========================= */
const CATEGORY_TREE: {
  personal: Record<string, string[]>;
  business: Record<string, string[]>;
} = {
  personal: {
    "Lifestyle": ["Food", "Transport", "Shopping", "Health", "Travel", "Other"],
    "Home": ["Rent", "Utilities", "Internet", "Repairs", "Other"],
    "Family": ["Kids", "Gifts", "Other"],
  },
  business: {
    "Operational": [
      "Combustibil",
      "Transport",
      "Consumabile",
      "Chirie",
      "Utilitati",
      "Echipamente",
      "Mentenanta",
      "Other",
    ],
    "Marketing": ["Ads", "Influencers", "Content", "PR", "Other"],
    "Legal & Admin": ["Contabilitate", "Avocat", "Taxe", "Licente", "Other"],
    "Software": ["SaaS", "Hosting", "Domains", "Tools", "Other"],
    "Payroll": ["Salarii", "Comisioane", "Contractori", "Other"],
  },
};

type AiSuggestion = {
  main: string;
  sub: string;
  confidence: number;
};

type Draft = {
  id?: string;
  expense_date: string; // YYYY-MM-DD
  vendor: string;
  amount: string; // UI text
  currency: string;
  vat: string;
  category: string; // stored string "Main / Sub"
  brand: string;
  note: string;

  // new fields (editor v2)
  mainCategory: string;
  subCategory: string;
  aiSuggestion: AiSuggestion | null;

  receipt_url: string;
  receiptPreview: string;
  receiptFile?: File | null;

  status: DbExpense["status"];
};

const BRAND_OPTIONS = ["Mozas", "Volocar", "GetSureDrive", "TDG", "Brandly", "Personal"];
const BRAND_DISPLAY: Record<string, string> = {
  Mozas: "TheMozas",
  Volocar: "Volocar",
  TDG: "TDG",
  Brandly: "BRANDLY",
  GetSureDrive: "GETSUREDRIVE",
  Personal: "Personal",
};
const DASH_BRANDS = ["Mozas", "Volocar", "TDG", "Brandly", "GetSureDrive", "Personal"] as const;

const CURRENCY_OPTIONS = ["AED", "EUR", "USD", "RON"];
const EXPENSE_STATUS: Array<DbExpense["status"]> = [
  "draft",
  "pending_ai",
  "ready",
  "confirmed",
  "error",
];
const STATUS_OPTIONS: Array<DbExpense["status"] | "all"> = ["all", ...EXPENSE_STATUS];

type PeriodKey = "day" | "week" | "month" | "qtr" | "year" | "all";
const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "day", label: "Zi" },
  { key: "week", label: "Săpt." },
  { key: "month", label: "Lună" },
  { key: "qtr", label: "3 luni" },
  { key: "year", label: "1 an" },
  { key: "all", label: "All time" },
];

function periodStart(key: PeriodKey) {
  if (key === "all") return null;

  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const start = new Date(end);

  if (key === "day") start.setDate(end.getDate());
  if (key === "week") start.setDate(end.getDate() - 6);
  if (key === "month") start.setDate(end.getDate() - 29);
  if (key === "qtr") start.setDate(end.getDate() - 89);
  if (key === "year") start.setDate(end.getDate() - 364);

  start.setHours(0, 0, 0, 0);
  return start;
}

function getBrandDisplay(brand: string) {
  return BRAND_DISPLAY[brand] || brand || "—";
}

/** =========================
 * Storage
 * ========================= */
async function uploadReceipt(file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("expenses").upload(path, file, {
    upsert: false,
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
  });
  if (error) throw error;

  const { data } = supabase.storage.from("expenses").getPublicUrl(path);
  return data.publicUrl;
}

function extractExpenseStoragePath(publicUrl: string) {
  const m = publicUrl.match(/\/object\/public\/expenses\/(.+)$/);
  return m?.[1] ?? null;
}

async function deleteReceipt(publicUrl: string | null) {
  if (!publicUrl) return;
  const path = extractExpenseStoragePath(publicUrl);
  if (!path) return;
  await supabase.storage.from("expenses").remove([path]);
}

/** =========================
 * Category Card
 * ========================= */
type CatCardMetric = "sum" | "count";
function CategoryCard({
  title,
  valueText,
  isActive,
  onClick,
  metric,
  onMetricChange,
}: {
  title: string;
  valueText: string;
  isActive: boolean;
  onClick: () => void;
  metric: CatCardMetric;
  onMetricChange: (m: CatCardMetric) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "text-left rounded-3xl border p-4 sm:p-5 bg-white hover:bg-slate-50 transition",
        isActive ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200"
      )}
      title="Click: filter category"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 truncate">{title}</p>
          <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">
            {valueText}
          </p>
        </div>

        <div className="shrink-0">
          <div className="relative">
            <select
              value={metric}
              onChange={(e) => onMetricChange(e.target.value as CatCardMetric)}
              onClick={(e) => e.stopPropagation()}
              className="appearance-none rounded-2xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Ce afișează cardurile"
            >
              <option value="sum">Sumă</option>
              <option value="count">Nr. tranz.</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </button>
  );
}

/** =========================
 * Top Bar
 * ========================= */
function TopAdminBar({
  period,
  setPeriod,
}: {
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
}) {
  const linkBase =
    "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold border";
  const active = "bg-slate-900 text-white border-slate-900";
  const inactive = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-start lg:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Admin
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Expenses</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={clsx(
                  "rounded-2xl px-3 py-2 text-sm font-semibold border",
                  period === p.key ? active : inactive
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <NavLink
            to="/admin"
            className={({ isActive }) => clsx(linkBase, isActive ? active : inactive)}
            end
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/brands"
            className={({ isActive }) => clsx(linkBase, isActive ? active : inactive)}
          >
            Brands
          </NavLink>
          <NavLink
            to="/admin/expenses"
            className={({ isActive }) => clsx(linkBase, isActive ? active : inactive)}
          >
            Expenses
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function splitCategory(cat: string): { main: string; sub: string } {
  const raw = normalizeCategory(cat);
  if (!raw) return { main: "", sub: "" };
  const parts = raw.split(" / ").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { main: parts[0], sub: parts.slice(1).join(" / ") };
  // fallback for legacy "Main/Sub" or "Main - Sub"
  const m1 = raw.split("/").map((x) => x.trim()).filter(Boolean);
  if (m1.length >= 2) return { main: m1[0], sub: m1.slice(1).join(" / ") };
  const m2 = raw.split(" - ").map((x) => x.trim()).filter(Boolean);
  if (m2.length >= 2) return { main: m2[0], sub: m2.slice(1).join(" / ") };
  return { main: raw, sub: "" };
}

function buildCategory(main: string, sub: string) {
  const m = String(main || "").trim();
  const s = String(sub || "").trim();
  if (!m || !s) return "";
  return `${m} / ${s}`;
}

export default function AdminExpenses() {
  const [rows, setRows] = useState<DbExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<PeriodKey>("month");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");

  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [catMetric, setCatMetric] = useState<CatCardMetric>("sum");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** =========================
   * AUTO-SUGGEST CATEGORY (by vendor)
   * ========================= */
  useEffect(() => {
    if (!editorOpen || !editing) return;
    if (!editing.vendor) return;
    if (editing.mainCategory) return;

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
        setEditing((prev) =>
          prev
            ? {
                ...prev,
                mainCategory: main,
                subCategory: sub,
              }
            : prev
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorOpen, editing?.vendor, editing?.brand, editing?.mainCategory, rows]);

  /** =========================
   * AI SUGGESTION (mock – ready)
   * ========================= */
  useEffect(() => {
    if (!editorOpen || !editing) return;
    if (!editing.receiptPreview) return;
    if (editing.aiSuggestion) return;

    // MOCK – aici va veni AI real
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            aiSuggestion: {
              main: "Operational",
              sub: "Combustibil",
              confidence: 92,
            },
          }
        : prev
    );
  }, [editorOpen, editing?.receiptPreview, editing?.aiSuggestion]);

  /** =========================
   * Base filter (period + status + search) => dashboard totals ALL brands
   * ========================= */
  const base = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const start = periodStart(period);

    return rows.filter((r) => {
      if (start) {
        const d = parseISOToDate(r.expense_date);
        if (!d) return false;
        if (d < start) return false;
      }

      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      if (!qq) return true;
      const hay = [
        r.vendor,
        r.brand,
        r.category,
        r.note,
        r.currency,
        r.status,
        r.expense_date,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");
      return hay.includes(qq);
    });
  }, [rows, q, statusFilter, period]);

  /** =========================
   * Scope = base + optional brandFilter => categories + table
   * ========================= */
  const scope = useMemo(() => {
    if (brandFilter === "all") return base;
    return base.filter((r) => (r.brand || "") === brandFilter);
  }, [base, brandFilter]);

  /** =========================
   * Final = scope + optional categoryFilter => table
   * ========================= */
  const filtered = useMemo(() => {
    if (categoryFilter === "all") return scope;
    return scope.filter((r) => normalizeCategory(r.category) === categoryFilter);
  }, [scope, categoryFilter]);

  /** =========================
   * Dashboard aggregates (ALWAYS from base)
   * ========================= */
  const dashboard = useMemo(() => {
    const total = sumByCurrency(base);
    const byBrand: Record<string, Record<string, number>> = {};
    for (const b of DASH_BRANDS) byBrand[b] = {};
    for (const r of base) {
      const b = (r.brand || "") as (typeof DASH_BRANDS)[number];
      if (!byBrand[b]) continue;
      const cur = (r.currency || "AED").toUpperCase();
      const amt = Number(r.amount);
      if (!Number.isFinite(amt)) continue;
      byBrand[b][cur] = (byBrand[b][cur] || 0) + amt;
    }
    return { total, byBrand };
  }, [base]);

  /** =========================
   * Category options (from scope)
   * ========================= */
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of scope) {
      const c = normalizeCategory(r.category);
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [scope]);

  /** =========================
   * Top 6 categories cards (from scope)
   * ========================= */
  const topCategories = useMemo(() => {
    const map = new Map<
      string,
      { sumByCur: Record<string, number>; count: number; totalNumeric: number }
    >();

    for (const r of scope) {
      const c = normalizeCategory(r.category);
      if (!c) continue;

      const cur = (r.currency || "AED").toUpperCase();
      const amt = Number(r.amount);

      const entry = map.get(c) || { sumByCur: {}, count: 0, totalNumeric: 0 };

      if (Number.isFinite(amt)) {
        entry.sumByCur[cur] = (entry.sumByCur[cur] || 0) + amt;
        entry.totalNumeric += amt;
      }
      entry.count += 1;

      map.set(c, entry);
    }

    const arr = Array.from(map.entries()).map(([category, v]) => ({
      category,
      ...v,
    }));

    arr.sort((a, b) => b.totalNumeric - a.totalNumeric);
    return arr.slice(0, 6);
  }, [scope]);

  const toggleBrand = (b: string | "all") => {
    setCategoryFilter("all");
    setBrandFilter((prev) => (prev === b ? "all" : b));
  };

  const toggleCategory = (c: string) => {
    setCategoryFilter((prev) => (prev === c ? "all" : c));
  };

  /** =========================
   * Editor actions
   * ========================= */
  const openCreate = () => {
    setEditing({
      expense_date: todayISO(),
      vendor: "",
      amount: "",
      currency: "AED",
      vat: "",
      category: "",
      brand: "Mozas",
      note: "",
      mainCategory: "",
      subCategory: "",
      aiSuggestion: null,
      receipt_url: "",
      receiptPreview: "",
      receiptFile: null,
      status: "draft",
    });
    setEditorOpen(true);
  };

  const openEdit = (r: DbExpense) => {
    const cat = splitCategory(r.category || "");
    setEditing({
      id: r.id,
      expense_date: r.expense_date || todayISO(),
      vendor: r.vendor || "",
      amount: r.amount == null ? "" : String(r.amount),
      currency: r.currency || "AED",
      vat: r.vat == null ? "" : String(r.vat),
      category: r.category || "",
      brand: r.brand || "Mozas",
      note: r.note || "",
      mainCategory: cat.main || "",
      subCategory: cat.sub || "",
      aiSuggestion: null,
      receipt_url: r.receipt_url || "",
      receiptPreview: r.receipt_url || "",
      receiptFile: null,
      status: r.status || "draft",
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorOpen(false);
    setEditing(null);
  };

  const onPickReceipt = async (file: File) => {
    if (!editing) return;
    const preview = URL.createObjectURL(file);
    setEditing({ ...editing, receiptFile: file, receiptPreview: preview });
  };

  const onSave = async () => {
    if (!editing) return;

    // ensure category from main/sub
    const category = buildCategory(editing.mainCategory, editing.subCategory);
    if (!category) return alert("Categoria și subcategoria sunt obligatorii.");

    const expense_date = editing.expense_date || null;
    const vendor = editing.vendor.trim() || null;

    const amountNum =
      editing.amount.trim() === "" ? null : Number(editing.amount.replace(",", "."));
    const vatNum =
      editing.vat.trim() === "" ? null : Number(editing.vat.replace(",", "."));

    if (amountNum != null && !Number.isFinite(amountNum)) return alert("Amount invalid.");
    if (vatNum != null && !Number.isFinite(vatNum)) return alert("VAT invalid.");

    setSaving(true);
    try {
      let receipt_url = editing.receipt_url || null;

      if (editing.receiptFile) {
        const newUrl = await uploadReceipt(editing.receiptFile);
        if (editing.receipt_url && editing.receipt_url !== newUrl) {
          await deleteReceipt(editing.receipt_url);
        }
        receipt_url = newUrl;
      }

      const payload: Partial<DbExpense> & { id?: string } = {
        ...(editing.id ? { id: editing.id } : {}),
        expense_date,
        vendor,
        amount: amountNum,
        currency: (editing.currency || "AED").toUpperCase(),
        vat: vatNum,
        category: category,
        brand: editing.brand.trim() || null,
        note: editing.note.trim() || null,
        receipt_url,
        source: "manual",
        status: editing.receiptFile ? "pending_ai" : editing.status,
      };

      const saved = await upsertExpenseDb(payload);

      setRows((prev) => {
        const idx = prev.findIndex((x) => x.id === saved.id);
        if (idx >= 0) {
          const next = prev.slice();
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      closeEditor();
    } catch (e: any) {
      alert(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (r: DbExpense) => {
    const ok = window.confirm("Delete this expense?");
    if (!ok) return;

    setRows((prev) => prev.filter((x) => x.id !== r.id));

    try {
      if (r.receipt_url) await deleteReceipt(r.receipt_url);
      await deleteExpenseDb(r.id);
    } catch {
      alert("Delete failed. Reloading.");
      await load();
    }
  };

  const selectedBrandLabel =
    brandFilter === "all" ? "All brands" : BRAND_DISPLAY[brandFilter] || brandFilter;
  const selectedCategoryLabel =
    categoryFilter === "all" ? "All categories" : categoryFilter;

  const isPersonal = editing?.brand === "Personal";
  const categoryRoot = isPersonal ? CATEGORY_TREE.personal : CATEGORY_TREE.business;
  const mainCategories = useMemo(() => Object.keys(categoryRoot), [categoryRoot]);
  const subCategories = useMemo(() => {
    if (!editing?.mainCategory) return [];
    const list = categoryRoot[editing.mainCategory];
    return Array.isArray(list) ? list : [];
  }, [editing?.mainCategory, categoryRoot]);

  return (
    <div className="space-y-5">
      <TopAdminBar period={period} setPeriod={setPeriod} />

      {/* DASHBOARD */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <button
            type="button"
            onClick={() => toggleBrand("all")}
            className={clsx(
              "text-left lg:col-span-2 rounded-3xl border bg-white p-4 sm:p-5 hover:bg-slate-50 transition",
              brandFilter === "all"
                ? "border-slate-900 ring-1 ring-slate-900/10"
                : "border-slate-200"
            )}
            title="Click: show all brands (for table + categories)"
          >
            <p className="text-xs font-semibold text-slate-500">Total cheltuieli</p>
            <p className="mt-2 text-lg sm:text-xl font-semibold text-slate-900">
              {formatAgg(dashboard.total)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-700">
                {base.length} items
              </span>
              {statusFilter !== "all" ? (
                <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-700">
                  Status: {statusFilter}
                </span>
              ) : null}
              {q.trim() ? (
                <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-700">
                  Search: “{q.trim()}”
                </span>
              ) : null}
            </div>
          </button>

          {DASH_BRANDS.map((b) => {
            const active = brandFilter === b;
            const label = BRAND_DISPLAY[b] || b;
            const val = formatAgg(dashboard.byBrand[b]);

            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleBrand(b)}
                className={clsx(
                  "text-left rounded-3xl border bg-white p-4 sm:p-5 hover:bg-slate-50 transition",
                  active ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200"
                )}
                title={`Click: filter table + categories → ${label}`}
              >
                <p className="text-xs font-semibold text-slate-500">Expenses: {label}</p>
                <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">{val}</p>
              </button>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Categories
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Filtrate după: <span className="font-semibold">{selectedBrandLabel}</span>
                {" · "}
                <span className="font-semibold">{selectedCategoryLabel}</span>
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={clsx(
                "rounded-2xl px-3 py-2 text-sm font-semibold border",
                categoryFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              All categories
            </button>

            {categoryOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                className={clsx(
                  "rounded-2xl px-3 py-2 text-sm font-semibold border",
                  categoryFilter === c
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topCategories.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                No categories in this selection.
              </div>
            ) : (
              topCategories.map((c) => {
                const active = categoryFilter === c.category;
                const valueText =
                  catMetric === "count" ? `${c.count} tranzacții` : formatAgg(c.sumByCur);

                return (
                  <CategoryCard
                    key={c.category}
                    title={c.category}
                    valueText={valueText}
                    isActive={active}
                    onClick={() => toggleCategory(c.category)}
                    metric={catMetric}
                    onMetricChange={setCatMetric}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Transactions
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">All expenses</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add manual expenses or upload a receipt. (AI parsing next step.)
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold shadow"
          >
            <Plus className="h-4 w-4" />
            New expense
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_220px_220px]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendor, note, brand…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <select
            value={brandFilter}
            onChange={(e) => {
              setCategoryFilter("all");
              setBrandFilter(e.target.value);
            }}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            title="Brand filter"
          >
            <option value="all">All brands</option>
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {getBrandDisplay(b)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            title="Status filter"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading expenses…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No expenses yet.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r) => (
                  <tr key={r.id} className="bg-white">
                    <td className="px-4 py-3 text-slate-700">{r.expense_date || "—"}</td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {r.vendor || "—"}
                      {r.note ? (
                        <div className="mt-0.5 text-xs font-normal text-slate-500 line-clamp-1">
                          {r.note}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {getBrandDisplay(r.brand || "")}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {normalizeCategory(r.category) || "—"}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {(r.currency || "AED").toUpperCase()} {money(r.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-700">
                        {r.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {r.receipt_url ? (
                        <a
                          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
                          href={r.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText className="h-4 w-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(r)}
                          className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4 inline-block -mt-0.5 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      No expenses found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDITOR (integrated exact layout, fixed hooks) */}
      {editorOpen && editing ? (
        <ModalShell
          title={editing.id ? "Edit expense" : "New expense"}
          subtitle="Categoria este obligatorie"
          onClose={closeEditor}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            {/* LEFT */}
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
              {/* Date + Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold mb-1">Date</p>
                  <input
                    type="date"
                    value={editing.expense_date}
                    onChange={(e) =>
                      setEditing({ ...editing, expense_date: e.target.value })
                    }
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

              {/* Vendor */}
              <div>
                <p className="text-xs font-semibold mb-1">Vendor</p>
                <input
                  value={editing.vendor}
                  onChange={(e) => setEditing({ ...editing, vendor: e.target.value })}
                  className="w-full rounded-2xl border px-3 py-2 text-sm"
                />
              </div>

              {/* Amount / Currency / Status */}
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
                      setEditing({ ...editing, status: e.target.value as DbExpense["status"] })
                    }
                    className="w-full rounded-2xl border px-3 py-2 text-sm"
                  >
                    {EXPENSE_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
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
                    onChange={(e) =>
                      setEditing({ ...editing, subCategory: e.target.value })
                    }
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

              {/* AI Suggestion */}
              {editing.aiSuggestion && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm">
                  <p className="font-semibold text-sky-700">
                    AI suggestion ({editing.aiSuggestion.confidence}%)
                  </p>
                  <p className="mt-1">
                    {editing.aiSuggestion.main} / {editing.aiSuggestion.sub}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        mainCategory: editing.aiSuggestion!.main,
                        subCategory: editing.aiSuggestion!.sub,
                      })
                    }
                    className="mt-2 inline-flex rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* NOTE */}
              <div>
                <p className="text-xs font-semibold mb-1">Note</p>
                <textarea
                  value={editing.note}
                  onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                  className="w-full min-h-[90px] rounded-2xl border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* RIGHT – Receipt */}
            <div className="rounded-3xl border bg-slate-50 p-4 sm:p-6">
              <p className="text-sm font-semibold">Receipt</p>

              <div className="mt-3 aspect-[4/3] rounded-2xl border bg-white flex items-center justify-center overflow-hidden">
                {editing.receiptPreview ? (
                  <img
                    src={editing.receiptPreview}
                    className="w-full h-full object-cover"
                    alt="Receipt"
                  />
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
                    setEditing({
                      ...editing,
                      receiptPreview: "",
                      receiptFile: null,
                      receipt_url: "",
                      aiSuggestion: null,
                    })
                  }
                  className="flex-1 rounded-xl border px-3 py-2 text-xs font-semibold"
                >
                  Clear
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={closeEditor}
                  className="rounded-2xl border px-4 py-2 text-sm"
                  disabled={saving}
                >
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
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
