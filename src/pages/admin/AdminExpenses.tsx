// src/pages/admin/AdminExpenses.tsx
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

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

import type { CatCardMetric, Draft, PeriodKey, StatusFilter, DbExpense } from "./expenses/types";
import { BRAND_DISPLAY, CATEGORY_TREE } from "./expenses/constants";

import {
  buildCategory,
  parseISOToDate,
  periodStart,
  splitCategory,
  sumByCurrency,
  todayISO,
} from "./expenses/utils";

import { deleteReceipt, uploadReceipt } from "./expenses/storage";

type BaseCat = "Operational" | "Marketing" | "Employees" | "Miscellaneous";
const BASE_ORDER: BaseCat[] = ["Operational", "Marketing", "Employees", "Miscellaneous"];

function mapLegacyMainToBase(mainRaw: string): BaseCat | null {
  const m = String(mainRaw || "").trim();

  // ✅ already new
  if (m === "Operational") return "Operational";
  if (m === "Marketing") return "Marketing";
  if (m === "Employees") return "Employees";
  if (m === "Miscellaneous") return "Miscellaneous";

  // ✅ legacy -> new base
  if (m === "Payroll") return "Employees";
  if (m === "Legal & Admin") return "Miscellaneous";
  if (m === "Software") return "Miscellaneous";

  // if empty/unknown
  if (!m) return null;
  return "Miscellaneous";
}

export default function AdminExpenses() {
  const { rows, loading, reload, upsertDb, deleteDb, removeLocal, insertMany } = useExpenses();

  const [period, setPeriod] = useState<PeriodKey>("month");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [urgentOnly, setUrgentOnly] = useState(false);

  // ✅ NEW: base + sub filters
  const [baseCategory, setBaseCategory] = useState<BaseCat | "all">("all");
  const [subCategory, setSubCategory] = useState<string | "all">("all");

  const [catMetric, setCatMetric] = useState<CatCardMetric>("sum");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  // -----------------------
  // Filters: base/scope/final
  // -----------------------
  const base = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const start = periodStart(period);

    return rows.filter((r) => {
      if (start) {
        const d = parseISOToDate(r.expense_date);
        if (!d) return false;
        if (d < start) return false;
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
  }, [rows, q, statusFilter, period]);

  const scope = useMemo(() => {
    let out = base;
    if (brandFilter !== "all") out = out.filter((r) => (r.brand || "") === brandFilter);
    if (urgentOnly) out = out.filter((r) => (r.status as any) === "Urgent");
    return out;
  }, [base, brandFilter, urgentOnly]);

  // ✅ derived base/sub from stored "Main / Sub"
  const filtered = useMemo(() => {
    let out = scope;

    if (baseCategory !== "all") {
      out = out.filter((r) => {
        const cat = splitCategory(r.category || "");
        const b = mapLegacyMainToBase(cat.main);
        return b === baseCategory;
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

    const byBrand: Record<string, Record<string, number>> = {
      Mozas: {},
      Volocar: {},
      TDG: {},
      Brandly: {},
      GetSureDrive: {},
      Personal: {},
    };

    for (const r of base) {
      const b = (r.brand || "") as keyof typeof byBrand;
      if (!byBrand[b]) continue;

      const cur = (r.currency || "AED").toUpperCase();
      const amt = Number(r.amount);
      if (!Number.isFinite(amt)) continue;

      byBrand[b][cur] = (byBrand[b][cur] || 0) + amt;
    }

    return { total, byBrand };
  }, [base]);

  const urgentAgg = useMemo(() => {
    const urgentRows = base.filter((r) => (r.status as any) === "Urgent");
    return { count: urgentRows.length, sum: sumByCurrency(urgentRows) };
  }, [base]);

  // -----------------------
  // Category UI data (base + sub buttons)
  // -----------------------
  const availableBaseCats = useMemo(() => {
    const seen = new Set<BaseCat>();
    for (const r of scope) {
      const cat = splitCategory(r.category || "");
      const b = mapLegacyMainToBase(cat.main);
      if (b) seen.add(b);
    }
    // keep stable order
    return BASE_ORDER.filter((b) => seen.has(b));
  }, [scope]);

  const availableSubCats = useMemo(() => {
    // show subcats for selected base (or all base if baseCategory=all -> show none until choose)
    if (baseCategory === "all") return [];

    const set = new Set<string>();
    for (const r of scope) {
      const cat = splitCategory(r.category || "");
      const b = mapLegacyMainToBase(cat.main);
      if (b !== baseCategory) continue;
      const sub = String(cat.sub || "").trim();
      if (sub) set.add(sub);
    }

    // also include from tree (nice consistent list)
    const treeList = CATEGORY_TREE.business[baseCategory] || [];
    for (const s of treeList) set.add(s);

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [scope, baseCategory]);

  const subCards = useMemo(() => {
    // cards = aggregate by subcategory for current base selection
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
      const cur = (r.currency || "AED").toUpperCase();
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

  const toggleBrand = (b: string | "all") => {
    setBrandFilter((prev) => (prev === b ? "all" : b));
    setUrgentOnly(false);

    // reset category filters when switching brand
    setBaseCategory("all");
    setSubCategory("all");
  };

  // -----------------------
  // Editor open/close
  // -----------------------
  const openCreate = () => {
    setEditing({
      expense_date: todayISO(),
      vendor: "",
      amount: "",
      currency: "AED",
      vat: "",
      category: "",
      mainCategory: "",
      subCategory: "",
      brand: "Mozas",
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
      currency: (r.currency || "AED").toUpperCase(),
      vat: r.vat == null ? "" : String(r.vat),
      category: r.category || "",
      mainCategory: cat.main || "",
      subCategory: cat.sub || "",
      brand: r.brand || "Mozas",
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

  useVendorCategorySuggest({ editorOpen, editing, setEditing, rows });
  useAiMock({ editorOpen, editing, setEditing });

  const onSave = async () => {
    if (!editing) return;

    const category = buildCategory(editing.mainCategory, editing.subCategory);
    if (!category) return alert("Categoria și subcategoria sunt obligatorii.");

    const expense_date = editing.expense_date || null;
    const vendor = editing.vendor.trim() || null;

    const amountNum =
      editing.amount.trim() === "" ? null : Number(editing.amount.replace(",", "."));
    const vatNum = editing.vat.trim() === "" ? null : Number(editing.vat.replace(",", "."));

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
        category,
        brand: editing.brand?.trim() || null,
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
    brandFilter === "all" ? "All brands" : BRAND_DISPLAY[brandFilter] || brandFilter;

  const selectedCategoryLabel =
    baseCategory === "all" ? "All categories" : baseCategory + (subCategory !== "all" ? ` / ${subCategory}` : "");

  return (
    <div className="space-y-5">
      <TopAdminBar period={period} setPeriod={setPeriod} />

      <DashboardCards
        baseCount={base.length}
        brandFilter={brandFilter}
        urgentOnly={urgentOnly}
        setUrgentOnly={setUrgentOnly}
        toggleBrand={toggleBrand}
        setCategoryFilter={() => {
          setBaseCategory("all");
          setSubCategory("all");
        }}
        dashboardTotal={dashboard.total}
        dashboardByBrand={dashboard.byBrand}
        urgentAgg={urgentAgg}
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
          setBaseCategory(b);
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
          brand={brandFilter !== "all" ? brandFilter : "Volocar"}
          currency="AED"
          status="Neplatit"
          onImport={async (payloads) => {
            const dbPayloads = payloads.map((p) => ({
              ...p,
              source: "manual" as const,
              status: (p.status as DbExpense["status"]) ?? undefined,
            }));
            await insertMany(dbPayloads);
          }}
        />

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
        brandFilter={brandFilter}
        setBrandFilter={(v) => {
          setUrgentOnly(false);
          setBaseCategory("all");
          setSubCategory("all");
          setBrandFilter(v);
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
    </div>
  );
}
