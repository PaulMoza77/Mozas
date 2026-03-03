import React from "react";
import type { Revenue } from "../types";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const BRAND_OPTIONS = ["Mozas", "Volocar", "GetSureDrive", "TDG", "Brandly", "Personal"];

interface AddRevenueModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (revenue: Omit<Revenue, "id">) => void;
}

export default function AddRevenueModal({ open, onClose, onAdd }: AddRevenueModalProps) {
  const [amount, setAmount] = React.useState<number>(0);
  const [date, setDate] = React.useState<string>("");
  const [market, setMarket] = React.useState<string>("RON");
  const [description, setDescription] = React.useState<string>("");
  const [brand, setBrand] = React.useState<string>(BRAND_OPTIONS[0]);

  const submit = () => {
    if (!amount || !date || !market || !brand) return;

    onAdd({
      amount,
      date,
      market: market.toUpperCase().trim(),
      description: description.trim(),
      brand,
    });

    setAmount(0);
    setDate("");
    setMarket("RON");
    setDescription("");
    setBrand(BRAND_OPTIONS[0]);
    onClose();
  };

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
          <div className="mb-4">
            <div className="text-lg font-semibold">Adaugă Încasare</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-600">Amount</div>
              <input
                type="number"
                min={0}
                step="0.01"
                value={String(amount)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-600">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-600">Market (Currency)</div>
              <input
                value={market}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarket(e.target.value)}
                placeholder="RON / EUR / AED"
                className="input input-bordered w-full"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-600">Brand</div>
              <select
                className="h-10 rounded-md border px-3 text-sm w-full"
                value={brand}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBrand(e.target.value)}
              >
                {BRAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <div className="text-xs text-slate-600">Description</div>
              <input
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                placeholder="ex: Rezervare #..."
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submit}>
              Save
            </button>
          </div>
        </div>
      </div>
    )
  );
}