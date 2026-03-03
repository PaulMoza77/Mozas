import React from "react";
// import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImportXlsxButtonProps {
  onImport: (file: File) => void;
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
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.currentTarget.value = "";
        }}
      />
        <button className="btn btn-outline flex items-center" type="button" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        Import XLSX
        </button>
    </>
  );
}