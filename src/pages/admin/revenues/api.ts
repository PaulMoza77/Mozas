import { supabase } from "../../../lib/supabase";
import { Revenue } from "./types";

const TABLE = "revenues";

export async function fetchRevenues(): Promise<Revenue[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, amount, date, market, description, created_at")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addRevenue(revenue: Omit<Revenue, "id">): Promise<Revenue | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([revenue])
    .select()
    .single();
  if (error) throw error;
  return data || null;
}
