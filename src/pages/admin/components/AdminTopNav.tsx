import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";

const Item = ({ to, label }: { to: string; label: string }) => {
  const loc = useLocation();
  const active =
    loc.pathname === to || (to !== "/admin" && loc.pathname.startsWith(to + "/"));

  return (
    <NavLink
      to={to}
      className={() =>
        clsx(
          "inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold border transition",
          active
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        )
      }
    >
      {label}
    </NavLink>
  );
};

export function AdminTopNav() {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-slate-50/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400">
              ADMIN
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Mozas
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Item to="/admin" label="Overview" />
            <Item to="/admin/expenses" label="Expenses" />
            <Item to="/admin/personal" label="Personal" />
            <Item to="/admin/brands" label="Brands" />
          </div>
        </div>
      </div>
    </div>
  );
}
