import * as XLSX from "xlsx";
import type { Revenue } from "../pages/admin/revenues/types";

export function parseRevenuesXlsx(file: File, defaultBrand: string): Promise<Omit<Revenue, "id">[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        // Mapăm coloanele relevante
        const result: Omit<Revenue, "id">[] = rows.map((row) => ({
          amount: Number(row.amount || row.suma || row.Suma || 0),
          date: row.date || row.data || row.Data || "",
          market: row.market || row.piata || row.Piata || "",
          brand: row.brand || defaultBrand,
          description: row.description || row.descriere || row.Descriere || "",
        })).filter(r => r.amount && r.date && r.market && r.brand);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
