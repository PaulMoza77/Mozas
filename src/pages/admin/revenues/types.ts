export interface Revenue {
  id: string;
  amount: number;
  date: string; // ISO
  market: string;
  brand: string; // ex: Mozas, Volocar, etc
  description?: string;
  created_at?: string;
}
