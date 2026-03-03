import type { Revenue } from "../types";
// import { Button } from "@/components/ui/button";

interface RevenueTableProps {
  revenues: Revenue[];
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default function RevenueTable({ revenues }: RevenueTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="text-slate-600">
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">Brand</th>
            <th className="px-4 py-3 text-left font-semibold">Market</th>
            <th className="px-4 py-3 text-left font-semibold">Description</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody>
          {revenues.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                Nicio încasare găsită.
              </td>
            </tr>
          ) : (
            revenues.map((r) => {
              const cur = String(r.market || "RON").toUpperCase(); // la tine market = currency
              const amt = Number(r.amount) || 0;

              return (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.date ? new Date(r.date).toLocaleDateString("ro-RO") : "—"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">{r.brand || "—"}</td>

                  <td className="px-4 py-3 whitespace-nowrap">{cur}</td>

                  <td className="px-4 py-3 text-slate-600">{r.description || "—"}</td>

                  <td className="px-4 py-3 text-right font-semibold">{fmt(amt, cur)}</td>

                  <td className="px-4 py-3 text-right">
                      <button className="btn btn-outline btn-sm" disabled>
                      Edit
                      </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}