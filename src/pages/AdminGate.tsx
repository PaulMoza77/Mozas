// src/components/AdminGate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Props = { children: React.ReactNode };

type GateStatus = "loading" | "need_login" | "denied" | "ok";

export default function AdminGate({ children }: Props) {
  const loc = useLocation();

  const [status, setStatus] = useState<GateStatus>("loading");
  const [deniedMsg, setDeniedMsg] = useState<string | null>(null);

  const allowlist = useMemo(() => {
    const raw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? "";
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
  }, []);

  const check = async () => {
    setStatus("loading");
    setDeniedMsg(null);

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setStatus("need_login");
      return;
    }

    const session = data.session;
    const email = session?.user?.email?.toLowerCase() ?? "";

    // not logged in
    if (!session || !email) {
      setStatus("need_login");
      return;
    }

    // allowlist is primary (recommended)
    if (allowlist.size > 0) {
      if (!allowlist.has(email)) {
        setDeniedMsg("Access denied for this account.");
        setStatus("denied");
        return;
      }
      setStatus("ok");
      return;
    }

    // optional claim fallback (only if no allowlist)
    const isAdminClaim =
      Boolean((session.user.user_metadata as any)?.is_admin) ||
      Boolean((session.user.app_metadata as any)?.is_admin);

    if (isAdminClaim) {
      setStatus("ok");
      return;
    }

    setDeniedMsg("Admin is not configured (missing allowlist).");
    setStatus("denied");
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await check();
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (!alive) return;
      check();
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowlist.size]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (status === "need_login") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: loc.pathname + loc.search }}
      />
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white text-slate-900 px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Admin
            </p>
            <h1 className="mt-2 text-xl font-semibold">Checking access…</h1>
            <p className="mt-1 text-sm text-slate-500">Please wait a moment.</p>
            <div className="mt-5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/2 bg-slate-900 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-white text-slate-900 px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Admin Access
            </p>
            <h1 className="mt-2 text-xl font-semibold">Access denied</h1>
            <p className="mt-1 text-sm text-slate-500">
              {deniedMsg ?? "Access denied."}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={signOut}
                className="w-full rounded-xl border border-slate-900 bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Sign out
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

  // status === "ok"
  return <>{children}</>;
}
