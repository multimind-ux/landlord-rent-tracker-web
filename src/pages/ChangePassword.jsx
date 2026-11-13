import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api,
  errorMessage,
  getMustChangePassword,
  setMustChangePassword,
} from "../api";
import Toast from "../components/Toast";

export default function ChangePassword() {
  const navigate = useNavigate();
  const forced = getMustChangePassword();
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.current) {
      nextErrors.current = "Enter your current password.";
    }
    if (!form.next) {
      nextErrors.next = "Enter a new password.";
    } else if (form.next.length < 8) {
      nextErrors.next = "New password must be at least 8 characters.";
    } else if (form.next === form.current) {
      nextErrors.next = "New password must be different from the current password.";
    }
    if (!form.confirm) {
      nextErrors.confirm = "Confirm your new password.";
    } else if (form.next !== form.confirm) {
      nextErrors.confirm = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        current_password: form.current,
        new_password: form.next,
      });
      setMustChangePassword(false);
      setForm({ current: "", next: "", confirm: "" });
      setToast({ type: "success", message: "Password changed successfully." });
      window.setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      const message = errorMessage(err, "Could not change your password.");
      setToast({ type: "error", message });
      if (message.toLowerCase().includes("current password")) {
        setErrors((current) => ({ ...current, current: message }));
      }
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
        <h1>Change password</h1>
        <p className="sub">
          {forced
            ? "Your account was created by the administrator. Set a new password to continue."
            : "Choose a new password for your account."}
        </p>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={form.current}
              onChange={(event) => updateField("current", event.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.current)}
              aria-describedby={errors.current ? "current-password-error" : undefined}
            />
            {errors.current && (
              <p className="field-error" id="current-password-error" role="alert">
                {errors.current}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={form.next}
              onChange={(event) => updateField("next", event.target.value)}
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.next)}
              aria-describedby={errors.next ? "new-password-error" : undefined}
            />
            {errors.next && (
              <p className="field-error" id="new-password-error" role="alert">
                {errors.next}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => updateField("confirm", event.target.value)}
              placeholder="Repeat the new password"
              aria-invalid={Boolean(errors.confirm)}
              aria-describedby={errors.confirm ? "confirm-password-error" : undefined}
            />
            {errors.confirm && (
              <p className="field-error" id="confirm-password-error" role="alert">
                {errors.confirm}
              </p>
            )}
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>

        {!forced && (
          <p className="login-note">
            <Link to="/">Back to dashboard</Link>
          </p>
        )}
      </div>
    </div>
  );
}
