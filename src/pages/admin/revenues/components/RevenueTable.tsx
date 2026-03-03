import React from "react";
import { Revenue } from "../types";

interface RevenueTableProps {
  revenues: Revenue[];
}

const RevenueTable: React.FC<RevenueTableProps> = ({ revenues }) => {
  return (
    <div className="overflow-x-auto rounded shadow bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="px-4 py-2 text-left">Data</th>
            <th className="px-4 py-2 text-left">Sumă</th>
            <th className="px-4 py-2 text-left">Piață</th>
            <th className="px-4 py-2 text-left">Descriere</th>
          </tr>
        </thead>
        <tbody>
          {revenues.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                Nicio încasare găsită.
              </td>
            </tr>
          ) : (
            revenues.map((r) => (
              <tr key={r.id} className="border-b last:border-b-0">
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-nowrap font-semibold">{r.amount.toLocaleString("ro-RO", { style: "currency", currency: "RON" })}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.market}</td>
                <td className="px-4 py-2">{r.description || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RevenueTable;
