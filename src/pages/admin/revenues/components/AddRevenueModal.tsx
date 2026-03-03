import React, { useState } from "react";
const BRAND_OPTIONS = ["Mozas", "Volocar", "GetSureDrive", "TDG", "Brandly", "Personal"];
import type { Revenue } from "../types";

interface AddRevenueModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (revenue: Omit<Revenue, "id">) => void;
}

const AddRevenueModal: React.FC<AddRevenueModalProps> = ({ open, onClose, onAdd }) => {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [market, setMarket] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState(BRAND_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !market || !brand) return;
    onAdd({
      amount, date, market, description, brand
    });
    setAmount(0);
    setDate("");
    setMarket("");
    setDescription("");
    setBrand(BRAND_OPTIONS[0]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Adaugă Încasare</h2>
        <div className="mb-3">
          <label className="block mb-1">Sumă (RON)</label>
          <input type="number" min={0} step={0.01} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Piață</label>
          <input type="text" value={market} onChange={e => setMarket(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Descriere</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Brand</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          >
            {BRAND_OPTIONS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Anulează</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Adaugă</button>
        </div>
      </form>
    </div>
  );
};

export default AddRevenueModal;
