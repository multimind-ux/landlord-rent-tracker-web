import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  api,
  errorMessage,
  getMustChangePassword,
  getToken,
  saveToken,
  setMustChangePassword,
} from "../api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already logged in? Respect a pending forced password change.
  if (getToken()) {
    return (
      <Navigate
        to={getMustChangePassword() ? "/change-password" : "/"}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveToken(data.access_token);
      setMustChangePassword(data.must_change_password);
      const destination = data.must_change_password
        ? "/change-password"
        : location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        errorMessage(err, "Login failed. Check your email and password.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span aria-hidden="true">🏠</span> RentTracker
        </div>
        <h1>Landlord login</h1>
        <p className="sub">Track rent, tenants and vacant units in one place.</p>

        {error && (
          <div className="alert error" role="alert" style={{ marginTop: 18 }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-note">
          Use the landlord account provided by your administrator. You will be
          asked to change the password on first login.
        </p>
      </div>
    </div>
  );
}
