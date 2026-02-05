// src/pages/admin/personal/pages/PersonalGarage.tsx
import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { useGarageCars } from "../hooks/useGarageCars";
import { CarCard } from "../components/CarCard";
import { CarEditorModal } from "../modals/CarEditorModal";

export function PersonalGarage() {
  const { cars, loading, error, reload, upsertLocal } = useGarageCars();

  const [openCar, setOpenCar] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Garage
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">My Cars</h2>
            <p className="mt-1 text-sm text-slate-600">
              Adaugă mașini + urmărește cheltuieli, venituri, important & leasing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingCarId(null);
                setOpenCar(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add car
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Loading */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading cars…
        </div>
      ) : null}

      {/* Empty */}
      {!loading && cars.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          N-ai nicio mașină încă. Apasă <span className="font-semibold">Add car</span>.
        </div>
      ) : null}

      {/* List */}
      {!loading && cars.length > 0 ? (
        <div className="space-y-4">
          {cars.map((c) => (
            <CarCard
              key={c.id}
              car={c}
              onEdit={() => {
                setEditingCarId(c.id);
                setOpenCar(true);
              }}
              onCarSaved={(saved) => {
                upsertLocal(saved);
              }}
            />
          ))}
        </div>
      ) : null}

      {/* Modal */}
      <CarEditorModal
        open={openCar}
        carId={editingCarId}
        onClose={() => setOpenCar(false)}
        onSaved={(saved) => {
          upsertLocal(saved);
          setOpenCar(false);
        }}
      />
    </div>
  );
}
