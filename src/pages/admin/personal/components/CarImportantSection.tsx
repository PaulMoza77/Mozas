import { useMemo, useState } from "react";
import { Save, ShieldAlert } from "lucide-react";
import type { useCarImportant } from "../hooks/useCarImportant";

function clsx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function CarImportantSection(props: {
  carId: string;
  hook: ReturnType<typeof useCarImportant>;
}) {
  const { hook } = props;
  const { row, loading, saving, upsert } = hook;

  const [rca, setRca] = useState<string>("");
  const [casco, setCasco] = useState<string>("");
  const [itp, setItp] = useState<string>("");
  const [vig, setVig] = useState<string>("");

  useMemo(() => {
    setRca(row?.rca_expires || "");
    setCasco(row?.casco_expires || "");
    setItp(row?.itp_expires || "");
    setVig(row?.vignette_expires || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.updated_at]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert className="h-4 w-4 text-slate-700" />
            Important
          </div>
          <div className="mt-1 text-xs text-slate-500">RCA / CASCO / ITP / Vignette expiry dates</div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            upsert({
              rca_expires: rca || null,
              casco_expires: casco || null,
              itp_expires: itp || null,
              vignette_expires: vig || null,
            })
          }
          className={clsx(
            "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
            saving ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">RCA expires</div>
          <input
            type="date"
            value={rca}
            onChange={(e) => setRca(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">CASCO expires</div>
          <input
            type="date"
            value={casco}
            onChange={(e) => setCasco(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">ITP expires</div>
          <input
            type="date"
            value={itp}
            onChange={(e) => setItp(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Vignette expires</div>
          <input
            type="date"
            value={vig}
            onChange={(e) => setVig(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </label>
      </div>
    </div>
  );
}
