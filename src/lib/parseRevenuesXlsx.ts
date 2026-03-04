import * as XLSX from "xlsx";
import type { Revenue } from "../pages/admin/revenues/types";

type ParsedRevenue = Omit<Revenue, "id">;

function norm(s: unknown) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " "); // nbsp
}

function toISODate(v: any): string | null {
  if (v === null || v === undefined || v === "") return null;

  // Date object
  if (v instanceof Date && !isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Excel serial date
  if (typeof v === "number" && isFinite(v)) {
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

  // DD.MM.YYYY or DD/MM/YYYY
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
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && isFinite(v)) return Math.round(v * 100) / 100;

  // allow "1.234,56" and "1234,56"
  const s = String(v)
    .trim()
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove thousand dots
    .replace(",", ".");
  const n = Number(s);
  if (!isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function sheetToRows(wb: XLSX.WorkBook, headerRowIndex: number) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
    defval: "",
    raw: true,
    range: headerRowIndex, // 0 = first row, 1 = second row etc
  });
}

function normalizeKeys(row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(row)) out[norm(k)] = row[k];
  return out;
}

function hasAnyKey(rows: Record<string, any>[], keys: string[]) {
  const set = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) set.add(norm(k));
  return keys.some((k) => set.has(norm(k)));
}

/**
 * Acceptă:
 * 1) Template: amount,date,market,brand,description
 * 2) REZERVARI: DAT (date) + Tot. Incasat (amount) (+ optional: Provenienta/Oras/etc)
 */
export async function parseRevenuesXlsx(file: File): Promise<ParsedRevenue[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  // încercăm 2 variante: header pe primul rând, sau header pe al doilea rând (cum e des la REZERVARI)
  const raw0 = sheetToRows(wb, 0);
  const raw1 = sheetToRows(wb, 1);

  const rows0 = raw0.map(normalizeKeys);
  const rows1 = raw1.map(normalizeKeys);

  // Detect template vs rezervari
  const isTemplate0 =
    hasAnyKey(rows0, ["amount"]) && hasAnyKey(rows0, ["date"]) && hasAnyKey(rows0, ["market"]) && hasAnyKey(rows0, ["brand"]);
  const isTemplate1 =
    hasAnyKey(rows1, ["amount"]) && hasAnyKey(rows1, ["date"]) && hasAnyKey(rows1, ["market"]) && hasAnyKey(rows1, ["brand"]);

  const isRez0 =
    hasAnyKey(rows0, ["dat", "data"]) && hasAnyKey(rows0, ["tot. incasat", "tot incasat", "incasat", "total incasat"]);
  const isRez1 =
    hasAnyKey(rows1, ["dat", "data"]) && hasAnyKey(rows1, ["tot. incasat", "tot incasat", "incasat", "total incasat"]);

  let rows: Record<string, any>[] = rows0;
  let mode: "template" | "rezervari" | "unknown" = "unknown";

  if (isTemplate0) {
    rows = rows0;
    mode = "template";
  } else if (isTemplate1) {
    rows = rows1;
    mode = "template";
  } else if (isRez0) {
    rows = rows0;
    mode = "rezervari";
  } else if (isRez1) {
    rows = rows1;
    mode = "rezervari";
  }

  // DEBUG: vezi în console ce a detectat
  console.log("[parseRevenuesXlsx] mode =", mode, "rows =", rows.length);

  const out: ParsedRevenue[] = [];

  for (const r of rows) {
    if (mode === "template") {
      const amount = toAmount(r["amount"]);
      const date = toISODate(r["date"]);
      const market = String(r["market"] ?? "").trim();
      const brand = String(r["brand"] ?? "").trim();
      const description = String(r["description"] ?? "").trim();

      if (!date || amount === null || !market || !brand) continue;

      out.push({ amount, date, market, brand, description: description || "" });
      continue;
    }

    if (mode === "rezervari") {
      const amount =
        toAmount(r["tot. incasat"]) ??
        toAmount(r["tot incasat"]) ??
        toAmount(r["incasat"]) ??
        toAmount(r["total incasat"]);

      const date = toISODate(r["dat"] ?? r["data"]);

      // la REZERVARI nu ai market/currency => punem default RON (schimbi dacă vrei)
      const market = "RON";
      const brand = "Volocar";

      // descriere: încearcă să ia ceva identificator, altfel fallback
      const desc =
        String(r["id rezervare"] ?? r["id"] ?? r["id client"] ?? r["client"] ?? "").trim() || "Rezervare import";

      if (!date || amount === null) continue;

      out.push({ amount, date, market, brand, description: desc });
      continue;
    }

    // unknown => nu importăm nimic
  }

  console.log("[parseRevenuesXlsx] parsed =", out.length);
  return out;
}