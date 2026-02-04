// src/pages/admin/expenses/hooks/useAiMock.ts
import { useEffect } from "react";
import type { Draft } from "../types";

export function useAiMock(opts: {
  editorOpen: boolean;
  editing: Draft | null;
  setEditing: React.Dispatch<React.SetStateAction<Draft | null>>;
}) {
  const { editorOpen, editing, setEditing } = opts;

  useEffect(() => {
    if (!editorOpen || !editing) return;
    if (!editing.receiptPreview) return;

    setEditing((prev) =>
      prev
        ? {
            ...prev,
            aiSuggestion: {
              main: "Operational",
              sub: "Combustibil",
              confidence: 92,
            },
          }
        : prev
    );
  }, [editorOpen, editing?.receiptPreview, setEditing]);
}
