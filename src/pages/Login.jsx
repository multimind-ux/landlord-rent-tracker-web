import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Mail } from "lucide-react";
import {
  api,
  errorMessage,
  getMustChangePassword,
  getToken,
  saveToken,
  setMustChangePassword,
} from "../api";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage rent, tenants and reminders."
      footer={
        <p className="text-xs leading-5 text-muted">
          Accounts are created by your administrator. There is no public
          registration.
        </p>
      }
    >
      {error && (
        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            icon={Mail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 rounded-xl bg-elevated/60 px-3.5 py-3">
        <p className="text-[11px] leading-5 text-muted">
          On your first login you will be asked to choose a new password.
        </p>
      </div>
    </AuthShell>
  );
}
