import type { ExpenseStatus } from "./types";

export const BRAND_DISPLAY: Record<string, string> = {
  Mozas: "Mozas",
  Volocar: "Volocar",
  TDG: "TDG",
  Brandly: "Brandly",
  GetSureDrive: "GetSureDrive",
  Personal: "Personal",
};

export const BRAND_OPTIONS = Object.keys(BRAND_DISPLAY);

export const CURRENCY_OPTIONS = ["AED", "EUR", "RON", "USD"] as const;
export type Currency = (typeof CURRENCY_OPTIONS)[number];

export const CATEGORY_TREE = {
  business: {
    Operational: [
      "Combustibil",
      "Parcari",
      "Transport",
      "Taxi",
      "Avion",
      "Cazare",
      "Mentenanta",
      "Service",
      "Piese",
      "Spalatorie",
      "Amenzi",
      "Asigurari",
      "RCA",
      "CASCO",
      "Rovinieta",
      "Taxe",
      "Utilitati",
      "Chirie",
      "Contabilitate",
      "Avocat",
      "Comisioane",
      "Altele",
    ],
    Marketing: ["Reclame", "Google Ads", "Meta Ads", "TikTok", "Influenceri", "PR", "Design", "Altele"],
    Employees: ["Salarii", "Comisioane", "Bonusuri", "Contractori", "Altele"],
    Miscellaneous: ["Software", "Abonamente", "Echipamente", "Cadouri", "Diverse", "Altele"],
  },
  personal: {
    Personal: ["Mancare", "Transport", "Sanatate", "Chirie", "Utilitati", "Shopping", "Diverse"],
  },
} as const;

type StatusTone = "neutral" | "success" | "warning" | "danger";

export const STATUS_META: Record<ExpenseStatus, { label: string; tone: StatusTone }> = {
  Platit: { label: "Plătit", tone: "success" },
  Urgent: { label: "Urgent", tone: "danger" },
  "In Asteptare": { label: "În așteptare", tone: "warning" },
  Neplatit: { label: "Neplătit", tone: "neutral" },
  Preplatit: { label: "Preplătit", tone: "success" },
  Anulat: { label: "Anulat", tone: "neutral" },
};
// Period presets (used in TopAdminBar)
export const PERIODS: Array<{ key: "today" | "last7" | "last30" | "custom" | "all"; label: string }> = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "custom", label: "Custom" },
  { key: "all", label: "All time" },
];
