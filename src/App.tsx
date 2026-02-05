// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { Home } from "./pages/Home";
import AdminGate from "./pages/AdminGate";

import Admin from "./pages/Admin";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminLogin from "./pages/AdminLogin";

import { AdminTopNav } from "./pages/admin/components/AdminTopNav";

function AdminLayout() {
  return (
    <AdminGate>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Global admin navigation */}
        <AdminTopNav />

        {/* Page content */}
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

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin protected */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
