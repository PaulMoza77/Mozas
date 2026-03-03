import React from "react";

interface ImportXlsxButtonProps {
  onImport: (file: File) => void;
}

const ImportXlsxButton: React.FC<ImportXlsxButtonProps> = ({ onImport }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
      <span>Import XLSX</span>
      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
};

export default ImportXlsxButton;
