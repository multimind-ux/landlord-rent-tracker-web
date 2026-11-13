import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  KeyRound,
  Mail,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import Badge from "../components/ui/Badge";
import Button, { buttonClasses } from "../components/ui/Button";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import { Field, Input } from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import Switch from "../components/ui/Switch";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";

const PRESET_DAYS = [7, 3, 2, 1];

function SettingsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-3" aria-label="Loading settings">
      <div className="space-y-6 xl:col-span-2">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          <div className="mt-6 space-y-5">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [customDay, setCustomDay] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/notifications/settings");
      setForm({
        email: data.email || "",
        notify_days_before: Array.isArray(data.notify_days_before)
          ? data.notify_days_before
          : [7, 1],
        notify_on_due_date: Boolean(data.notify_on_due_date),
        overdue_reminder_every_days: data.overdue_reminder_every_days || 3,
        email_enabled: Boolean(data.email_enabled),
      });
    } catch (err) {
      setError(errorMessage(err, "Could not load notification settings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const availableDays = useMemo(() => {
    const values = new Set([
      ...PRESET_DAYS,
      ...(form?.notify_days_before || []),
    ]);
    return Array.from(values).sort((a, b) => b - a);
  }, [form]);

  function toggleDay(day) {
    setForm((current) => {
      const selected = new Set(current.notify_days_before);
      if (selected.has(day)) {
        selected.delete(day);
      } else {
        selected.add(day);
      }
      return {
        ...current,
        notify_days_before: Array.from(selected).sort((a, b) => b - a),
      };
    });
  }

  function addCustomDay() {
    const value = Number(customDay);
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 365 ||
      form.notify_days_before.includes(value)
    ) {
      toast("Enter a whole number from 0 to 365 that is not already selected.", "error");
      return;
    }
    setForm((current) => ({
      ...current,
      notify_days_before: [...current.notify_days_before, value].sort(
        (a, b) => b - a
      ),
    }));
    setCustomDay("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/notifications/settings", {
        email: form.email.trim(),
        notify_days_before: form.notify_days_before,
        notify_on_due_date: form.notify_on_due_date,
        overdue_reminder_every_days: Number(form.overdue_reminder_every_days),
        email_enabled: form.email_enabled,
      });
      setForm((current) => ({
        ...current,
        ...data,
        notify_days_before: data.notify_days_before,
      }));
      toast("Reminder settings saved.", "success");
    } catch (err) {
      toast(errorMessage(err, "Could not save reminder settings."), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Choose how and when RentTracker reminds you about rent."
        />
        <SettingsSkeleton />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Choose how and when RentTracker reminds you about rent."
        />
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Choose who receives reminders, when they are sent, and how often overdue rent is repeated."
      />

      <ErrorBanner message={error} onRetry={load} />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card>
              <CardHeader
                title="Rent reminder settings"
                description="These settings apply to the single landlord account."
                action={
                  <Badge tone={form.email_enabled ? "green" : "neutral"} dot>
                    Email {form.email_enabled ? "on" : "off"}
                  </Badge>
                }
              />
              <CardBody className="space-y-6">
                <Field
                  label="Notification email"
                  htmlFor="settings-email"
                  hint="One daily summary email is sent to this address when rent is due."
                >
                  <Input
                    id="settings-email"
                    type="email"
                    icon={Mail}
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="landlord@example.com"
                    required
                  />
                </Field>

                <div className="border-t border-line pt-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-ink">
                      Days before the due date
                    </p>
                    <p className="text-xs leading-5 text-muted">
                      Choose every reminder point before rent is due.
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableDays.map((day) => {
                      const active = form.notify_days_before.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "inline-flex h-9 min-w-14 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20",
                            active
                              ? "border-accent/30 bg-accent-soft text-accent"
                              : "border-line bg-surface text-muted hover:bg-elevated hover:text-ink"
                          )}
                        >
                          {day === 0 ? "Due day" : `${day} ${day === 1 ? "day" : "days"}`}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="w-full sm:w-48">
                      <Input
                        type="number"
                        min="0"
                        max="365"
                        step="1"
                        value={customDay}
                        onChange={(event) => setCustomDay(event.target.value)}
                        placeholder="Add a custom day"
                        aria-label="Custom reminder day"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={addCustomDay}
                    >
                      Add day
                    </Button>
                    {form.notify_days_before.length === 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Select at least one reminder day.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 border-t border-line pt-5">
                  <Switch
                    id="notify-on-due-date"
                    checked={form.notify_on_due_date}
                    onChange={(value) =>
                      setForm({ ...form, notify_on_due_date: value })
                    }
                    label="Remind me on the due date"
                    description="Create a notification when rent is due today."
                  />
                  <Switch
                    id="email-enabled"
                    checked={form.email_enabled}
                    onChange={(value) =>
                      setForm({ ...form, email_enabled: value })
                    }
                    label="Send a summary email"
                    description="In-app notifications are always created; this only controls email delivery."
                  />
                </div>

                <div className="border-t border-line pt-5">
                  <Field
                    label="Repeat overdue reminders every"
                    htmlFor="overdue-every"
                    hint="The first overdue reminder is sent immediately, then repeated at this interval."
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        id="overdue-every"
                        type="number"
                        min="1"
                        max="365"
                        step="1"
                        value={form.overdue_reminder_every_days}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            overdue_reminder_every_days: event.target.value,
                          })
                        }
                        className="w-28"
                        required
                      />
                      <span className="text-sm text-muted">days</span>
                    </div>
                  </Field>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
                  <Button type="submit" icon={Save} loading={saving}>
                    Save settings
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader
                title="How reminders work"
                description="A quick look at the daily reminder job."
              />
              <CardBody className="space-y-4">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <BellRing className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">Every morning</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      The job runs at 07:00 Africa/Lagos and checks every unpaid
                      or partial rent record.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Settings2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">One summary email</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      All matches for the day are combined into a single email to
                      keep your inbox quiet.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Account security"
                description="Your landlord account password."
              />
              <CardBody>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Keep your account secure
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">
                      Use a unique password and change it if you think it has been
                      shared.
                    </p>
                  </div>
                </div>
                <Link
                  to="/change-password"
                  className={buttonClasses({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-4 w-full",
                  })}
                >
                  <KeyRound className="h-4 w-4" />
                  Change password
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
