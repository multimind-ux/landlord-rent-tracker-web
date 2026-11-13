import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Payments from "./pages/Payments";
import RentRecords from "./pages/RentRecords";
import Settings from "./pages/Settings";
import Tenants from "./pages/Tenants";
import Units from "./pages/Units";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/change-password"
              element={
                <ProtectedRoute skipPasswordChangeGuard>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <NotificationProvider>
                    <Layout />
                  </NotificationProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="units" element={<Units />} />
              <Route path="rent-records" element={<RentRecords />} />
              <Route path="payments" element={<Payments />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
