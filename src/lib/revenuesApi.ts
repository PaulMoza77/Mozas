import { supabase } from "../../lib/supabase";
import type { Revenue } from "../admin/revenues/types";

export async function fetchRevenuesAgg(brand?: string): Promise<Record<string, number>> {
  let query = supabase
    .from("revenues")
    .select("amount, market, brand");
  if (brand) query = query.eq("brand", brand);
  const { data, error } = await query.returns<Pick<Revenue, 'amount' | 'market' | 'brand'>[]>();
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const r of data || []) {
    const cur = (r.market || "RON").toUpperCase();
    const amt = Number(r.amount);
    if (!Number.isFinite(amt)) continue;
    out[cur] = (out[cur] || 0) + amt;
  }
  return out;
}
