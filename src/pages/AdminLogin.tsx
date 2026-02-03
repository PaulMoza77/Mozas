// src/pages/AdminLogin.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ✅ Always return to your production domain after OAuth
const PROD_ORIGIN = "https://themozas.com";

function safePath(p: string) {
  if (!p || typeof p !== "string") return "/admin";
  return p.startsWith("/") ? p : "/admin";
}

export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If user came from AdminGate, we keep that path; default /admin
  const returnPath = useMemo(() => {
    const state = loc.state as any;
    return safePath(typeof state?.from === "string" ? state.from : "/admin");
  }, [loc.state]);

  // ✅ Redirect target for Supabase OAuth
  const redirectTo = useMemo(() => `${PROD_ORIGIN}${returnPath}`, [returnPath]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setErr(null);
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      if (data.session?.user?.email) {
        nav(returnPath, { replace: true });
        return;
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!alive) return;
      if (session?.user?.email) {
        nav(returnPath, { replace: true });
      }
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, [nav, returnPath]);

  const signInGoogle = async () => {
    setBusy(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo, // ✅ always goes to https://themozas.com/admin (or /admin/...)
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) setErr(error.message);
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Admin</p>
            <h1 className="mt-2 text-xl font-semibold">Loading…</h1>
            <p className="mt-1 text-sm text-slate-500">Checking session.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Admin Access</p>
          <h1 className="mt-2 text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Continue with Google to access admin.</p>

          {err && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              {err}
            </div>
          )}

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={signInGoogle}
              disabled={busy}
              className="w-full rounded-xl border border-slate-900 bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Redirecting…" : "Continue with Google"}
            </button>

            <a
              href="/"
              className="block text-center text-[11px] text-slate-500 underline underline-offset-2"
            >
              Back to site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
