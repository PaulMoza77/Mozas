import * as XLSX from "xlsx";
import type { Revenue } from "../pages/admin/revenues/types";

type ParsedRevenue = Omit<Revenue, "id">;

function norm(s: unknown) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeKeys(row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(row)) out[norm(k)] = row[k];
  return out;
}

function toISODate(v: any): string | null {
  if (v === null || v === undefined || v === "") return null;

  if (v instanceof Date && !isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

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

  const s = String(v)
    .trim()
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove thousand dots
    .replace(",", ".");
  const n = Number(s);
  if (!isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function getCell(r: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const kk = norm(k);
    if (r[kk] !== undefined && r[kk] !== null && String(r[kk]).trim() !== "") return r[kk];
  }
  return null;
}

function hasAnyKey(rows: Record<string, any>[], keys: string[]) {
  const set = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) set.add(norm(k));
  return keys.some((k) => set.has(norm(k)));
}

function sheetToRows(wb: XLSX.WorkBook, headerRowIndex: number) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
    defval: "",
    raw: true,
    range: headerRowIndex,
  });
}

/**
 * Acceptă:
 * A) Template: amount | date | market | brand | description
 * B) REZERVARI: date (DAT/Data/Start) + amount (Tot. Incasat / Incasat / Total / Suma)
 */
export async function parseRevenuesXlsx(file: File): Promise<ParsedRevenue[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  // try header row at 0 and 1 (REZERVARI uneori are titlu sus)
  const raw0 = sheetToRows(wb, 0).map(normalizeKeys);
  const raw1 = sheetToRows(wb, 1).map(normalizeKeys);

  const isTemplate = (rows: Record<string, any>[]) =>
    hasAnyKey(rows, ["amount"]) &&
    hasAnyKey(rows, ["date"]) &&
    hasAnyKey(rows, ["market"]) &&
    hasAnyKey(rows, ["brand"]);

  const isRezervari = (rows: Record<string, any>[]) =>
    hasAnyKey(rows, ["dat", "data", "start"]) &&
    hasAnyKey(rows, [
      "tot. incasat",
      "tot incasat",
      "incasat",
      "total incasat",
      "total",
      "suma",
      "sumă",
      "valoare",
      "value",
    ]);

  let rows = raw0;
  let mode: "template" | "rezervari" | "unknown" = "unknown";

  if (isTemplate(raw0)) {
    rows = raw0;
    mode = "template";
  } else if (isTemplate(raw1)) {
    rows = raw1;
    mode = "template";
  } else if (isRezervari(raw0)) {
    rows = raw0;
    mode = "rezervari";
  } else if (isRezervari(raw1)) {
    rows = raw1;
    mode = "rezervari";
  }

  console.log("[parseRevenuesXlsx] mode =", mode, "rows =", rows.length);

  const out: ParsedRevenue[] = [];

  for (const r0 of rows) {
    const r = r0; // already normalized keys

    if (mode === "template") {
      const amount = toAmount(getCell(r, ["amount", "suma", "sumă", "total", "value"]));
      const date = toISODate(getCell(r, ["date", "data"]));
      const market = String(getCell(r, ["market", "piata", "piață", "currency"]) ?? "").trim();
      const brand = String(getCell(r, ["brand"]) ?? "").trim();
      const description = String(getCell(r, ["description", "descriere", "note"]) ?? "").trim();

      if (!date || amount === null || !market || !brand) continue;

      out.push({
        amount,
        date,
        market,
        brand,
        description: description || "",
      });
      continue;
    }

    if (mode === "rezervari") {
      const date = toISODate(getCell(r, ["dat", "data", "start", "data rezervare", "data rezervării"]));
      const amount = toAmount(
        getCell(r, [
          "tot. incasat",
          "tot incasat",
          "total incasat",
          "incasat",
          "total",
          "suma",
          "sumă",
          "valoare",
          "value",
          "pret",
          "preț",
        ])
      );

      if (!date || amount === null) continue;

      // daca ai moneda in rezervari, o luam; altfel RON
      const market = String(getCell(r, ["currency", "moneda", "valoare moneda"]) ?? "RON").trim() || "RON";
      const brand = "Volocar";

      const description =
        String(
          getCell(r, [
            "id rezervare",
            "rezervare",
            "id",
            "client",
            "nume",
            "masina",
            "mașina",
            "car",
          ]) ?? "Rezervare import"
        ).trim() || "Rezervare import";

      out.push({
        amount,
        date,
        market,
        brand,
        description,
      });
      continue;
    }
  }

  console.log("[parseRevenuesXlsx] parsed =", out.length);
  return out;
}