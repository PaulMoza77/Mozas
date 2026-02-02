// src/lib/expensesApi.ts
import { supabase } from "./supabase";

export type DbExpense = {
  id: string;
  expense_date: string | null; // YYYY-MM-DD
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  vat: number | null;
  category: string | null;
  brand: string | null;
  note: string | null;

  receipt_url: string | null;
  source: "manual" | "ai";
  ai_confidence: number | null;
  ai_raw: any | null;
  status: "draft" | "pending_ai" | "ready" | "confirmed" | "error";

  created_at: string;
  updated_at: string;
};

export async function fetchExpenses(params?: {
  brand?: string;
  status?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
  limit?: number;
}) {
  let q = supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params?.brand) q = q.eq("brand", params.brand);
  if (params?.status) q = q.eq("status", params.status);
  if (params?.date_from) q = q.gte("expense_date", params.date_from);
  if (params?.date_to) q = q.lte("expense_date", params.date_to);
  if (params?.limit) q = q.limit(params.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as DbExpense[];
}

export async function upsertExpenseDb(payload: Partial<DbExpense> & { id?: string }) {
  const { data, error } = await supabase
    .from("expenses")
    .upsert(payload as any, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbExpense;
}

export async function deleteExpenseDb(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
