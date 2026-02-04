// src/pages/admin/expenses/types.ts
import type { DbExpense } from "../../../lib/expensesApi";

export type AiSuggestion = {
  main: string;
  sub: string;
  confidence: number;
};

export const EXPENSE_STATUS = [
  "Platit",
  "Urgent",
  "In Asteptare",
  "Neplatit",
  "Preplatit",
  "Anulat",
] as const;

export type ExpenseStatus = (typeof EXPENSE_STATUS)[number];
export type StatusFilter = ExpenseStatus | "all";

export type PeriodKey = "day" | "week" | "month" | "qtr" | "year" | "all";
export type CatCardMetric = "sum" | "count";

export type Draft = {
  id?: string;
  expense_date: string;
  vendor: string;
  amount: string;
  currency: string;
  vat: string;

  // stored in DB as "Main / Sub"
  category: string;

  // editor structure
  mainCategory: string;
  subCategory: string;

  brand: string;
  note: string;

  aiSuggestion: AiSuggestion | null;

  receipt_url: string;
  receiptPreview: string;
  receiptFile?: File | null;

  // DB field – status/payment (NO schema change)
  status: ExpenseStatus;
};

export type { DbExpense };
