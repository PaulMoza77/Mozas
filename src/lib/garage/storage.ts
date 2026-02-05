// src/lib/garage/storage.ts
import { supabase } from "../supabase";
import { GARAGE_BUCKET } from "./api";

/** Upload car photo to private bucket, returns storage path */
export async function uploadGaragePhoto(file: File, carId: string) {
  if (!file) throw new Error("Missing file.");
  if (!carId) throw new Error("Missing carId.");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const path = `cars/${carId}/${Date.now()}_${Math.random().toString(16).slice(2, 8)}.${safeExt}`;

  // IMPORTANT: use ONLY the constant bucket
  const res = await supabase.storage.from(GARAGE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
    cacheControl: "3600",
  });

  if (res.error) {
    // if bucket mismatch or wrong project, this is where it shows
    throw res.error;
  }

  return path;
}

/** Get signed URL for displaying private image */
export async function signedGaragePhotoUrl(path: string, expiresInSeconds = 3600) {
  if (!path) return null;

  const res = await supabase.storage.from(GARAGE_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (res.error) throw res.error;

  return res.data?.signedUrl || null;
}

/** Remove photo */
export async function deleteGaragePhoto(path: string) {
  if (!path) return;
  const res = await supabase.storage.from(GARAGE_BUCKET).remove([path]);
  if (res.error) throw res.error;
}
