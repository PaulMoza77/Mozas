// src/lib/garage/storage.ts
import { supabase } from "../supabase";

export const GARAGE_BUCKET = "garage-private";

function safeExt(name: string) {
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  return ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
}
function rand6() {
  return Math.random().toString(16).slice(2, 8);
}

export async function uploadGaragePhoto(file: File, carId: string): Promise<string> {
  if (!file) throw new Error("Missing file.");
  if (!carId) throw new Error("Missing carId.");

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!auth.user) throw new Error("Not authenticated.");

  // ✅ policy-ul tău cere ca split_part(name,'/',2) = carId
  const ext = safeExt(file.name);
  const path = `cars/${carId}/${Date.now()}_${rand6()}.${ext}`;

  const up = await supabase.storage.from(GARAGE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
  });

  if (up.error) throw up.error;
  return path; // ✅ în DB salvăm DOAR path
}

export async function deleteGaragePhoto(photoPath: string) {
  if (!photoPath) return;
  const del = await supabase.storage.from(GARAGE_BUCKET).remove([photoPath]);
  if (del.error) throw del.error;
}

export async function getGaragePhotoSignedUrl(photoPath: string, expiresIn = 60 * 60) {
  if (!photoPath) return null;

  const res = await supabase.storage.from(GARAGE_BUCKET).createSignedUrl(photoPath, expiresIn);
  if (res.error) throw res.error;

  return res.data?.signedUrl || null;
}
