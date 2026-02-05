// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { Home } from "./pages/Home";
import AdminGate from "./pages/AdminGate";

import Admin from "./pages/Admin";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminPersonal from "./pages/admin/AdminPersonal";
import AdminLogin from "./pages/AdminLogin";

import { AdminTopNav } from "./pages/admin/components/AdminTopNav";

function AdminLayout() {
  return (
    <AdminGate>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <AdminTopNav />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </div>
    </AdminGate>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Admin login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin protected */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path="expenses" element={<AdminExpenses mode="business" />} />
          <Route path="personal" element={<AdminPersonal />} />
          <Route path="brands" element={<AdminBrands />} />

          {/* Unknown admin routes -> /admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Unknown public routes -> Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
