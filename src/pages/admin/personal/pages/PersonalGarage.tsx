import { useMemo, useState } from "react";
import { Car, Euro, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SectionCard } from "../components/SectionCard";

type GarageCar = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  income: number;
  expenses: number;
};

function formatMoney(n: number) {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} €`;
}

export function PersonalGarage() {
  const [cars] = useState<GarageCar[]>([
    {
      id: "car1",
      name: "Mercedes G63 (example)",
      imageUrl:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=60",
      price: 120000,
      income: 8400,
      expenses: 2300,
    },
    {
      id: "car2",
      name: "BMW M8 Competition (example)",
      imageUrl:
        "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=60",
      price: 110000,
      income: 6200,
      expenses: 3100,
    },
  ]);

  const net = useMemo(() => cars.reduce((a, c) => a + (c.income - c.expenses), 0), [cars]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Garage Overview"
        subtitle={`Net (all cars): ${formatMoney(net)}`}
        right={
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
            <Car className="h-4 w-4" />
            Cars: {cars.length}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cars.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[16/9] w-full bg-slate-100">
                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
              </div>

              <div className="p-4">
                <div className="text-lg font-semibold tracking-tight">{c.name}</div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Expenses</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-rose-700">
                      <ArrowDownRight className="h-4 w-4" />
                      {formatMoney(c.expenses)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Income</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                      <ArrowUpRight className="h-4 w-4" />
                      {formatMoney(c.income)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Price</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <Euro className="h-4 w-4" />
                      {formatMoney(c.price)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Mock. Următorul pas: DB table `garage_cars` + `garage_txns`.
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
