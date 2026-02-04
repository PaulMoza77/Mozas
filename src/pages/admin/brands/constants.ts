// src/pages/admin/brands/constants.ts
import type { BrandRow, BadgeOption } from "./types";

export const BADGE_OPTIONS: readonly BadgeOption[] = ["Global", "EU", "SUA", "UAE", "Asia"] as const;

// bucket name in Supabase Storage
export const LOGO_BUCKET = "mozas-assets";

export const DEFAULT_HOME_BRANDS: Array<Omit<BrandRow, "id" | "created_at" | "updated_at">> = [
  {
    name: "Volocar",
    slug: "volocar",
    description:
      "Premium mobility marketplace across the UAE & EU: Rentals, Monthly, Sales, Concierge & Elite Services.",
    logo_url: null,
    overview_url: "https://volocar.ae",
    badges: ["UAE", "EU"],
    sort_order: 10,
    is_active: true,
  },
  {
    name: "TheDigitalGifter",
    slug: "thedigitalgifter",
    description: "AI-powered greeting cards, videos & custom image creation. Personalized gifts in seconds.",
    logo_url: null,
    overview_url: "https://thedigitalgifter.com",
    badges: ["Global"],
    sort_order: 20,
    is_active: true,
  },
  {
    name: "Starscale",
    slug: "starscale",
    description: "Creative digital agency & personal branding accelerator: content, ads, growth, performance.",
    logo_url: null,
    overview_url: "https://starscale.ro",
    badges: ["Global"],
    sort_order: 30,
    is_active: true,
  },
  {
    name: "BRNDLY.",
    slug: "brndly",
    description: "Branding & creative asset studio: logos, packaging, product visuals, and brand systems.",
    logo_url: null,
    overview_url: "https://brndly.ro",
    badges: ["EU", "UAE"],
    sort_order: 40,
    is_active: true,
  },
];
