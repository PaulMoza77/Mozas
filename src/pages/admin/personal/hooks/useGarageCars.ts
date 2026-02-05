import { useCallback, useEffect, useState } from "react";
import type { GarageCarRow } from "../../../../lib/garage/types";
import { fetchCars } from "../../../../lib/garage/api";

export function useGarageCars() {
  const [cars, setCars] = useState<GarageCarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCars();
      setCars(data);
    } catch (e: any) {
      setCars([]);
      setError(e?.message || "Failed to load cars.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsertLocal = useCallback((saved: GarageCarRow) => {
    setCars((prev) => {
      const i = prev.findIndex((x) => x.id === saved.id);
      if (i >= 0) {
        const next = prev.slice();
        next[i] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }, []);

  return { cars, loading, error, reload, upsertLocal, setCars };
}
