// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./pages/Home";
import AdminGate from "./pages/AdminGate";

import Admin from "./pages/Admin";
import AdminBrands from "./pages/AdminBrands";
import AdminExpenses from "./pages/AdminExpenses";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= Public ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= Admin Login ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= Admin (protected) ================= */}
        <Route
          path="/admin"
          element={
            <AdminGate>
              <Admin />
            </AdminGate>
          }
        />

        <Route
          path="/admin/brands"
          element={
            <AdminGate>
              <AdminBrands />
            </AdminGate>
          }
        />

        <Route
          path="/admin/expenses"
          element={
            <AdminGate>
              <AdminExpenses />
            </AdminGate>
          }
        />

        {/* ================= Fallback ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
