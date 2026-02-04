import { useRef } from "react";
import { Upload } from "lucide-react";
import type { ImportExpensePayload } from "../utils/parseVolocarDubaiXlsx";
import { parseVolocarDubaiXlsx } from "../utils/parseVolocarDubaiXlsx";

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export function ImportXlsxButton(props: {
  disabled?: boolean;
  year: number;
  brand: string;
  currency: string;
  status: string;
  onImport: (payloads: ImportExpensePayload[]) => Promise<void>;
}) {
  const { disabled, year, brand, currency, status, onImport } = props;
  const ref = useRef<HTMLInputElement | null>(null);

  const pick = () => ref.current?.click();

  const onFile = async (file: File) => {
    const payloads = await parseVolocarDubaiXlsx(file, {
      year,
      brand,
      currency,
      status,
      notePrefix: "Volocar Dubai",
    });

    if (!payloads.length) {
      alert("Nu am găsit sume în XLSX (sau sunt toate goale).");
      return;
    }

    const ok = window.confirm(`Import ${payloads.length} cheltuieli din XLSX?`);
    if (!ok) return;

    await onImport(payloads);
  };

  return (
    <>
      <button
        type="button"
        onClick={pick}
        disabled={disabled}
        className={cx(
          "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50",
          disabled && "opacity-60 pointer-events-none"
        )}
      >
        <Upload className="h-4 w-4" />
        Import XLSX
      </button>

      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={async (e) => {
          const f = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (!f) return;
          try {
            await onFile(f);
          } catch (err: any) {
            alert(err?.message || "Import XLSX failed.");
          }
        }}
      />
    </>
  );
}
