import { supabase } from "../supabase";
import type {
  GarageCarRow,
  GarageImportantRow,
  GarageExpenseRow,
  GarageIncomeRow,
  GarageLeasingContractRow,
  GarageLeasingScheduleRow,
  CarBundle,
  GarageExpenseKind,
} from "./types";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/* =========================
   CARS
========================= */
export async function fetchCars(): Promise<GarageCarRow[]> {
  const res = await supabase
    .from("garage_cars")
    .select("*")
    .order("created_at", { ascending: false });

  if (res.error) throw res.error;
  return (res.data || []) as GarageCarRow[];
}

export async function upsertCar(payload: Partial<GarageCarRow> & { id?: string }): Promise<GarageCarRow> {
  const res = await supabase
    .from("garage_cars")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageCarRow;
}

export async function deleteCar(id: string) {
  const res = await supabase.from("garage_cars").delete().eq("id", id);
  if (res.error) throw res.error;
}

/* =========================
   IMPORTANT
========================= */
export async function fetchImportant(carId: string): Promise<GarageImportantRow | null> {
  const res = await supabase.from("garage_car_important").select("*").eq("car_id", carId).maybeSingle();
  if (res.error) throw res.error;
  return (res.data as GarageImportantRow) || null;
}

export async function upsertImportant(payload: Partial<GarageImportantRow> & { car_id: string }) {
  const res = await supabase.from("garage_car_important").upsert(payload, { onConflict: "car_id" }).select("*").single();
  if (res.error) throw res.error;
  return res.data as GarageImportantRow;
}

/* =========================
   EXPENSES / INCOME
========================= */
export async function fetchCarExpenses(carId: string): Promise<GarageExpenseRow[]> {
  const res = await supabase
    .from("garage_car_expenses")
    .select("*")
    .eq("car_id", carId)
    .order("date", { ascending: false });

  if (res.error) throw res.error;
  return (res.data || []) as GarageExpenseRow[];
}

export async function addCarExpense(payload: {
  car_id: string;
  date?: string;
  name: string;
  vendor?: string | null;
  amount: number;
  currency?: string;
  kind?: GarageExpenseKind;
  note?: string | null;
}): Promise<GarageExpenseRow> {
  const res = await supabase
    .from("garage_car_expenses")
    .insert({
      car_id: payload.car_id,
      date: payload.date || todayISO(),
      name: payload.name,
      vendor: payload.vendor ?? null,
      amount: payload.amount,
      currency: payload.currency || "EUR",
      kind: payload.kind || "general",
      note: payload.note ?? null,
    })
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageExpenseRow;
}

export async function deleteCarExpense(id: string) {
  const res = await supabase.from("garage_car_expenses").delete().eq("id", id);
  if (res.error) throw res.error;
}

export async function fetchCarIncome(carId: string): Promise<GarageIncomeRow[]> {
  const res = await supabase
    .from("garage_car_income")
    .select("*")
    .eq("car_id", carId)
    .order("date", { ascending: false });

  if (res.error) throw res.error;
  return (res.data || []) as GarageIncomeRow[];
}

export async function addCarIncome(payload: {
  car_id: string;
  date?: string;
  source: string;
  amount: number;
  currency?: string;
  note?: string | null;
}): Promise<GarageIncomeRow> {
  const res = await supabase
    .from("garage_car_income")
    .insert({
      car_id: payload.car_id,
      date: payload.date || todayISO(),
      source: payload.source,
      amount: payload.amount,
      currency: payload.currency || "EUR",
      note: payload.note ?? null,
    })
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageIncomeRow;
}

export async function deleteCarIncome(id: string) {
  const res = await supabase.from("garage_car_income").delete().eq("id", id);
  if (res.error) throw res.error;
}

/* =========================
   LEASING
========================= */
export async function fetchLeasingContract(carId: string): Promise<GarageLeasingContractRow | null> {
  const res = await supabase.from("garage_leasing_contracts").select("*").eq("car_id", carId).maybeSingle();
  if (res.error) throw res.error;
  return (res.data as GarageLeasingContractRow) || null;
}

export async function upsertLeasingContract(payload: Partial<GarageLeasingContractRow> & { car_id: string }) {
  const res = await supabase
    .from("garage_leasing_contracts")
    .upsert(payload, { onConflict: "car_id" })
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageLeasingContractRow;
}

export async function fetchLeasingSchedule(contractId: string): Promise<GarageLeasingScheduleRow[]> {
  const res = await supabase
    .from("garage_leasing_schedule")
    .select("*")
    .eq("contract_id", contractId)
    .order("installment_no", { ascending: true });

  if (res.error) throw res.error;
  return (res.data || []) as GarageLeasingScheduleRow[];
}

/* =========================
   BUNDLE (helper)
========================= */
export async function fetchCarBundle(carId: string): Promise<CarBundle> {
  const carRes = await supabase.from("garage_cars").select("*").eq("id", carId).single();
  if (carRes.error) throw carRes.error;

  const [important, lease, expenses, income] = await Promise.all([
    fetchImportant(carId),
    fetchLeasingContract(carId),
    fetchCarExpenses(carId),
    fetchCarIncome(carId),
  ]);

  return {
    car: carRes.data as any,
    important,
    lease,
    expenses,
    income,
  };
}
