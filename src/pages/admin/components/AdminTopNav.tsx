
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const Item = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold border transition",
        isActive
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      )
    }
  >
    {label}
  </NavLink>
);

export function AdminTopNav() {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400">ADMIN</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Mozas</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Item to="/admin" label="Overview" />
        <Item to="/admin/expenses" label="Expenses" />
        <Item to="/admin/brands" label="Brands" />
      </div>
    </div>
  );
}
