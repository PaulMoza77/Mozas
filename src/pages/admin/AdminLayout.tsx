
import { Outlet } from "react-router-dom";
import { AdminTopNav } from "../../components/AdminTopNav";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AdminTopNav />
        <Outlet />
      </div>
    </div>
  );
}
