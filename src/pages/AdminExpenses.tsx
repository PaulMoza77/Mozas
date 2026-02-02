// src/pages/admin/AdminExpenses.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Upload,
  X,
  Trash2,
  Save,
  FileText,
  Search,
  RefreshCw,
  Sparkles,
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
  return d.toISOString().slice(0, 10);
}

function toMoney(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

function sumAmount(rows: DbExpense[], brand?: string) {
  let s = 0;
  for (const r of rows) {
    if (brand && (r.brand || "") !== brand) continue;
    const v = Number(r.amount);
    if (Number.isFinite(v)) s += v;
  }
  return s;
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
  disabled,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        disabled={disabled}
        className="absolute inset-0 bg-black/40 disabled:opacity-60"
      />
      <div className="relative w-full sm:w-[min(980px,92vw)] max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl">
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
            disabled={disabled}
            className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2 disabled:opacity-60"
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

type Draft = {
  id?: string;

  expense_date: string; // YYYY-MM-DD
  vendor: string;
  amount: string;
  currency: string;
  vat: string;
  category: string;
  brand: string;
  note: string;

  receipt_url: string;
  receiptPreview: string;
  receiptFile?: File | null;

  status: DbExpense["status"];
};

const BUSINESS = [
  "TheMozas",
  "Volocar",
  "TDG",
  "GetSureDrive",
  "BRNDLY",
  "Starscale",
  "Personal",
] as const;

const BRAND_OPTIONS = BUSINESS;

const CURRENCY_OPTIONS = ["AED", "EUR", "USD", "RON"] as const;

const STATUS_OPTIONS: Array<DbExpense["status"] | "all"> = [
  "all",
  "draft",
  "pending_ai",
  "ready",
  "confirmed",
  "error",
];

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

async function parseReceiptAI(input: {
  receiptUrl: string;
  hint?: {
    vendor?: string;
    amount?: number | null;
    currency?: string | null;
    date?: string | null;
  };
}) {
  const res = await fetch("/api/parse-receipt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "AI parse failed");
  }

  return (await res.json()) as {
    vendor?: string | null;
    amount?: number | null;
    currency?: string | null;
    expense_date?: string | null; // YYYY-MM-DD
    vat?: number | null;
    category?: string | null;
    note?: string | null;
    confidence?: number | null;
    raw?: any;
  };
}

export default function AdminExpenses() {
  const [rows, setRows] = useState<DbExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    (typeof STATUS_OPTIONS)[number]
  >("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);

  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

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

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (brandFilter !== "all" && (r.brand || "") !== brandFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      if (!qq) return true;
      const hay = [r.vendor, r.brand, r.category, r.note, r.currency, r.status]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");
      return hay.includes(qq);
    });
  }, [rows, q, brandFilter, statusFilter]);

  const totalsByBrand = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of BUSINESS) map[b] = 0;

    for (const r of rows) {
      const b = (r.brand || "TheMozas").trim() || "TheMozas";
      if (!(b in map)) map[b] = 0;

      const v = Number(r.amount);
      if (Number.isFinite(v)) map[b] += v;
    }
    return map;
  }, [rows]);

  const overallTotal = useMemo(() => sumAmount(rows), [rows]);

  const openCreate = () => {
    setEditing({
      expense_date: todayISO(),
      vendor: "",
      amount: "",
      currency: "AED",
      vat: "",
      category: "",
      brand: "TheMozas",
      note: "",
      receipt_url: "",
      receiptPreview: "",
      receiptFile: null,
      status: "draft",
    });
    setEditorOpen(true);
  };

  const openEdit = (r: DbExpense) => {
    setEditing({
      id: r.id,
      expense_date: r.expense_date || todayISO(),
      vendor: r.vendor || "",
      amount: r.amount == null ? "" : String(r.amount),
      currency: (r.currency || "AED") as string,
      vat: r.vat == null ? "" : String(r.vat),
      category: r.category || "",
      brand: (r.brand || "TheMozas") as string,
      note: r.note || "",
      receipt_url: r.receipt_url || "",
      receiptPreview: r.receipt_url || "",
      receiptFile: null,
      status: r.status || "draft",
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving || aiBusy) return;
    setEditorOpen(false);
    setEditing(null);
  };

  const onPickReceipt = (file: File) => {
    if (!editing) return;
    const preview = URL.createObjectURL(file);
    setEditing({ ...editing, receiptFile: file, receiptPreview: preview });
  };

  const onRunAI = async () => {
    if (!editing) return;
    if (!editing.receipt_url && !editing.receiptFile) {
      alert("Upload receipt first.");
      return;
    }

    setAiBusy(true);
    try {
      let receipt_url = editing.receipt_url || "";

      if (!receipt_url && editing.receiptFile) {
        receipt_url = await uploadReceipt(editing.receiptFile);
        setEditing((prev) =>
          prev
            ? {
                ...prev,
                receipt_url,
                receiptPreview: prev.receiptPreview || receipt_url,
              }
            : prev
        );
      }

      const hintAmount =
        editing.amount.trim() === ""
          ? null
          : Number(editing.amount.replace(",", "."));

      const parsed = await parseReceiptAI({
        receiptUrl: receipt_url,
        hint: {
          vendor: editing.vendor || undefined,
          amount: Number.isFinite(hintAmount as any) ? (hintAmount as any) : null,
          currency: editing.currency || undefined,
          date: editing.expense_date || undefined,
        },
      });

      setEditing((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          vendor: String(parsed.vendor ?? prev.vendor ?? ""),
          amount:
            parsed.amount == null ? prev.amount : String(parsed.amount ?? ""),
          currency: String(parsed.currency ?? prev.currency ?? "AED"),
          expense_date: String(
            parsed.expense_date ?? prev.expense_date ?? todayISO()
          ),
          vat: parsed.vat == null ? prev.vat : String(parsed.vat),
          category: String(parsed.category ?? prev.category ?? ""),
          note: String(parsed.note ?? prev.note ?? ""),
          status: "ready",
        };
      });
    } catch (e: any) {
      alert(e?.message || "AI parse failed.");
    } finally {
      setAiBusy(false);
    }
  };

  const onSave = async () => {
    if (!editing) return;

    const expense_date = editing.expense_date || null;
    const vendor = editing.vendor.trim() || null;

    const amountNum =
      editing.amount.trim() === ""
        ? null
        : Number(editing.amount.replace(",", "."));

    const vatNum =
      editing.vat.trim() === "" ? null : Number(editing.vat.replace(",", "."));

    if (amountNum != null && !Number.isFinite(amountNum))
      return alert("Amount invalid.");
    if (vatNum != null && !Number.isFinite(vatNum))
      return alert("VAT invalid.");

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
        currency: editing.currency || "AED",
        vat: vatNum,
        category: editing.category.trim() || null,
        brand: editing.brand.trim() || null,
        note: editing.note.trim() || null,
        receipt_url,
        source: "manual",
        status: editing.status || (receipt_url ? "pending_ai" : "draft"),
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Expenses
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              Track costs + scan receipts
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Manual entries + receipt uploads. AI parsing via{" "}
              <span className="font-semibold">/api/parse-receipt</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold shadow"
            >
              <Plus className="h-4 w-4" />
              New expense
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {toMoney(overallTotal)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Sum of all rows (currencies mixed for now).
            </p>
          </div>

          {BUSINESS.slice(0, 3).map((b) => (
            <div
              key={b}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs text-slate-500">{b}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {toMoney(totalsByBrand[b])}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Total for this business.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {BUSINESS.slice(3).map((b) => (
            <div
              key={b}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs text-slate-500">{b}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {toMoney(totalsByBrand[b])}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Total for this business.
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_220px_220px]">
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
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All brands</option>
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
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
                    <td className="px-4 py-3 text-slate-700">
                      {r.expense_date || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {r.vendor || "—"}
                      </div>
                      {r.note ? (
                        <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {r.note}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.brand || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.category || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {(r.currency || "AED") + " " + toMoney(r.amount)}
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
                          className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor */}
      {editorOpen && editing ? (
        <ModalShell
          title={editing.id ? "Edit expense" : "New expense"}
          subtitle="Fill details + upload receipt. You can run AI parse before Save."
          onClose={closeEditor}
          disabled={saving || aiBusy}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
            {/* Left fields */}
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Date
                  </p>
                  <input
                    type="date"
                    value={editing.expense_date}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        expense_date: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    disabled={saving || aiBusy}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Brand
                  </p>
                  <select
                    value={editing.brand}
                    onChange={(e) =>
                      setEditing({ ...editing, brand: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    disabled={saving || aiBusy}
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  Vendor
                </p>
                <input
                  value={editing.vendor}
                  onChange={(e) =>
                    setEditing({ ...editing, vendor: e.target.value })
                  }
                  placeholder="e.g. ADNOC, Amazon, Hotel…"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  disabled={saving || aiBusy}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_140px] gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Amount
                  </p>
                  <input
                    value={editing.amount}
                    onChange={(e) =>
                      setEditing({ ...editing, amount: e.target.value })
                    }
                    placeholder="e.g. 125.50"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    inputMode="decimal"
                    disabled={saving || aiBusy}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Currency
                  </p>
                  <select
                    value={editing.currency}
                    onChange={(e) =>
                      setEditing({ ...editing, currency: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    disabled={saving || aiBusy}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    VAT (optional)
                  </p>
                  <input
                    value={editing.vat}
                    onChange={(e) =>
                      setEditing({ ...editing, vat: e.target.value })
                    }
                    placeholder="e.g. 5.00"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    inputMode="decimal"
                    disabled={saving || aiBusy}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  Category (optional)
                </p>
                <input
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  placeholder="e.g. Fuel, Ads, Office…"
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  disabled={saving || aiBusy}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  Note (optional)
                </p>
                <textarea
                  value={editing.note}
                  onChange={(e) =>
                    setEditing({ ...editing, note: e.target.value })
                  }
                  placeholder="Optional note…"
                  className="w-full min-h-[90px] rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  disabled={saving || aiBusy}
                />
              </div>
            </div>

            {/* Right receipt */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Receipt</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a photo, then hit AI Parse to auto-fill fields.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onRunAI}
                  disabled={
                    aiBusy ||
                    saving ||
                    (!editing.receiptFile && !editing.receipt_url)
                  }
                  className={clsx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold border",
                    aiBusy
                      ? "bg-slate-100 text-slate-400 border-slate-200"
                      : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                  )}
                  title="Parse receipt with AI"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiBusy ? "Parsing…" : "AI Parse"}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="aspect-[4/3] w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                  {editing.receiptPreview ? (
                    <img
                      src={editing.receiptPreview}
                      alt="Receipt"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="h-6 w-6" />
                      <span className="text-xs">No receipt</span>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onPickReceipt(f);
                          e.currentTarget.value = "";
                        }}
                        disabled={saving || aiBusy}
                      />
                      <Upload className="h-4 w-4" />
                      Upload
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          receiptFile: null,
                          receiptPreview: "",
                          receipt_url: "",
                          status: editing.id ? editing.status : "draft",
                        })
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      disabled={saving || aiBusy}
                    >
                      Clear
                    </button>
                  </div>

                  {editing.receipt_url ? (
                    <p className="mt-2 text-[11px] text-slate-500 break-all">
                      Current: {editing.receipt_url}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={saving || aiBusy}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving || aiBusy}
                  className={clsx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold border",
                    saving
                      ? "bg-slate-100 text-slate-400 border-slate-200"
                      : "bg-slate-900 text-white border-slate-900 hover:opacity-95"
                  )}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
