import type { Revenue } from "../types";

interface RevenueTableProps {
  revenues: Revenue[];
}

function fmtMoney(amount: number, currency: string) {
  const cur = (currency || "RON").toUpperCase();
  try {
    return new Intl.NumberFormat("ro-RO", { style: "currency", currency: cur }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${cur}`;
  }
}

export default function RevenueTable({ revenues }: RevenueTableProps) {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-slate-600">
              <th className="px-5 py-3 text-left font-semibold">Date</th>
              <th className="px-5 py-3 text-left font-semibold">Brand</th>
              <th className="px-5 py-3 text-left font-semibold">Market</th>
              <th className="px-5 py-3 text-left font-semibold">Description</th>
              <th className="px-5 py-3 text-right font-semibold">Amount</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {revenues.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  Nicio încasare găsită.
                </td>
              </tr>
            ) : (
              revenues.map((r) => {
                const cur = String(r.market || "RON").toUpperCase(); // la tine market = currency
                const amt = Number(r.amount) || 0;

                return (
                  <tr key={r.id} className="border-t hover:bg-slate-50/60">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-900">
                      {r.date ? new Date(r.date).toLocaleDateString("ro-RO") : "—"}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-900">
                      {r.brand || "—"}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                        {cur}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600 max-w-[520px]">
                      <div className="line-clamp-2">{r.description || "—"}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right font-semibold text-slate-900">
                      {fmtMoney(amt, cur)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {/* păstrăm UI ca la expenses, dar dezactivat până faci update/delete */}
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center h-9 px-3 rounded-md border text-sm text-slate-400 cursor-not-allowed"
                        title="Edit (coming soon)"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled
                        className="ml-2 inline-flex items-center justify-center h-9 px-3 rounded-md border border-red-200 text-sm text-red-300 cursor-not-allowed"
                        title="Delete (coming soon)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}