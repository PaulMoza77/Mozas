export type GarageCarRow = {
  id: string;
  owner_id: string;
  name: string;
  purchase_price: number;
  purchase_currency: string;
  purchase_km: number;
  purchase_date: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GarageImportantRow = {
  car_id: string;
  owner_id: string;
  rca_expires: string | null;
  casco_expires: string | null;
  itp_expires: string | null;
  vignette_expires: string | null;
  updated_at: string;
};

// ✅ EXTINS ca sa poti folosi fuel/repair in UI
export type GarageExpenseKind =
  | "general"
  | "leasing_rate"
  | "insurance"
  | "service"
  | "tax"
  | "fuel"
  | "repair";

export type GarageExpenseRow = {
  id: string;
  owner_id: string;
  car_id: string;
  date: string; // YYYY-MM-DD
  name: string;
  vendor: string | null;
  amount: number;
  currency: string;
  kind: GarageExpenseKind;
  note: string | null;
  created_at: string;
};

export type GarageIncomeRow = {
  id: string;
  owner_id: string;
  car_id: string;
  date: string; // YYYY-MM-DD
  source: string;
  amount: number;
  currency: string;
  note: string | null;
  created_at: string;
};

export type GarageLeasingContractRow = {
  id: string;
  owner_id: string;
  car_id: string;

  lender: string | null;
  contract_no: string | null;
  contract_date: string | null;

  currency: string;

  purchase_price: number | null;
  advance_amount: number | null;
  credit_value: number | null;
  interest_rate: number | null;
  analysis_fee: number | null;
  admin_fee: number | null;
  dae: number | null;

  installments_count: number | null;
  total_interest: number | null;
  total_payable: number | null;

  created_at: string;
  updated_at: string;
};

export type GarageLeasingScheduleRow = {
  id: string;
  owner_id: string;
  contract_id: string;
  installment_no: number;
  due_date: string;
  principal: number | null;
  interest: number | null;
  total: number;
  created_at: string;
};

export type CarBundle = {
  car: GarageCarRow;
  important: GarageImportantRow | null;
  lease: GarageLeasingContractRow | null;
  expenses: GarageExpenseRow[];
  income: GarageIncomeRow[];
};
