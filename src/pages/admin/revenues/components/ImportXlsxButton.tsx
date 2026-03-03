
interface ImportXlsxButtonProps {
  onImport: (file: File) => void;
}

export default function ImportXlsxButton({ onImport }: ImportXlsxButtonProps) {
  return (
    <label style={{cursor:"pointer",background:"#2563eb",color:"white",padding:"8px 14px",borderRadius:"6px"}}>
      Import XLSX
      <input
        type="file"
        accept=".xlsx,.xls"
        style={{display:"none"}}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          console.log("FILE SELECTED:", file.name);

          onImport(file);
        }}
      />
    </label>
  );
}