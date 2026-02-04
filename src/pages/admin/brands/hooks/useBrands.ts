// src/pages/admin/brands/hooks/useBrands.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import type { BrandRow, BrandDraft } from "../types";
import { DEFAULT_HOME_BRANDS, LOGO_BUCKET } from "../constants";
import { extFromFile, slugify } from "../utils";

export function useBrands() {
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("mozas_brands")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
    } else {
      setRows((data || []) as BrandRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEmpty = useMemo(() => rows.length === 0, [rows.length]);

  const upsert = useCallback(
    async (draft: BrandDraft) => {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        name: draft.name.trim(),
        slug: slugify(draft.slug || draft.name),
        description: draft.description.trim(),
        logo_url: (draft.logo_url || "").trim() || null,
        overview_url: (draft.overview_url || "").trim(),
        badges: draft.badges || [],
        sort_order: Math.round(Number(draft.sort_order ?? 100)),
        is_active: Boolean(draft.is_active),
      };

      try {
        if (draft.id) {
          const { error } = await supabase.from("mozas_brands").update(payload).eq("id", draft.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("mozas_brands").insert(payload);
          if (error) throw error;
        }
        await load();
      } catch (e: any) {
        setErrorMsg(e?.message || "Save failed.");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      setSaving(true);
      setErrorMsg(null);
      try {
        const { error } = await supabase.from("mozas_brands").delete().eq("id", id);
        if (error) throw error;
        await load();
      } catch (e: any) {
        setErrorMsg(e?.message || "Delete failed.");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  const importDefaultsIfEmpty = useCallback(async () => {
    if (rows.length > 0) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("mozas_brands").insert(
        DEFAULT_HOME_BRANDS.map((b) => ({
          name: b.name,
          slug: b.slug,
          description: b.description,
          logo_url: b.logo_url,
          overview_url: b.overview_url,
          badges: b.badges,
          sort_order: b.sort_order,
          is_active: b.is_active,
        }))
      );

      if (error) throw error;
      await load();
    } catch (e: any) {
      setErrorMsg(e?.message || "Import failed.");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [load, rows.length]);

  const uploadLogo = useCallback(async (file: File, slugOrName: string) => {
    const safeSlug = slugify(slugOrName) || "brand";
    const ext = extFromFile(file);
    const path = `brands/${safeSlug}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || undefined,
    });

    if (upErr) throw upErr;

    const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
    const publicUrl = data?.publicUrl || "";
    return publicUrl;
  }, []);

  return {
    rows,
    loading,
    saving,
    errorMsg,
    setErrorMsg,
    isEmpty,
    load,
    upsert,
    remove,
    importDefaultsIfEmpty,
    uploadLogo,
  };
}
