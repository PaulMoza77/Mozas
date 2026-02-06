// src/lib/garage/api.ts
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

/** =========================
 * Storage config
 * ========================= */
export const GARAGE_BUCKET = "garage-private"; // must exist

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function normalizeCurrency(v?: string | null) {
  const s = String(v || "EUR").trim().toUpperCase();
  return s || "EUR";
}

function safeExt(name: string) {
  const parts = (name || "").split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "jpg";
  return ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
}

function rand6() {
  return Math.random().toString(16).slice(2, 8);
}

async function requireUid() {
  const userRes = await supabase.auth.getUser();
  const uid = userRes.data.user?.id;
  if (!uid) throw new Error("Not authenticated.");
  return uid;
}

/** =========================
 * Storage helpers (car photo)
 *
 * IMPORTANT:
 * Path MUST be: "cars/<carId>/..."  (ca să treacă policy-ul tău cu split_part(name,'/',2))
 * ========================= */
export async function uploadGarageCarPhoto(file: File, carId: string): Promise<string> {
  if (!file) throw new Error("Missing file.");
  if (!carId) throw new Error("Missing carId.");

  await requireUid(); // doar ca să fim siguri că e logat (policy e pe authenticated)

  const ext = safeExt(file.name);
  const path = `cars/${carId}/${Date.now()}_${rand6()}.${ext}`;

  const up = await supabase.storage.from(GARAGE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
  });

  if (up.error) throw up.error;
  return path; // ✅ string path (se salvează în DB)
}

export async function deleteGarageCarPhoto(photo_path: string) {
  if (!photo_path) return;
  const del = await supabase.storage.from(GARAGE_BUCKET).remove([photo_path]);
  if (del.error) throw del.error;
}

export async function getGarageCarPhotoSignedUrl(photo_path: string, expiresInSeconds = 60 * 60) {
  if (!photo_path) return null;
  const signed = await supabase.storage.from(GARAGE_BUCKET).createSignedUrl(photo_path, expiresInSeconds);
  if (signed.error) throw signed.error;
  return signed.data?.signedUrl || null;
}

/* =========================
   CARS
========================= */
export async function fetchCars(): Promise<GarageCarRow[]> {
  const uid = await requireUid();

  const res = await supabase
    .from("garage_cars")
    .select("*")
    .eq("owner_id", uid)
    .order("created_at", { ascending: false });

  if (res.error) throw res.error;
  return (res.data || []) as GarageCarRow[];
}

/**
 * ✅ Folosește upsertCar pentru CREATE sau UPDATE complet (când ai name, etc.)
 * Atenție: la UPDATE parțial (doar photo_url) NU folosi upsert (poate lovi NOT NULL).
 */
export async function upsertCar(payload: Partial<GarageCarRow> & { id?: string }): Promise<GarageCarRow> {
  const uid = await requireUid();

  // dacă e insert, name e obligatoriu
  if (!payload.id) {
    const nm = String((payload as any).name || "").trim();
    if (!nm) throw new Error("Car name is required.");
  }

  const res = await supabase
    .from("garage_cars")
    .upsert(
      {
        ...payload,
        owner_id: uid,
      } as any,
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageCarRow;
}

/**
 * ✅ UPDATE parțial (ex: photo_url)
 */
export async function updateCar(id: string, patch: Partial<GarageCarRow>): Promise<GarageCarRow> {
  const uid = await requireUid();
  if (!id) throw new Error("Missing car id.");

  const res = await supabase
    .from("garage_cars")
    .update(patch as any)
    .eq("id", id)
    .eq("owner_id", uid)
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageCarRow;
}

export async function deleteCar(id: string) {
  const uid = await requireUid();
  const res = await supabase.from("garage_cars").delete().eq("id", id).eq("owner_id", uid);
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
  const res = await supabase
    .from("garage_car_important")
    .upsert(payload, { onConflict: "car_id" })
    .select("*")
    .single();

  if (res.error) throw res.error;
  return res.data as GarageImportantRow;
}

/* =========================
   EXPENSES
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
      currency: normalizeCurrency(payload.currency),
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

/* =========================
   INCOME
========================= */
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
      currency: normalizeCurrency(payload.currency),
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
   BUNDLE
========================= */
export async function fetchCarBundle(carId: string): Promise<CarBundle> {
  const uid = await requireUid();

  const carRes = await supabase
    .from("garage_cars")
    .select("*")
    .eq("id", carId)
    .eq("owner_id", uid)
    .single();

  if (carRes.error) throw carRes.error;

  const [important, lease, expenses, income] = await Promise.all([
    fetchImportant(carId),
    fetchLeasingContract(carId),
    fetchCarExpenses(carId),
    fetchCarIncome(carId),
  ]);

  return { car: carRes.data as any, important, lease, expenses, income };
}
