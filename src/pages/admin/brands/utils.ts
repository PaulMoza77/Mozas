// src/pages/admin/brands/utils.ts
export function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isUrlLike(v: string) {
  const s = String(v || "").trim();
  if (!s) return false;
  return /^https?:\/\/.+/i.test(s);
}

export function extFromFile(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".jpg")) return "jpg";
  if (name.endsWith(".jpeg")) return "jpeg";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".svg")) return "svg";
  return "png";
}

export function toDraftFromRow(r: {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  logo_url?: string | null;
  overview_url?: string | null;
  badges?: string[] | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}) {
  return {
    id: r.id,
    name: r.name || "",
    slug: r.slug || "",
    description: r.description || "",
    logo_url: r.logo_url || "",
    overview_url: r.overview_url || "",
    badges: Array.isArray(r.badges) ? r.badges : [],
    sort_order: Number(r.sort_order ?? 100),
    is_active: Boolean(r.is_active),
  };
}

export function emptyDraft() {
  return {
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    overview_url: "",
    badges: [] as string[],
    sort_order: 100,
    is_active: true,
  };
}
