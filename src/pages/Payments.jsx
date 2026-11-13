import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Plus, Search } from "lucide-react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import Badge from "../components/ui/Badge";
import Button, { buttonClasses } from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import { Field, Input, Select } from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { PageSkeleton } from "../components/ui/Skeleton";
import Table, { Td, Th } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import { formatDate, formatMoney, todayISO } from "../utils/format";

export default function Payments() {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [records, setRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ recordId: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [paymentRes, recordRes, tenantRes, unitRes] = await Promise.all([
        api.get("/payments"),
        api.get("/rent-records"),
        api.get("/tenants"),
        api.get("/units"),
      ]);
      setPayments(paymentRes.data);
      setRecords(recordRes.data);
      setTenants(tenantRes.data);
      setUnits(unitRes.data);
    } catch (err) {
      setError(errorMessage(err, "Could not load payments."));
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
  const recordById = useMemo(
    () => Object.fromEntries(records.map((record) => [record.id, record])),
    [records]
  );

  const openRecords = useMemo(
    () =>
      records.filter(
        (record) => record.amount_due - record.amount_paid > 0.001
      ),
    [records]
  );

  const selectedRecord = recordById[Number(form.recordId)];
  const outstanding = selectedRecord
    ? Math.max(selectedRecord.amount_due - selectedRecord.amount_paid, 0)
    : 0;

  const monthPrefix = todayISO().slice(0, 7);
  const counts = useMemo(
    () => ({
      all: payments.length,
      today: payments.filter(
        (payment) => String(payment.date).slice(0, 10) === todayISO()
      ).length,
      month: payments.filter((payment) =>
        String(payment.date).startsWith(monthPrefix)
      ).length,
    }),
    [payments, monthPrefix]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const record = recordById[payment.rent_record_id];
      const tenant = record ? tenantById[record.tenant_id] : null;
      const unit = tenant ? unitById[tenant.unit_id] : null;
      const date = String(payment.date).slice(0, 10);
      if (filter === "today" && date !== todayISO()) return false;
      if (filter === "month" && !date.startsWith(monthPrefix)) return false;
      if (!query) return true;
      return (
        (tenant?.name || "").toLowerCase().includes(query) ||
        (unit?.name || "").toLowerCase().includes(query) ||
        String(payment.rent_record_id).includes(query)
      );
    });
  }, [
    payments,
    recordById,
    tenantById,
    unitById,
    filter,
    search,
    monthPrefix,
  ]);

  function openAdd() {
    setForm({ recordId: "", amount: "" });
    setFormError("");
    setShowAdd(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/payments", {
        rent_record_id: Number(form.recordId),
        amount: Number(form.amount),
      });
      setShowAdd(false);
      setForm({ recordId: "", amount: "" });
      toast("Payment recorded successfully.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not record the payment."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSkeleton cards={0} rows={7} columns={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Record incoming rent and review the payment history."
        actions={
          <Button icon={Plus} onClick={openAdd}>
            Record payment
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={load} />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <FilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "today", label: "Today", count: counts.today },
              { value: "month", label: "This month", count: counts.month },
            ]}
          />
          <div className="sm:w-72">
            <Input
              type="search"
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tenant, unit or record"
              aria-label="Search payments"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={payments.length === 0 ? "No payments yet" : "No matching payments"}
            description={
              payments.length === 0
                ? "Record the first rent payment to build the history."
                : "Try a different search or date filter."
            }
            action={
              openRecords.length > 0 ? (
                <Button icon={Plus} onClick={openAdd}>
                  Record payment
                </Button>
              ) : (
                <Link
                  to="/rent-records"
                  className={buttonClasses({ variant: "secondary", size: "sm" })}
                >
                  View rent records
                </Link>
              )
            }
          />
        ) : (
          <Table minWidth="780px">
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Tenant</Th>
                <Th>Unit</Th>
                <Th>Rent record</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => {
                const record = recordById[payment.rent_record_id];
                const tenant = record ? tenantById[record.tenant_id] : null;
                const unit = tenant ? unitById[tenant.unit_id] : null;
                return (
                  <tr key={payment.id} className="hover:bg-elevated/30">
                    <Td className="whitespace-nowrap text-muted">
                      {formatDate(payment.date)}
                    </Td>
                    <Td>
                      <p className="font-medium text-ink">
                        {tenant?.name || `Tenant #${record?.tenant_id || "—"}`}
                      </p>
                    </Td>
                    <Td className="text-muted">{unit?.name || "—"}</Td>
                    <Td className="text-muted">#{payment.rent_record_id}</Td>
                    <Td className="text-right font-semibold">
                      {formatMoney(payment.amount)}
                    </Td>
                    <Td>
                      <Badge tone="green" dot>
                        Received
                      </Badge>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Record payment"
        description="Apply a payment to an open rent record."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="payment-form"
              loading={saving}
              disabled={openRecords.length === 0}
            >
              Record payment
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </div>
        )}

        {openRecords.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No open balances"
            description="Every rent record is fully paid. New payments can be recorded when a record has a balance."
          />
        ) : (
          <form id="payment-form" className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Rent record" htmlFor="payment-record">
              <Select
                id="payment-record"
                value={form.recordId}
                onChange={(event) =>
                  setForm({ ...form, recordId: event.target.value })
                }
                required
              >
                <option value="">Select a rent record</option>
                {openRecords.map((record) => {
                  const tenant = tenantById[record.tenant_id];
                  const unit = tenant ? unitById[tenant.unit_id] : null;
                  const balance = record.amount_due - record.amount_paid;
                  return (
                    <option key={record.id} value={record.id}>
                      {tenant?.name || `Tenant #${record.tenant_id}`} ·{" "}
                      {unit?.name || "Unit"} · due {formatDate(record.due_date)} ·{" "}
                      {formatMoney(balance)} left
                    </option>
                  );
                })}
              </Select>
            </Field>

            <Field
              label="Amount (₦)"
              htmlFor="payment-amount"
              hint={
                selectedRecord
                  ? `Outstanding balance: ${formatMoney(outstanding)}`
                  : "Select a rent record to see its outstanding balance."
              }
            >
              <Input
                id="payment-amount"
                type="number"
                min="0.01"
                max={outstanding || undefined}
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder={outstanding ? String(outstanding) : "0"}
                required
              />
            </Field>
          </form>
        )}
      </Modal>
    </div>
  );
}
