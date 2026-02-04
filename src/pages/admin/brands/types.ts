// src/pages/admin/brands/types.ts
export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  overview_url: string;
  badges: string[] | null;
  sort_order: number | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BrandDraft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  overview_url: string;
  badges: string[];
  sort_order: number;
  is_active: boolean;
};

export type BadgeOption = "Global" | "EU" | "SUA" | "UAE" | "Asia";
