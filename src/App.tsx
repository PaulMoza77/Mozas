import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import Admin from "./pages/Admin";
import Expenses from "./pages/Expenses";
import AdminGate from "./pages/AdminGate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Admin overview */}
        <Route
          path="/admin"
          element={
            <AdminGate>
              <Admin />
            </AdminGate>
          }
        />

        {/* Admin – Expenses */}
        <Route
          path="/admin/expenses"
          element={
            <AdminGate>
              <Expenses />
            </AdminGate>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
