// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./pages/Home";
import Admin from "./pages/Admin";
import Expenses from "./pages/Expenses";
import AdminGate from "./pages/AdminGate";
import AdminBrands from "./pages/AdminBrands";
import AdminExpenses from "./pages/AdminExpenses";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
