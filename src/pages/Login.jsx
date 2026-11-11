import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, errorMessage, getToken, saveToken } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already logged in? Go straight to the dashboard.
  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveToken(data.access_token);
      navigate(location.state?.from || "/", { replace: true });
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
              placeholder="landlord@example.com"
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
          First time here? Create the landlord account once with{" "}
          <code>POST /auth/register</code> (see the README), then log in with
          those details.
        </p>
      </div>
    </div>
  );
}
