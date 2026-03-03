import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import React from "react";

const Item = ({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) => {
  const loc = useLocation();
  const active =
    loc.pathname === to || (to !== "/admin" && loc.pathname.startsWith(to + "/"));

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={() =>
        clsx(
          "flex items-center rounded-lg px-4 py-2 text-sm font-semibold border transition w-full",
          active
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
        )
      }
    >
      {label}
    </NavLink>
  );
};

export function AdminTopNav() {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 bg-slate-900 text-white rounded-full p-2 shadow-lg focus:outline-none sm:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? (
          <span>&#10005;</span>
        ) : (
          <span>&#9776;</span>
        )}
      </button>
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 h-full w-64 bg-slate-50 border-r border-slate-200 shadow-lg transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "sm:translate-x-0"
        )}
      >
        <div className="px-6 py-6 flex flex-col gap-6 h-full">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400 mb-1">
              ADMIN
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
              Mozas
            </h1>
          </div>
          <nav className="flex flex-col gap-2">
            <Item to="/admin" label="Overview" onClick={() => setOpen(false)} />
            <Item to="/admin/expenses" label="Expenses" onClick={() => setOpen(false)} />
            <Item to="/admin/revenues" label="Revenues" onClick={() => setOpen(false)} />
            <Item to="/admin/personal" label="Personal" onClick={() => setOpen(false)} />
            <Item to="/admin/brands" label="Brands" onClick={() => setOpen(false)} />
          </nav>
          <div className="flex-1" />
          <div className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Mozas</div>
        </div>
      </aside>
      {/* Padding left for main content on desktop */}
      <div className="sm:pl-64" />
    </>
  );
}
