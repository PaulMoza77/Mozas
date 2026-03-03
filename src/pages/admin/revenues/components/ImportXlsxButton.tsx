import React from "react";

interface ImportXlsxButtonProps {
  onImport: (file: File) => void | Promise<void>;
}

export default function ImportXlsxButton({ onImport }: ImportXlsxButtonProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.currentTarget.value = ""; // allow re-upload same file
          if (!file) return;

          try {
            await onImport(file);
          } catch (err: any) {
            alert("Upload/import error: " + String(err?.message ?? err));
          }
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        Import XLSX
      </button>
    </>
  );
}