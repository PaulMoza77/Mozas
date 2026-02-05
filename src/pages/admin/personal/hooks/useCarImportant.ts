import { useCallback, useEffect, useState } from "react";
import type { GarageImportantRow } from "../../../../lib/garage/types";
import { fetchImportant, upsertImportant } from "../../../../lib/garage/api";

export function useCarImportant(carId: string) {
  const [row, setRow] = useState<GarageImportantRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchImportant(carId);
      setRow(r);
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsert = useCallback(
    async (patch: Partial<GarageImportantRow>) => {
      setSaving(true);
      try {
        const saved = await upsertImportant({ car_id: carId, ...patch } as any);
        setRow(saved);
        return saved;
      } finally {
        setSaving(false);
      }
    },
    [carId]
  );

  return { row, loading, saving, reload, upsert };
}
