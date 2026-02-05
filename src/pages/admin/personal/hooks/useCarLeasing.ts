import { useCallback, useEffect, useMemo, useState } from "react";
import type { GarageLeasingContractRow } from "../../../../lib/garage/types";
import { fetchLeasingContract, upsertLeasingContract } from "../../../../lib/garage/api";

type Draft = {
  contract_no: string;
  contract_date: string;
  currency: string;
  total_payable: string;
  advance_amount: string;
  installments_count: string;
};

export function useCarLeasing(carId: string) {
  const [contract, setContract] = useState<GarageLeasingContractRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [includeAdvance, setIncludeAdvance] = useState(true);

  const [draft, setDraft] = useState<Draft>({
    contract_no: "",
    contract_date: "",
    currency: "EUR",
    total_payable: "",
    advance_amount: "",
    installments_count: "",
  });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const c = await fetchLeasingContract(carId);
      setContract(c);

      if (c) {
        setDraft({
          contract_no: c.contract_no || "",
          contract_date: c.contract_date || "",
          currency: c.currency || "EUR",
          total_payable: c.total_payable == null ? "" : String(c.total_payable),
          advance_amount: c.advance_amount == null ? "" : String(c.advance_amount),
          installments_count: c.installments_count == null ? "" : String(c.installments_count),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const payload: Partial<GarageLeasingContractRow> & { car_id: string } = {
        car_id: carId,
        contract_no: draft.contract_no.trim() || null,
        contract_date: draft.contract_date || null,
        currency: (draft.currency || "EUR").toUpperCase(),

        total_payable: draft.total_payable.trim() ? Number(draft.total_payable) : null,
        advance_amount: draft.advance_amount.trim() ? Number(draft.advance_amount) : null,
        installments_count: draft.installments_count.trim() ? Number(draft.installments_count) : null,
      };

      const saved = await upsertLeasingContract(payload as any);
      setContract(saved);
      return saved;
    } catch (e: any) {
      alert(e?.message || "Save contract failed.");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [carId, draft]);

  // If contract has no advance, auto-disable includeAdvance
  useMemo(() => {
    if (!contract?.advance_amount) setIncludeAdvance(false);
  }, [contract?.advance_amount]);

  return {
    contract,
    loading,
    saving,
    reload,
    includeAdvance,
    setIncludeAdvance,
    draft,
    setDraft,
    saveDraft,
  };
}
