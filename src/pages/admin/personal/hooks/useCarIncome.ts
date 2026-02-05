import { useCallback, useEffect, useState } from "react";
import type { GarageIncomeRow } from "../../../../lib/garage/types";
import { deleteCarIncome, fetchCarIncome } from "../../../../lib/garage/api";

export function useCarIncome(carId: string) {
  const [rows, setRows] = useState<GarageIncomeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCarIncome(carId);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = useCallback(
    async (id: string) => {
      const ok = window.confirm("Delete income?");
      if (!ok) return;
      setRows((p) => p.filter((x) => x.id !== id));
      try {
        await deleteCarIncome(id);
      } catch (e: any) {
        alert(e?.message || "Delete failed.");
        await reload();
      }
    },
    [reload]
  );

  return { rows, loading, reload, remove, setRows };
}
