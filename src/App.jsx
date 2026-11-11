import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Payments from "./pages/Payments";
import RentRecords from "./pages/RentRecords";
import Tenants from "./pages/Tenants";
import Units from "./pages/Units";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Every other page lives inside the protected layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="units" element={<Units />} />
          <Route path="rent-records" element={<RentRecords />} />
          <Route path="payments" element={<Payments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
