export interface Revenue {
  id: string;
  amount: number;
  date: string; // ISO
  market: string;
  description?: string;
  created_at?: string;
}
