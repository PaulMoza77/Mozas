import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

const STORAGE_KEY = "mozas_admin_authed_v1";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const passcode = import.meta.env.VITE_ADMIN_PASSCODE as string | undefined;

  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const enabled = useMemo(() => Boolean(passcode && passcode.length >= 6), [passcode]);

  useEffect(() => {
    console.log("Component mounted, checking auth...");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "1") setAuthed(true);
  }, []);

  if (!enabled) {
    // If env var missing/misconfigured, fail closed.
    return <Navigate to="/" replace />;
  }

  if (authed) return <>{children}</>;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (input === passcode) {
      localStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      return;
    }
    setErr("Wrong passcode.");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Admin Access
          </p>
          <h1 className="mt-2 text-xl font-semibold">Enter passcode</h1>
          <p className="mt-1 text-sm text-slate-500">
            This area is restricted.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Passcode"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />

            {err && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl border border-slate-900 bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Unlock Admin
            </button>

            <a
              href="/"
              className="block text-center text-[11px] text-slate-500 underline underline-offset-2"
            >
              Back to site
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
