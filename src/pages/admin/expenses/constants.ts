// src/pages/admin/expenses/constants.ts
import type { ExpenseStatus, PeriodKey, StatusFilter } from "./types";

export const CATEGORY_TREE: {
  personal: Record<string, string[]>;
  business: Record<string, string[]>;
} = {
  personal: {
    Lifestyle: ["Food", "Transport", "Shopping", "Health", "Travel", "Other"],
    Home: ["Rent", "Utilities", "Internet", "Repairs", "Other"],
    Family: ["Kids", "Gifts", "Other"],
  },

  // ✅ ONLY 4 base categories (as requested)
  business: {
    Operational: [
      "Cazare",
      "Combustibil",
      "Mâncare",
      "Parcare",
      "Telefon",
      "Transport",
      "Consumabile",
      "Chirie",
      "Utilități",
      "Echipamente",
      "Mentenanță",
      "Mașină chirie",
      "Other",
    ],
    Marketing: ["Ads", "Influencers", "Content", "PR", "Posted", "TikTok", "Other"],
    Employees: ["Salarii", "Comisioane", "Contractori", "Bonuri", "Other"],
    Miscellaneous: [
      "Contabilitate",
      "Avocat",
      "Taxe",
      "Licențe",
      "SaaS",
      "Hosting",
      "Domains",
      "Tools",
      "Other",
    ],
  },
};

export const BRAND_OPTIONS = ["Mozas", "Volocar", "GetSureDrive", "TDG", "Brandly", "Personal"];

export const BRAND_DISPLAY: Record<string, string> = {
  Mozas: "TheMozas",
  Volocar: "Volocar",
  TDG: "TDG",
  Brandly: "BRANDLY",
  GetSureDrive: "GETSUREDRIVE",
  Personal: "Personal",
};

export const DASH_BRANDS = ["Mozas", "Volocar", "TDG", "Brandly", "GetSureDrive", "Personal"] as const;

export const CURRENCY_OPTIONS = ["AED", "EUR", "USD", "RON"];

export const STATUS_OPTIONS: StatusFilter[] = [
  "all",
  "Platit",
  "Urgent",
  "In Asteptare",
  "Neplatit",
  "Preplatit",
  "Anulat",
];

export const STATUS_META: Record<
  ExpenseStatus,
  { label: string; pill: string; icon?: "urgent" }
> = {
  Platit: { label: "Plătit", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  Urgent: { label: "Urgent", pill: "bg-rose-50 text-rose-700 ring-rose-200", icon: "urgent" },
  "In Asteptare": { label: "În așteptare", pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  Neplatit: { label: "Neplătit", pill: "bg-slate-50 text-slate-700 ring-slate-200" },
  Preplatit: { label: "Preplătit", pill: "bg-sky-50 text-sky-700 ring-sky-200" },
  Anulat: { label: "Anulat", pill: "bg-zinc-50 text-zinc-600 ring-zinc-200" },
};

export const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "day", label: "Zi" },
  { key: "week", label: "Săpt." },
  { key: "month", label: "Lună" },
  { key: "qtr", label: "3 luni" },
  { key: "year", label: "1 an" },
  { key: "all", label: "All time" },
];
