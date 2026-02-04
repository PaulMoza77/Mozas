// src/pages/admin/brands/components/LogoUploader.tsx

import { Upload } from "lucide-react";
import { cx } from "../utils";

export function LogoUploader(props: {
  logoUrl: string;
  uploading: boolean;
  onPick: (file: File) => void;
}) {
  const { logoUrl, uploading, onPick } = props;

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {logoUrl ? <img src={logoUrl} alt="logo" className="h-full w-full object-contain" /> : null}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Upload logo</p>
          <p className="text-[11px] text-slate-500">PNG / JPG / WEBP / SVG</p>
        </div>
      </div>

      <label
        className={cx(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : "Choose file"}
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            onPick(f);
            e.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}
