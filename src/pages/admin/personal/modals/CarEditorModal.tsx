// src/pages/admin/personal/modals/CarEditorModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, Upload, Save } from "lucide-react";

import { fetchCars, upsertCar } from "../../../../lib/garage/api";
import type { GarageCarRow } from "../../../../lib/garage/types";
import { uploadGaragePhoto } from "../../../../lib/garage/storage";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function toNumberSafe(v: string) {
  const n = Number(String(v || "").trim().replace(",", "."));
  return n;
}

export function CarEditorModal(props: {
  open: boolean;
  carId: string | null;
  onClose: () => void;
  onSaved: (saved: GarageCarRow) => void;
}) {
  const { open, carId, onClose, onSaved } = props;

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseCurrency, setPurchaseCurrency] = useState("EUR");
  const [purchaseKm, setPurchaseKm] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<string>(todayISO());

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!open) return;

      setName("");
      setPurchasePrice("");
      setPurchaseCurrency("EUR");
      setPurchaseKm("");
      setPurchaseDate(todayISO());
      setPhotoFile(null);
      setLocalPreview("");

      if (!carId) return;

      setLoading(true);
      try {
        const all = await fetchCars();
        const found = all.find((c) => c.id === carId) || null;
        if (!found || cancelled) return;

        setName(found.name || "");
        setPurchasePrice(found.purchase_price == null ? "" : String(found.purchase_price));
        setPurchaseCurrency(found.purchase_currency || "EUR");
        setPurchaseKm(found.purchase_km == null ? "" : String(found.purchase_km));
        setPurchaseDate(found.purchase_date || todayISO());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, carId]);

  useEffect(() => {
    if (!photoFile) {
      setLocalPreview("");
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const priceNum = useMemo(() => toNumberSafe(purchasePrice), [purchasePrice]);
  const kmNum = useMemo(() => toNumberSafe(purchaseKm), [purchaseKm]);

  const canSave = useMemo(() => {
    if (busy) return false;
    if (!name.trim()) return false;
    if (!Number.isFinite(priceNum) || priceNum < 0) return false;
    if (!Number.isFinite(kmNum) || kmNum < 0) return false;
    return true;
  }, [busy, name, priceNum, kmNum]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <div className="text-lg font-semibold">{carId ? "Edit car" : "Add car"}</div>
            <div className="mt-1 text-sm text-slate-600">Poză + detalii achiziție.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-slate-50"
            disabled={busy}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading…</div>
          ) : null}

          {localPreview ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="aspect-[16/9] w-full">
                <img src={localPreview} alt="Preview" className="h-full w-full object-cover" />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <div className="mb-1 text-slate-600">Denumire</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="ex: Porsche Cayenne Turbo S"
                disabled={busy}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Preț achiziție</div>
              <input
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="ex: 76500"
                inputMode="decimal"
                disabled={busy}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Monedă</div>
              <input
                value={purchaseCurrency}
                onChange={(e) => setPurchaseCurrency(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="EUR / AED / RON"
                disabled={busy}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">KM la achiziție</div>
              <input
                value={purchaseKm}
                onChange={(e) => setPurchaseKm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="ex: 70000"
                inputMode="numeric"
                disabled={busy}
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-slate-600">Data achiziție</div>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                disabled={busy}
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <div className="mb-1 text-slate-600">Poză</div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <Upload className="h-4 w-4 text-slate-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                  disabled={busy}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Bucket private: <span className="font-semibold">garage-private</span>. Se salvează doar path în DB.
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSave}
            onClick={async () => {
              if (!canSave) return;

              setBusy(true);
              try {
                // 1) upsert car (name e obligatoriu -> nu mai apare eroarea cu name null)
                const baseSaved = await upsertCar({
                  ...(carId ? { id: carId } : {}),
                  name: name.trim(),
                  purchase_price: priceNum,
                  purchase_currency: (purchaseCurrency || "EUR").trim().toUpperCase(),
                  purchase_km: kmNum,
                  purchase_date: purchaseDate || null,
                } as any);

                // 2) upload photo -> primesc path "cars/<carId>/..."
                if (photoFile) {
                  const photoPath = await uploadGaragePhoto(photoFile, baseSaved.id);
                  const saved2 = await upsertCar({ id: baseSaved.id, photo_url: photoPath } as any);
                  onSaved(saved2);
                } else {
                  onSaved(baseSaved);
                }
              } catch (e: any) {
                alert(e?.message || "Save failed.");
              } finally {
                setBusy(false);
              }
            }}
            className={clsx(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
              canSave ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
