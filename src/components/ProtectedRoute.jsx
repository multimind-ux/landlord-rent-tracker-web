import { Navigate, useLocation } from "react-router-dom";
import { getMustChangePassword, getToken } from "../api";

// Guards every private page: no token -> go to /login.
// Unless explicitly skipped, a forced password change blocks all other pages.
export default function ProtectedRoute({
  children,
  skipPasswordChangeGuard = false,
}) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!skipPasswordChangeGuard && getMustChangePassword()) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}
