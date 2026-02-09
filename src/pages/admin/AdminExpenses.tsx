// src/pages/admin/AdminExpenses.tsx
import { useMemo, useState } from "react";
import { Plus, X, CheckSquare, Square, Pencil, Loader2 } from "lucide-react";

import { TopAdminBar } from "./expenses/components/TopAdminBar";
import { DashboardCards } from "./expenses/components/DashboardCards";
import { CategorySection } from "./expenses/components/CategorySection";
import { FiltersRow } from "./expenses/components/FiltersRow";
import { ExpenseTable } from "./expenses/components/ExpenseTable";
import { ImportXlsxButton } from "./expenses/components/ImportXlsxButton";
import { ExpenseEditorModal } from "./expenses/components/modal/ExpenseEditorModal";

import { useExpenses } from "./expenses/hooks/useExpenses";
import { useVendorCategorySuggest } from "./expenses/hooks/useVendorCategorySuggest";
import { useAiMock } from "./expenses/hooks/useAiMock";

import type {
  CatCardMetric,
  Draft,
  PeriodKey,
  StatusFilter,
  DbExpense,
} from "./expenses/types";
import { BRAND_DISPLAY, CATEGORY_TREE } from "./expenses/constants";

import {
  buildCategory,
  parseISOToDate,
  periodRange,
  splitCategory,
  sumByCurrency,
  todayISO,
} from "./expenses/utils";

import { deleteReceipt, uploadReceipt } from "./expenses/storage";

type BaseCat = "Operational" | "Marketing" | "Employees" | "Miscellaneous";
const BASE_ORDER: BaseCat[] = ["Operational", "Marketing", "Employees", "Miscellaneous"];

// ✅ branduri business (fără Personal)
const BUSINESS_BRANDS = ["Mozas", "Volocar", "TDG", "Brandly", "GetSureDrive"] as const;
type BusinessBrand = (typeof BUSINESS_BRANDS)[number];

function isBusinessBrand(v: unknown): v is BusinessBrand {
  return BUSINESS_BRANDS.includes(String(v || "") as BusinessBrand);
}

function mapLegacyMainToBase(mainRaw: string): BaseCat | null {
  const m = String(mainRaw || "").trim();

  if (m === "Operational") return "Operational";
  if (m === "Marketing") return "Marketing";
  if (m === "Employees") return "Employees";
  if (m === "Miscellaneous") return "Miscellaneous";

  // legacy -> new
  if (m === "Payroll") return "Employees";
  if (m === "Legal & Admin") return "Miscellaneous";
  if (m === "Software") return "Miscellaneous";

  if (!m) return null;
  return "Miscellaneous";
}

/** =========================
 * Bulk editor (local modal)
 * ========================= */
type BulkPatch = {
  // category
  mainCategory: BaseCat | "";
  subCategory: string;

  // other fields
  expense_date: string; // YYYY-MM-DD
  currency: string; // AED/RON/EUR/USD...
  status: string; // Neplatit/Platit/Urgent...

  // toggles: apply field or not
  applyCategory: boolean;
  applyDate: boolean;
  applyCurrency: boolean;
  applyStatus: boolean;
};

const CURRENCY_OPTIONS = ["AED", "EUR", "RON", "USD", "GBP"] as const;
const STATUS_OPTIONS = ["Neplatit", "Platit", "Urgent"] as const;

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function ModalShell(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={props.onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-5xl rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="text-base font-semibold text-slate-900">{props.title}</div>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5 py-4">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminExpenses(props: { mode?: "business" | "personal" }) {
  const mode = props.mode ?? "business";

  const { rows, loading, reload, upsertDb, deleteDb, removeLocal, insertMany } =
    useExpenses();

  // periods
  const [period, setPeriod] = useState<PeriodKey>("last30");
  const [customFrom, setCustomFrom] = useState<string>(todayISO());
  const [customTo, setCustomTo] = useState<string>(todayISO());

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [urgentOnly, setUrgentOnly] = useState(false);

  // base + sub filters
  const [baseCategory, setBaseCategory] = useState<BaseCat | "all">("all");
  const [subCategory, setSubCategory] = useState<string | "all">("all");

  const [catMetric, setCatMetric] = useState<CatCardMetric>("sum");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  // Bulk editor
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkQ, setBulkQ] = useState("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bulkPatch, setBulkPatch] = useState<BulkPatch>(() => ({
    mainCategory: "",
    subCategory: "",
    expense_date: todayISO(),
    currency: "EUR",
    status: "Neplatit",
    applyCategory: false,
    applyDate: false,
    applyCurrency: false,
    applyStatus: false,
  }));

  // -----------------------
  // Filters: base/scope/final
  // -----------------------
  const base = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const { start, end } = periodRange(period, customFrom, customTo);

    return rows.filter((r) => {
      const b = String(r.brand || "");

      // ✅ scoatem Personal din business
      if (mode === "business" && b === "Personal") return false;
      if (mode === "personal" && b !== "Personal") return false;

      if (start || end) {
        const d = parseISOToDate(r.expense_date);
        if (!d) return false;
        if (start && d < start) return false;
        if (end && d > end) return false;
      }

      if (statusFilter !== "all") {
        const s = (r.status || "Neplatit") as any;
        if (s !== statusFilter) return false;
      }

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
  }, [rows, q, statusFilter, period, customFrom, customTo, mode]);

  const scope = useMemo(() => {
    let out = base;

    if (mode === "business" && brandFilter !== "all") {
      out = out.filter((r) => String(r.brand || "") === brandFilter);
    }

    if (urgentOnly) out = out.filter((r) => (r.status as any) === "Urgent");
    return out;
  }, [base, brandFilter, urgentOnly, mode]);

  const filtered = useMemo(() => {
    let out = scope;

    if (baseCategory !== "all") {
      out = out.filter((r) => {
        const cat = splitCategory(r.category || "");
        return mapLegacyMainToBase(cat.main) === baseCategory;
      });
    }

    if (subCategory !== "all") {
      out = out.filter((r) => {
        const cat = splitCategory(r.category || "");
        return String(cat.sub || "").trim() === subCategory;
      });
    }

    return out;
  }, [scope, baseCategory, subCategory]);

  // -----------------------
  // Dashboard aggregates (always from base)
  // -----------------------
  const dashboard = useMemo(() => {
    const total = sumByCurrency(base);

    const byBrand: Record<string, Record<string, number>> = {};
    if (mode === "business") {
      for (const b of BUSINESS_BRANDS) byBrand[b] = {};
    } else {
      byBrand["Personal"] = {};
    }

    for (const r of base) {
      const b = String(r.brand || "");
      if (mode === "business") {
        if (!isBusinessBrand(b)) continue;
      } else {
        if (b !== "Personal") continue;
      }

      const cur = String(r.currency || "AED").toUpperCase();
      const amt = Number(r.amount);
      if (!Number.isFinite(amt)) continue;

      byBrand[b][cur] = (byBrand[b][cur] || 0) + amt;
    }

    return { total, byBrand };
  }, [base, mode]);

  const urgentAgg = useMemo(() => {
    const urgentRows = base.filter((r) => (r.status as any) === "Urgent");
    return { count: urgentRows.length, sum: sumByCurrency(urgentRows) };
  }, [base]);

  // -----------------------
  // Category UI data
  // -----------------------
  const availableBaseCats = useMemo(() => {
    const seen = new Set<BaseCat>();
    for (const r of scope) {
      const cat = splitCategory(r.category || "");
      const b = mapLegacyMainToBase(cat.main);
      if (b) seen.add(b);
    }
    return BASE_ORDER.filter((b) => seen.has(b));
  }, [scope]);

  const availableSubCats = useMemo(() => {
    if (baseCategory === "all") return [];

    const set = new Set<string>();
    for (const r of scope) {
      const cat = splitCategory(r.category || "");
      const b = mapLegacyMainToBase(cat.main);
      if (b !== baseCategory) continue;

      const sub = String(cat.sub || "").trim();
      if (sub) set.add(sub);
    }

    const treeList = CATEGORY_TREE.business[baseCategory] || [];
    for (const s of treeList) set.add(s);

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [scope, baseCategory]);

  const subCards = useMemo(() => {
    if (baseCategory === "all") return [];

    const map = new Map<
      string,
      { sumByCur: Record<string, number>; count: number; totalNumeric: number }
    >();

    for (const r of scope) {
      const cat = splitCategory(r.category || "");
      const b = mapLegacyMainToBase(cat.main);
      if (b !== baseCategory) continue;

      const sub = String(cat.sub || "").trim() || "Other";
      const cur = String(r.currency || "AED").toUpperCase();
      const amt = Number(r.amount);

      const entry = map.get(sub) || { sumByCur: {}, count: 0, totalNumeric: 0 };

      if (Number.isFinite(amt)) {
        entry.sumByCur[cur] = (entry.sumByCur[cur] || 0) + amt;
        entry.totalNumeric += amt;
      }
      entry.count += 1;

      map.set(sub, entry);
    }

    const arr = Array.from(map.entries()).map(([sub, v]) => ({ sub, ...v }));
    arr.sort((a, b) => b.totalNumeric - a.totalNumeric);
    return arr.slice(0, 12);
  }, [scope, baseCategory]);

  const resetCategoryFilter = () => {
    setBaseCategory("all");
    setSubCategory("all");
  };

  const toggleBrand = (b: string | "all") => {
    if (mode !== "business") return;
    setBrandFilter((prev) => (prev === b ? "all" : b));
    setUrgentOnly(false);
    resetCategoryFilter();
  };

  // ✅ brands list pentru carduri
  const brandsForCards = useMemo<string[]>(() => {
    return mode === "business" ? [...BUSINESS_BRANDS] : ["Personal"];
  }, [mode]);

  // -----------------------
  // Editor open/close
  // -----------------------
  const openCreate = () => {
    setEditing({
      expense_date: todayISO(),
      vendor: "",
      amount: "",
      currency: "EUR",
      vat: "",
      category: "",
      mainCategory: "",
      subCategory: "",
      brand: mode === "personal" ? "Personal" : "Mozas",
      note: "",
      aiSuggestion: null,
      receipt_url: "",
      receiptPreview: "",
      receiptFile: null,
      status: "Neplatit",
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
      currency: String(r.currency || "EUR").toUpperCase(),
      vat: r.vat == null ? "" : String(r.vat),
      category: r.category || "",
      mainCategory: cat.main || "",
      subCategory: cat.sub || "",
      brand: r.brand || (mode === "personal" ? "Personal" : "Mozas"),
      note: r.note || "",
      aiSuggestion: null,
      receipt_url: r.receipt_url || "",
      receiptPreview: r.receipt_url || "",
      receiptFile: null,
      status: ((r.status as any) || "Neplatit") as any,
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

  // ✅ evitam mismatch de tipuri dintre hook-uri
  useVendorCategorySuggest({ editorOpen, editing, setEditing: setEditing as any, rows });
  useAiMock({ editorOpen, editing, setEditing: setEditing as any });

  const onSave = async () => {
    if (!editing) return;

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
        currency: String(editing.currency || "EUR").toUpperCase(),
        vat: vatNum,
        category,
        brand: mode === "personal" ? "Personal" : (editing.brand?.trim() || null),
        note: editing.note?.trim() || null,
        receipt_url,
        source: "manual",
        status: editing.status as any,
      };

      await upsertDb(payload);
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

    removeLocal(r.id);

    try {
      if (r.receipt_url) await deleteReceipt(r.receipt_url);
      await deleteDb(r.id);
    } catch {
      alert("Delete failed. Reloading.");
      await reload();
    }
  };

  const selectedBrandLabel =
    mode !== "business"
      ? "Personal"
      : brandFilter === "all"
      ? "All brands"
      : BRAND_DISPLAY[brandFilter] || brandFilter;

  const selectedCategoryLabel =
    baseCategory === "all"
      ? "All categories"
      : baseCategory + (subCategory !== "all" ? ` / ${subCategory}` : "");

  /** =========================
   * Bulk editor helpers
   * ========================= */
  const openBulk = () => {
    // preselect: all filtered rows
    const map: Record<string, boolean> = {};
    for (const r of filtered) map[r.id] = true;
    setSelectedIds(map);

    // defaults: keep current view’s brand currency if any row has it
    const first = filtered[0];
    setBulkPatch((p) => ({
      ...p,
      currency: String(first?.currency || "EUR").toUpperCase(),
      status: String(first?.status || "Neplatit"),
      expense_date: first?.expense_date || todayISO(),
      applyCategory: false,
      applyDate: false,
      applyCurrency: false,
      applyStatus: false,
      mainCategory: "",
      subCategory: "",
    }));

    setBulkQ("");
    setBulkOpen(true);
  };

  const closeBulk = () => {
    if (bulkSaving) return;
    setBulkOpen(false);
  };

  const bulkRows = useMemo(() => {
    const qq = bulkQ.trim().toLowerCase();
    if (!qq) return filtered;

    return filtered.filter((r) => {
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
  }, [filtered, bulkQ]);

  const selectedCount = useMemo(() => {
    let n = 0;
    for (const r of filtered) if (selectedIds[r.id]) n += 1;
    return n;
  }, [selectedIds, filtered]);

  const bulkSubOptions = useMemo(() => {
    const m = bulkPatch.mainCategory;
    if (!m) return [];
    const list = CATEGORY_TREE.business[m] || [];
    return list;
  }, [bulkPatch.mainCategory]);

  const toggleAllBulk = (checked: boolean) => {
    const map: Record<string, boolean> = {};
    for (const r of bulkRows) map[r.id] = checked;
    // preserve selections outside search? we’ll merge
    setSelectedIds((prev) => {
      const out = { ...prev };
      for (const r of bulkRows) out[r.id] = checked;
      return out;
    });
  };

  const applyBulk = async () => {
    const ids = filtered.filter((r) => selectedIds[r.id]).map((r) => r.id);
    if (ids.length === 0) return alert("Selectează cel puțin 1 cheltuială.");

    // Build patch payload
    let nextCategory: string | null = null;
    if (bulkPatch.applyCategory) {
      const cat = buildCategory(bulkPatch.mainCategory, bulkPatch.subCategory);
      if (!cat) return alert("Pentru categorie: selectează main + sub.");
      nextCategory = cat;
    }

    const nextDate = bulkPatch.applyDate ? (bulkPatch.expense_date || null) : null;
    const nextCurrency = bulkPatch.applyCurrency
      ? String(bulkPatch.currency || "").toUpperCase()
      : null;
    const nextStatus = bulkPatch.applyStatus ? String(bulkPatch.status || "") : null;

    setBulkSaving(true);
    try {
      // Update sequentially (safe) – dacă vrei mai rapid: Promise.all cu limit
      for (const id of ids) {
        const payload: Partial<DbExpense> & { id: string } = { id };

        if (nextCategory != null) payload.category = nextCategory;
        if (nextDate != null) payload.expense_date = nextDate;
        if (nextCurrency != null) payload.currency = nextCurrency;
        if (nextStatus != null) payload.status = nextStatus as any;

        // Keep brand untouched.
        await upsertDb(payload);
      }

      setBulkOpen(false);
      await reload();
    } catch (e: any) {
      alert(e?.message || "Bulk update failed.");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <TopAdminBar
        period={period}
        setPeriod={(p) => setPeriod(p)}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
      />

      <DashboardCards
        baseCount={base.length}
        brandFilter={mode === "business" ? brandFilter : "Personal"}
        urgentOnly={urgentOnly}
        setUrgentOnly={setUrgentOnly}
        toggleBrand={toggleBrand}
        resetCategoryFilter={() => {
          resetCategoryFilter();
        }}
        dashboardTotal={dashboard.total}
        dashboardByBrand={dashboard.byBrand}
        urgentAgg={urgentAgg}
        brands={brandsForCards}
      />

      <CategorySection
        selectedBrandLabel={selectedBrandLabel}
        selectedCategoryLabel={selectedCategoryLabel}
        urgentOnly={urgentOnly}
        catMetric={catMetric}
        setCatMetric={setCatMetric}
        availableBaseCats={availableBaseCats}
        baseCategory={baseCategory}
        setBaseCategory={(b) => {
          setBaseCategory(b as any);
          setSubCategory("all");
        }}
        availableSubCats={availableSubCats}
        subCategory={subCategory}
        setSubCategory={setSubCategory}
        subCards={subCards}
      />

      {/* Actions row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <ImportXlsxButton
          year={new Date().getFullYear()}
          brand={mode === "personal" ? "Personal" : (brandFilter !== "all" ? brandFilter : "Mozas")}
          currency="EUR"
          status="Neplatit"
          onImport={async (payloads) => {
            const dbPayloads = payloads.map((p) => ({
              ...p,
              brand: mode === "personal" ? "Personal" : p.brand,
              source: "manual" as const,
              status: (p.status as DbExpense["status"]) ?? undefined,
            }));
            await insertMany(dbPayloads);
          }}
        />

        <button
          type="button"
          onClick={openBulk}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-200"
          title="Bulk edit pentru rândurile filtrate"
        >
          <Pencil className="h-4 w-4" />
          Bulk edit
        </button>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow"
        >
          <Plus className="h-4 w-4" />
          New expense
        </button>
      </div>

      <FiltersRow
        q={q}
        setQ={setQ}
        brandFilter={mode === "business" ? brandFilter : "Personal"}
        setBrandFilter={(v) => {
          setUrgentOnly(false);
          resetCategoryFilter();
          if (mode === "business") setBrandFilter(v);
        }}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <ExpenseTable loading={loading} rows={filtered} onEdit={openEdit} onDelete={onDelete} />

      <ExpenseEditorModal
        editorOpen={editorOpen}
        editing={editing}
        setEditing={setEditing}
        saving={saving}
        closeEditor={closeEditor}
        onPickReceipt={onPickReceipt}
        onSave={onSave}
      />

      {/* =========================
          BULK EDIT MODAL
         ========================= */}
      <ModalShell open={bulkOpen} title="Bulk edit expenses" onClose={closeBulk}>
        <div className="space-y-4">
          {/* Patch controls */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-semibold text-slate-900">Selectare</div>
              <div className="text-sm text-slate-600">
                Selectate: <span className="font-semibold text-slate-900">{selectedCount}</span> /{" "}
                <span className="font-semibold text-slate-900">{filtered.length}</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllBulk(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <CheckSquare className="h-4 w-4" />
                  Select all (in search)
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllBulk(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <Square className="h-4 w-4" />
                  Clear (in search)
                </button>
              </div>

              <div className="mt-3">
                <input
                  value={bulkQ}
                  onChange={(e) => setBulkQ(e.target.value)}
                  placeholder="Search inside bulk list…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="lg:col-span-8 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="mb-2 text-sm font-semibold text-slate-900">Modificări</div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Category */}
                <div className="rounded-2xl border border-slate-100 p-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={bulkPatch.applyCategory}
                      onChange={(e) =>
                        setBulkPatch((p) => ({ ...p, applyCategory: e.target.checked }))
                      }
                    />
                    Category / Subcategory
                  </label>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <select
                      disabled={!bulkPatch.applyCategory}
                      value={bulkPatch.mainCategory}
                      onChange={(e) =>
                        setBulkPatch((p) => ({
                          ...p,
                          mainCategory: (e.target.value as any) || "",
                          subCategory: "",
                        }))
                      }
                      className={clsx(
                        "w-full rounded-xl border px-3 py-2 text-sm",
                        bulkPatch.applyCategory
                          ? "border-slate-200 bg-white"
                          : "border-slate-100 bg-slate-50 text-slate-400"
                      )}
                    >
                      <option value="">Select main</option>
                      <option value="Operational">Operational</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Employees">Employees</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>

                    <select
                      disabled={!bulkPatch.applyCategory || !bulkPatch.mainCategory}
                      value={bulkPatch.subCategory}
                      onChange={(e) =>
                        setBulkPatch((p) => ({ ...p, subCategory: e.target.value }))
                      }
                      className={clsx(
                        "w-full rounded-xl border px-3 py-2 text-sm",
                        bulkPatch.applyCategory && bulkPatch.mainCategory
                          ? "border-slate-200 bg-white"
                          : "border-slate-100 bg-slate-50 text-slate-400"
                      )}
                    >
                      <option value="">Select sub</option>
                      {bulkSubOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="rounded-2xl border border-slate-100 p-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={bulkPatch.applyDate}
                      onChange={(e) =>
                        setBulkPatch((p) => ({ ...p, applyDate: e.target.checked }))
                      }
                    />
                    Expense date
                  </label>
                  <input
                    type="date"
                    disabled={!bulkPatch.applyDate}
                    value={bulkPatch.expense_date}
                    onChange={(e) =>
                      setBulkPatch((p) => ({ ...p, expense_date: e.target.value }))
                    }
                    className={clsx(
                      "mt-2 w-full rounded-xl border px-3 py-2 text-sm",
                      bulkPatch.applyDate
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    )}
                  />
                </div>

                {/* Currency */}
                <div className="rounded-2xl border border-slate-100 p-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={bulkPatch.applyCurrency}
                      onChange={(e) =>
                        setBulkPatch((p) => ({ ...p, applyCurrency: e.target.checked }))
                      }
                    />
                    Currency
                  </label>
                  <select
                    disabled={!bulkPatch.applyCurrency}
                    value={bulkPatch.currency}
                    onChange={(e) =>
                      setBulkPatch((p) => ({ ...p, currency: e.target.value }))
                    }
                    className={clsx(
                      "mt-2 w-full rounded-xl border px-3 py-2 text-sm",
                      bulkPatch.applyCurrency
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    )}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-slate-100 p-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={bulkPatch.applyStatus}
                      onChange={(e) =>
                        setBulkPatch((p) => ({ ...p, applyStatus: e.target.checked }))
                      }
                    />
                    Status
                  </label>
                  <select
                    disabled={!bulkPatch.applyStatus}
                    value={bulkPatch.status}
                    onChange={(e) =>
                      setBulkPatch((p) => ({ ...p, status: e.target.value }))
                    }
                    className={clsx(
                      "mt-2 w-full rounded-xl border px-3 py-2 text-sm",
                      bulkPatch.applyStatus
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    )}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={closeBulk}
                  disabled={bulkSaving}
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyBulk}
                  disabled={bulkSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
                >
                  {bulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Apply to selected
                </button>
              </div>
            </div>
          </div>

          {/* Rows selector */}
          <div className="rounded-2xl border border-slate-100 bg-white">
            <div className="max-h-[55vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-100">
                    <th className="w-12 px-3 py-3"></th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Date</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Vendor</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Brand</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Category</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Amount</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkRows.map((r) => {
                    const checked = !!selectedIds[r.id];
                    return (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
                            onClick={() =>
                              setSelectedIds((prev) => ({ ...prev, [r.id]: !checked }))
                            }
                            aria-label="Toggle selection"
                          >
                            {checked ? (
                              <CheckSquare className="h-4 w-4 text-slate-900" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{r.expense_date || "-"}</td>
                        <td className="px-3 py-2 text-slate-900 font-medium">
                          {r.vendor || "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{r.brand || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">{r.category || "-"}</td>
                        <td className="px-3 py-2 text-slate-900 font-semibold">
                          {String(r.currency || "").toUpperCase()} {Number(r.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{String(r.status || "-")}</td>
                      </tr>
                    );
                  })}

                  {bulkRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        No rows match this search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
