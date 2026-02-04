import * as XLSX from "xlsx";

const MONTHS_RO: Record<string, number> = {
  IANUARIE: 1,
  FEBRUARIE: 2,
  MARTIE: 3,
  APRILIE: 4,
  MAI: 5,
  IUNIE: 6,
  IULIE: 7,
  AUGUST: 8,
  SEPTEMBRIE: 9,
  OCTOMBRIE: 10,
  NOIEMBRIE: 11,
  DECEMBRIE: 12,
};

function norm(v: any) {
  return String(v ?? "").trim();
}

function normUpper(v: any) {
  return norm(v).toUpperCase();
}

function toNumber(v: any): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace(/\s/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function dateISO(year: number, month: number, day = 1) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export type ImportExpensePayload = {
  expense_date: string;
  vendor: string | null;
  amount: number | null;
  currency: string;
  vat: number | null;
  category: string;
  brand: string | null;
  note: string | null;
  receipt_url: string | null;
  source: "xlsx";
  status: string;
};

export async function parseVolocarDubaiXlsx(
  file: File,
  opts: {
    year: number;
    brand: string;
    currency: string;
    status: string;
    notePrefix?: string;
  }
): Promise<ImportExpensePayload[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const first = wb.SheetNames[0];
  const ws = wb.Sheets[first];
  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as any[][];

  // Find header row that contains month names (IANUARIE...DECEMBRIE)
  let headerRow = -1;
  for (let i = 0; i < Math.min(grid.length, 30); i++) {
    const row = grid[i] || [];
    const hasMonth = row.some((c) => MONTHS_RO[normUpper(c)] != null);
    if (hasMonth) {
      headerRow = i;
      break;
    }
  }
  if (headerRow === -1) {
    throw new Error("Nu găsesc header-ul cu luni (IANUARIE...DECEMBRIE) în XLSX.");
  }

  // Map month -> column index
  const monthCols: Array<{ month: number; col: number }> = [];
  const hdr = grid[headerRow] || [];
  for (let c = 0; c < hdr.length; c++) {
    const m = MONTHS_RO[normUpper(hdr[c])];
    if (m) monthCols.push({ month: m, col: c });
  }
  if (monthCols.length === 0) {
    throw new Error("Nu găsesc coloanele lunilor în header.");
  }

  // Detect where "section" and "item" are (layout-ul tău: col0=section, col1=item, rest = luni)
  // În XLSX-ul tău, de obicei:
  // A = OPERATIONAL/MARKETING/ALTELE (uneori gol), B = AVION/CAZARE etc.
  const SECTION_NAMES = new Set(["OPERATIONAL", "MARKETING", "ALTELE"]);

  let currentSection = "";
  const out: ImportExpensePayload[] = [];

  for (let r = headerRow + 1; r < grid.length; r++) {
    const row = grid[r] || [];
    const col0 = normUpper(row[0]);
    const col1 = norm(row[1]);

    // Update section
    if (SECTION_NAMES.has(col0)) {
      currentSection = col0; // OPERATIONAL / MARKETING / ALTELE
      continue;
    }

    // skip empty lines
    if (!currentSection) continue;
    if (!col1) continue;

    // skip totals
    if (normUpper(col1) === "TOTAL") continue;

    const vendor = col1;

    for (const { month, col } of monthCols) {
      const val = toNumber(row[col]);
      if (val == null || val === 0) continue;

      out.push({
        expense_date: dateISO(opts.year, month, 1),
        vendor: vendor || null,
        amount: val,
        currency: (opts.currency || "AED").toUpperCase(),
        vat: null,
        category: `${currentSection}/${vendor}`,
        brand: opts.brand || null,
        note: `${opts.notePrefix || "Import XLSX"}: ${file.name}`,
        receipt_url: null,
        source: "xlsx",
        status: opts.status,
      });
    }
  }

  return out;
}
