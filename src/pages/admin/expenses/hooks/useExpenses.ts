// src/pages/admin/expenses/hooks/useExpenses.ts
import { useCallback, useEffect, useState } from "react";
import {
  fetchExpenses,
  upsertExpenseDb,
  deleteExpenseDb,
  insertExpensesDb, // ✅ add this in lib/expensesApi (bulk insert)
  type DbExpense,
} from "../../../../lib/expensesApi";

export function useExpenses() {
  const [rows, setRows] = useState<DbExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses();
      setRows(Array.isArray(data) ? (data as DbExpense[]) : []);
    } catch (e) {
      console.error("fetchExpenses failed:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsertLocal = useCallback((saved: DbExpense) => {
    setRows((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }, []);

  const removeLocal = useCallback((id: string) => {
    setRows((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const upsertDb = useCallback(
    async (payload: Partial<DbExpense> & { id?: string }) => {
      const saved = await upsertExpenseDb(payload);
      upsertLocal(saved);
      return saved;
    },
    [upsertLocal]
  );

  const deleteDb = useCallback(
    async (id: string) => {
      await deleteExpenseDb(id);
      removeLocal(id);
    },
    [removeLocal]
  );

  // ✅ BULK INSERT (for XLSX import)
  const insertManyDb = useCallback(
    async (payloads: Array<Partial<DbExpense>>) => {
      if (!payloads.length) return [];
      const savedRows = await insertExpensesDb(payloads); // should return DbExpense[]
      // safest: reload, so UI matches DB ordering / computed fields
      await reload();
      return savedRows;
    },
    [reload]
  );

  return {
    rows,
    setRows,
    loading,
    reload,
    upsertDb,
    deleteDb,
    insertManyDb, // ✅ export
    upsertLocal,
    removeLocal,
  };
}
