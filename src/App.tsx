// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./pages/Home";
import AdminGate from "./pages/AdminGate";

import Admin from "./pages/Admin";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminLogin from "./pages/AdminLogin";

function AdminLayout() {
  return (
    <AdminGate>
      {/* AdminGate returnează children -> aici intră toate rutele admin */}
      <Routes>
        <Route index element={<Admin />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="expenses" element={<AdminExpenses />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
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

        {/* Admin protected group */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
