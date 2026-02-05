// src/pages/admin/expenses/components/modal/AiSuggestionBox.tsx
import type { Draft } from "../../types.ts";

export function AiSuggestionBox(props: { editing: Draft; onApply: () => void }) {
  const { editing, onApply } = props;
  if (!editing.aiSuggestion) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm">
      <p className="font-semibold text-sky-700">
        AI suggestion ({editing.aiSuggestion.confidence}%)
      </p>
      <p className="mt-1">
        {editing.aiSuggestion.main} / {editing.aiSuggestion.sub}
      </p>
      <button
        type="button"
        onClick={onApply}
        className="mt-2 inline-flex rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Apply
      </button>
    </div>
  );
}
