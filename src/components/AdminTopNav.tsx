// src/pages/admin/components/AdminTopNav.tsx
import { NavLink } from "react-router-dom";

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function Tab(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cx(
          "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-slate-900 text-white shadow"
            : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        )
      }
    >
      {props.label}
    </NavLink>
  );
}

export function AdminTopNav(props: { className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-2", props.className)}>
      <Tab to="/admin" label="Overview" />
      <Tab to="/admin/brands" label="Brands" />
      <Tab to="/admin/expenses" label="Expenses" />
    </div>
  );
}
