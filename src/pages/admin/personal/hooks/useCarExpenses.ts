import { useCallback, useEffect, useState } from "react";
import type { GarageExpenseRow } from "../../../../lib/garage/types";
import { deleteCarExpense, fetchCarExpenses } from "../../../../lib/garage/api";

export function useCarExpenses(carId: string) {
  const [rows, setRows] = useState<GarageExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCarExpenses(carId);
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
      const ok = window.confirm("Delete expense?");
      if (!ok) return;
      setRows((p) => p.filter((x) => x.id !== id));
      try {
        await deleteCarExpense(id);
      } catch (e: any) {
        alert(e?.message || "Delete failed.");
        await reload();
      }
    },
    [reload]
  );

  return { rows, loading, reload, remove, setRows };
}
