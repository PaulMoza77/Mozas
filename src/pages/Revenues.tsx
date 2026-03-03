import React from "react";
import RevenueTable from "./admin/revenues/components/RevenueTable";
import ImportXlsxButton from "./admin/revenues/components/ImportXlsxButton";
import AddRevenueModal from "./admin/revenues/components/AddRevenueModal";
import type { Revenue } from "./admin/revenues/types";
import { fetchRevenues, addRevenue } from "./admin/revenues/api";
import { parseRevenuesXlsx } from "../lib/parseRevenuesXlsx";


// Revenues are loaded from Supabase

const Revenues: React.FC = () => {
  const [revenues, setRevenues] = React.useState<Revenue[]>([]);
  const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
      fetchRevenues()
        .then((data) => setRevenues(data))
        .finally(() => setLoading(false));
    }, []);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const parsed = await parseRevenuesXlsx(file, "Mozas");
      const added: Revenue[] = [];
      for (const rev of parsed) {
        const newRev = await addRevenue(rev);
        if (newRev) added.push(newRev);
      }
      if (added.length) setRevenues((prev) => [...added, ...prev]);
    } catch (err) {
      alert("Eroare la import: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRevenue = async (data: Omit<Revenue, "id">) => {
    setLoading(true);
    try {
      const newRev = await addRevenue(data);
      if (newRev) setRevenues((prev) => [newRev, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Încasări</h1>
      <div className="flex gap-4 mb-4">
        <ImportXlsxButton onImport={handleImport} />
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => setModalOpen(true)}
        >
          Adaugă manual
        </button>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-400">Se încarcă...</div>
      ) : (
        <RevenueTable revenues={revenues} />
      )}
      <AddRevenueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddRevenue}
      />
    </div>
  );
};

export default Revenues;
