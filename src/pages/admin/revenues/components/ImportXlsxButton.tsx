
interface ImportXlsxButtonProps {
  onImport: (file: File) => void;
}

export default function ImportXlsxButton({ onImport }: ImportXlsxButtonProps) {
  return (
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("FILE SELECTED:", file.name);

        onImport(file);
      }}
    />
  );
}