import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Copy,
  Phone,
  Plus,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import Badge from "../components/ui/Badge";
import { buttonClasses } from "../components/ui/Button";
import Button from "../components/ui/Button";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import Table, { Td, Th } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import { copyText } from "../utils/clipboard";
import {
  dateInDays,
  formatDate,
  formatMoney,
  todayISO,
  unitTypeLabel,
} from "../utils/format";

const ICON_TONES = {
  indigo: "bg-accent-soft text-accent",
  green:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

function StatCard({ label, value, hint, icon: Icon, tone }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-dropdown">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </article>
  );
}

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Dashboard() {
  const { toast } = useToast();
  const [summary, setSummary] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [vacant, setVacant] = useState([]);
  const [records, setRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [
        summaryRes,
        overdueRes,
        vacantRes,
        recordsRes,
        tenantsRes,
        unitsRes,
      ] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/overdue"),
        api.get("/dashboard/vacant"),
        api.get("/rent-records"),
        api.get("/tenants"),
        api.get("/units"),
      ]);
      setSummary(summaryRes.data);
      setOverdue(overdueRes.data);
      setVacant(vacantRes.data);
      setRecords(recordsRes.data);
      setTenants(tenantsRes.data);
      setUnits(unitsRes.data);
    } catch (err) {
      setError(errorMessage(err, "Could not load the dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tenantById = useMemo(
    () => Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant])),
    [tenants]
  );
  const unitById = useMemo(
    () => Object.fromEntries(units.map((unit) => [unit.id, unit])),
    [units]
  );

  const today = todayISO();
  const weekEnd = dateInDays(7);
  const dueThisWeek = useMemo(
    () =>
      records
        .filter(
          (record) =>
            record.status !== "paid" &&
            record.due_date >= today &&
            record.due_date <= weekEnd
        )
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .slice(0, 6),
    [records, today, weekEnd]
  );

  const collectedPercent =
    summary && summary.total_expected > 0
      ? Math.min(
          100,
          Math.round(
            (summary.total_collected / summary.total_expected) * 100
          )
        )
      : 0;

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleCopyReminder(row) {
    const outstanding = Math.max(
      Number(row.amount_due || 0) - Number(row.amount_paid || 0),
      0
    );
    const message = `Hello ${row.tenant_name}, your rent of ${formatMoney(
      outstanding
    )} for ${row.unit_name} was due on ${formatDate(
      row.due_date
    )}. Kindly make payment. Thank you.`;
    const copied = await copyText(message);
    toast(
      copied
        ? "Reminder message copied to your clipboard."
        : "Could not copy the reminder message.",
      copied ? "success" : "error"
    );
  }

  if (loading) return <DashboardSkeleton />;

  if (!summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="A live overview of rent, tenants and reminders."
        />
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live overview of rent, tenants and reminders across your building."
        actions={
          <>
            <span className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-muted shadow-sm sm:inline-flex">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(today)}
            </span>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Link
              to="/rent-records"
              className={buttonClasses({ variant: "primary", size: "md" })}
            >
              <Plus className="h-4 w-4" />
              New record
            </Link>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Expected rent"
          value={formatMoney(summary.total_expected)}
          hint="Total rent billed"
          icon={Wallet}
          tone="indigo"
        />
        <StatCard
          label="Collected"
          value={formatMoney(summary.total_collected)}
          hint={`${collectedPercent}% of expected rent`}
          icon={Banknote}
          tone="green"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.total_outstanding)}
          hint="Balance still owed"
          icon={AlertCircle}
          tone="amber"
        />
        <StatCard
          label="Overdue tenants"
          value={summary.overdue_tenants}
          hint={
            summary.overdue_tenants
              ? "Needs a follow-up"
              : "Everyone is up to date"
          }
          icon={Users}
          tone={summary.overdue_tenants ? "red" : "green"}
        />
      </section>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Collection progress</p>
              <p className="mt-1 text-xs text-muted">
                {formatMoney(summary.total_collected)} collected of{" "}
                {formatMoney(summary.total_expected)} expected
              </p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-ink">
              {collectedPercent}%
            </p>
          </div>
          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-elevated"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={collectedPercent}
            aria-label="Rent collected compared with expected rent"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-indigo-400 transition-all duration-500"
              style={{ width: `${collectedPercent}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-xl bg-elevated/60 p-3">
              <p className="text-muted">Expected</p>
              <p className="mt-1 font-semibold text-ink">
                {formatMoney(summary.total_expected)}
              </p>
            </div>
            <div className="rounded-xl bg-elevated/60 p-3">
              <p className="text-muted">Collected</p>
              <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                {formatMoney(summary.total_collected)}
              </p>
            </div>
            <div className="rounded-xl bg-elevated/60 p-3">
              <p className="text-muted">Outstanding</p>
              <p className="mt-1 font-semibold text-amber-600 dark:text-amber-400">
                {formatMoney(summary.total_outstanding)}
              </p>
            </div>
            <div className="rounded-xl bg-elevated/60 p-3">
              <p className="text-muted">Vacant units</p>
              <p className="mt-1 font-semibold text-ink">{vacant.length}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Card>
            <CardHeader
              title="Overdue rent"
              description="Balances past their due date. Copy a reminder in one tap."
              action={
                <Badge tone={overdue.length ? "red" : "green"} dot>
                  {overdue.length} {overdue.length === 1 ? "tenant" : "tenants"}
                </Badge>
              }
            />
            {overdue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No overdue rent"
                description="Everything is up to date. Overdue balances will appear here automatically."
                action={
                  <Link
                    to="/rent-records"
                    className={buttonClasses({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    View rent records
                  </Link>
                }
              />
            ) : (
              <Table minWidth="680px">
                <thead>
                  <tr>
                    <Th>Tenant</Th>
                    <Th>Unit</Th>
                    <Th className="text-right">Outstanding</Th>
                    <Th>Due date</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((row) => {
                    const outstanding = Math.max(
                      Number(row.amount_due || 0) -
                        Number(row.amount_paid || 0),
                      0
                    );
                    return (
                      <tr key={row.rent_record_id} className="hover:bg-elevated/30">
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                              {initials(row.tenant_name)}
                            </span>
                            <span className="font-medium text-ink">
                              {row.tenant_name}
                            </span>
                          </div>
                        </Td>
                        <Td className="text-muted">{row.unit_name}</Td>
                        <Td className="text-right font-semibold">
                          {formatMoney(outstanding)}
                        </Td>
                        <Td>
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="text-muted">
                              {formatDate(row.due_date)}
                            </span>
                            <Badge tone="red">
                              {row.days_overdue}{" "}
                              {row.days_overdue === 1 ? "day" : "days"} overdue
                            </Badge>
                          </div>
                        </Td>
                        <Td className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Copy}
                            onClick={() => handleCopyReminder(row)}
                          >
                            Copy reminder
                          </Button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Due this week"
              description="Upcoming balances in the next 7 days."
              action={
                <Link
                  to="/rent-records"
                  className="text-xs font-semibold text-accent hover:text-accent-hover"
                >
                  View all
                </Link>
              }
            />
            {dueThisWeek.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing due this week"
                description="New upcoming rent records will show up here."
                action={
                  <Link
                    to="/rent-records"
                    className={buttonClasses({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    Create a record
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {dueThisWeek.map((record) => {
                  const tenant = tenantById[record.tenant_id];
                  const unit = tenant ? unitById[tenant.unit_id] : null;
                  return (
                    <li key={record.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {tenant?.name || `Tenant #${record.tenant_id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {unit?.name || "Unit"} · due{" "}
                            {formatDate(record.due_date)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-ink">
                          {formatMoney(
                            Math.max(
                              record.amount_due - record.amount_paid,
                              0
                            )
                          )}
                        </p>
                      </div>
                      {tenant?.phone && (
                        <a
                          href={`tel:${tenant.phone}`}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {tenant.phone}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              title="Vacant units"
              description="Rooms ready for a new tenant."
              action={
                <Link
                  to="/units"
                  className="text-xs font-semibold text-accent hover:text-accent-hover"
                >
                  Manage
                </Link>
              }
            />
            {vacant.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="All units are occupied"
                description="Nice work. Vacant units will appear here when a tenant moves out."
              />
            ) : (
              <ul className="divide-y divide-line">
                {vacant.map((unit) => (
                  <li
                    key={unit.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{unit.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {unitTypeLabel[unit.type] || unit.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">
                        {formatMoney(unit.rent_amount)}
                      </p>
                      <Badge tone="amber" className="mt-1">
                        Vacant
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Link
            to="/notifications"
            className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent-soft px-5 py-4 text-accent transition hover:border-accent/40"
          >
            <Bell className="h-5 w-5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Review reminders</p>
              <p className="mt-0.5 text-xs text-accent/80">
                See due-soon and overdue notifications.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
