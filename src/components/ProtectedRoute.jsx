import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../api";

// Guards every private page: no token -> go to /login.
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
