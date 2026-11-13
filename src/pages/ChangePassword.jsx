import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import {
  api,
  errorMessage,
  getMustChangePassword,
  setMustChangePassword,
} from "../api";
import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/ui/Button";
import { Field } from "../components/ui/Input";
import { useToast } from "../context/ToastContext";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const forced = getMustChangePassword();
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      nextErrors.next =
        "New password must be different from the current password.";
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
      toast("Password changed successfully.", "success");
      window.setTimeout(() => navigate("/", { replace: true }), 900);
    } catch (err) {
      const message = errorMessage(err, "Could not change your password.");
      toast(message, "error");
      if (message.toLowerCase().includes("current password")) {
        setErrors((current) => ({ ...current, current: message }));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Change password"
      subtitle={
        forced
          ? "Set a new password before continuing to your workspace."
          : "Choose a new password for your landlord account."
      }
      footer={
        !forced ? (
          <Link
            to="/"
            className="text-xs font-semibold text-accent hover:text-accent-hover"
          >
            Back to dashboard
          </Link>
        ) : null
      }
    >
      {forced && (
        <div className="mb-5 flex gap-3 rounded-xl border border-accent/20 bg-accent-soft px-3.5 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-xs leading-5 text-accent">
            Your account was created by the administrator. Choose a private
            password to unlock the rest of the app.
          </p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Field
          label="Current password"
          htmlFor="current-password"
          error={errors.current}
        >
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            value={form.current}
            onChange={(event) => updateField("current", event.target.value)}
            placeholder="Enter your current password"
            aria-invalid={Boolean(errors.current)}
          />
        </Field>

        <Field
          label="New password"
          htmlFor="new-password"
          error={errors.next}
          hint={!errors.next ? "Use at least 8 characters." : undefined}
        >
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={form.next}
            onChange={(event) => updateField("next", event.target.value)}
            placeholder="At least 8 characters"
            aria-invalid={Boolean(errors.next)}
          />
        </Field>

        <Field
          label="Confirm new password"
          htmlFor="confirm-password"
          error={errors.confirm}
        >
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => updateField("confirm", event.target.value)}
            placeholder="Repeat the new password"
            aria-invalid={Boolean(errors.confirm)}
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          icon={KeyRound}
        >
          {loading ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
