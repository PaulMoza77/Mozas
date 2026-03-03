import * as XLSX from "xlsx";
import type { Revenue } from "../pages/admin/revenues/types";

type ParsedRevenue = Omit<Revenue, "id">;

function norm(s: unknown) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function pick(row: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return row[k];
  }
  return null;
}

function toISODate(v: any): string | null {
  if (!v) return null;

  if (v instanceof Date && !isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  if (typeof v === "number") {
    const dt = XLSX.SSF.parse_date_code(v);
    if (dt?.y && dt?.m && dt?.d) {
      const y = dt.y;
      const m = String(dt.m).padStart(2, "0");
      const d = String(dt.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  const s = String(v).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD.MM.YYYY / DD/MM/YYYY
  const m1 = s.match(/^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})$/);
  if (m1) {
    const dd = String(Number(m1[1])).padStart(2, "0");
    const mm = String(Number(m1[2])).padStart(2, "0");
    const yy = m1[3];
    return `${yy}-${mm}-${dd}`;
  }

  return null;
}

function toAmount(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && isFinite(v)) return Math.round(v * 100) / 100;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  if (!isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

/**
 * XLSX header accepted:
 * amount | date | market | brand | description
 * (case-insensitive)
 */
export async function parseRevenuesXlsx(file: File): Promise<ParsedRevenue[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
  if (!raw.length) return [];

  const rows = raw.map((r) => {
    const out: Record<string, any> = {};
    for (const k of Object.keys(r)) out[norm(k)] = r[k];
    return out;
  });

  const parsed: ParsedRevenue[] = [];

  for (const r of rows) {
    const amountVal = pick(r, ["amount", "suma", "total", "value"]);
    const dateVal = pick(r, ["date", "data"]);
    const marketVal = pick(r, ["market", "piata", "piață"]);
    const brandVal = pick(r, ["brand"]);
    const descVal = pick(r, ["description", "descriere", "note"]);

    const amount = toAmount(amountVal);
    const date = toISODate(dateVal);

    const market = String(marketVal ?? "").trim();
    const brand = String(brandVal ?? "").trim();
    const description = String(descVal ?? "").trim();

    if (!date || amount === null || !market || !brand) continue;

    parsed.push({
      amount,
      date,
      market,
      brand,
      description: description || "",
    });
  }

  return parsed;
}