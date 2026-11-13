import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import { StatusBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import { Field, Input, Select } from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { PageSkeleton } from "../components/ui/Skeleton";
import Table, { Td, Th } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import {
  dateInDays,
  formatDate,
  formatMoney,
  todayISO,
} from "../utils/format";

const emptyForm = () => ({
  tenant_id: "",
  amount_due: "",
  due_date: dateInDays(7),
});

export default function RentRecords() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [recordRes, tenantRes, unitRes] = await Promise.all([
        api.get("/rent-records"),
        api.get("/tenants"),
        api.get("/units"),
      ]);
      setRecords(recordRes.data);
      setTenants(tenantRes.data);
      setUnits(unitRes.data);
    } catch (err) {
      setError(errorMessage(err, "Could not load rent records."));
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
  const activeTenants = useMemo(
    () => tenants.filter((tenant) => !tenant.move_out_date),
    [tenants]
  );
  const today = todayISO();

  const isOverdue = useCallback(
    (record) => record.status !== "paid" && record.due_date < today,
    [today]
  );

  const counts = useMemo(() => {
    return {
      all: records.length,
      paid: records.filter((record) => record.status === "paid").length,
      partial: records.filter((record) => record.status === "partial").length,
      unpaid: records.filter((record) => record.status === "unpaid").length,
      overdue: records.filter(isOverdue).length,
    };
  }, [records, isOverdue]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const tenant = tenantById[record.tenant_id];
      const unit = tenant ? unitById[tenant.unit_id] : null;
      if (filter === "overdue" && !isOverdue(record)) return false;
      if (filter !== "all" && filter !== "overdue" && record.status !== filter) {
        return false;
      }
      if (!query) return true;
      return (
        (tenant?.name || "").toLowerCase().includes(query) ||
        (unit?.name || "").toLowerCase().includes(query) ||
        record.due_date.includes(query)
      );
    });
  }, [records, tenantById, unitById, filter, search, isOverdue]);

  function openAdd() {
    setForm({
      ...emptyForm(),
      tenant_id: activeTenants[0]?.id ? String(activeTenants[0].id) : "",
    });
    setFormError("");
    setShowAdd(true);
  }

  function openEdit(record) {
    setEditing(record);
    setForm({
      tenant_id: String(record.tenant_id),
      amount_due: String(record.amount_due),
      due_date: record.due_date,
    });
    setFormError("");
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/rent-records", {
        tenant_id: Number(form.tenant_id),
        amount_due: Number(form.amount_due),
        due_date: form.due_date,
      });
      setShowAdd(false);
      setForm(emptyForm());
      toast("Rent record created.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not create the rent record."));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.put(`/rent-records/${editing.id}`, {
        amount_due: Number(form.amount_due),
        due_date: form.due_date,
      });
      setEditing(null);
      toast("Rent record updated.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not update the rent record."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      await api.delete(`/rent-records/${confirm.id}`);
      toast("Rent record deleted.", "success");
      setConfirm(null);
      await load();
    } catch (err) {
      toast(errorMessage(err, "Could not delete the rent record."), "error");
    } finally {
      setConfirmLoading(false);
    }
  }

  if (loading) return <PageSkeleton cards={0} rows={8} columns={7} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rent records"
        description="Track what has been charged, paid and remains outstanding."
        actions={
          <Button icon={Plus} onClick={openAdd}>
            New rent record
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
              { value: "paid", label: "Paid", count: counts.paid },
              { value: "partial", label: "Partial", count: counts.partial },
              { value: "unpaid", label: "Unpaid", count: counts.unpaid },
              { value: "overdue", label: "Overdue", count: counts.overdue },
            ]}
          />
          <div className="sm:w-72">
            <Input
              type="search"
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tenant, unit or date"
              aria-label="Search rent records"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={
              records.length === 0 ? "No rent records yet" : "No matching records"
            }
            description={
              records.length === 0
                ? "Create a rent record to start tracking a tenant's balance."
                : "Try a different search or status filter."
            }
            action={
              records.length === 0 ? (
                <Button icon={Plus} onClick={openAdd}>
                  Create a rent record
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <Table minWidth="1020px">
            <thead>
              <tr>
                <Th>Tenant</Th>
                <Th>Unit</Th>
                <Th>Due date</Th>
                <Th className="text-right">Amount due</Th>
                <Th className="text-right">Paid</Th>
                <Th className="text-right">Balance</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const tenant = tenantById[record.tenant_id];
                const unit = tenant ? unitById[tenant.unit_id] : null;
                const balance = Math.max(
                  record.amount_due - record.amount_paid,
                  0
                );
                const overdue = isOverdue(record);
                return (
                  <tr key={record.id} className="hover:bg-elevated/30">
                    <Td>
                      <p className="font-medium text-ink">
                        {tenant?.name || `Tenant #${record.tenant_id}`}
                      </p>
                    </Td>
                    <Td className="text-muted">
                      {unit?.name || "—"}
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(record.due_date)}
                      </span>
                    </Td>
                    <Td className="text-right">{formatMoney(record.amount_due)}</Td>
                    <Td className="text-right text-muted">
                      {formatMoney(record.amount_paid)}
                    </Td>
                    <Td className="text-right font-semibold">
                      {formatMoney(balance)}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {overdue && record.status === "partial" && (
                          <StatusBadge status="partial" />
                        )}
                        <StatusBadge
                          status={overdue ? "overdue" : record.status}
                        />
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          icon={Pencil}
                          onClick={() => openEdit(record)}
                          aria-label={`Edit rent record #${record.id}`}
                          title="Edit record"
                        />
                        <Button
                          variant="danger-ghost"
                          size="icon-sm"
                          icon={Trash2}
                          onClick={() => setConfirm(record)}
                          aria-label={`Delete rent record #${record.id}`}
                          title="Delete record"
                        />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete rent record?"
        message={`Delete this rent record for ${
          confirm ? tenantById[confirm.tenant_id]?.name || "this tenant" : "this tenant"
        }? Its payment history will also be removed. This cannot be undone.`}
        confirmLabel="Delete record"
        loading={confirmLoading}
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="New rent record"
        description="Charge rent to an active tenant."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-rent-form"
              loading={saving}
              disabled={activeTenants.length === 0}
            >
              Create record
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </div>
        )}
        {activeTenants.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Add a tenant first"
            description="Rent records can only be created for active tenants."
            action={
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                Close
              </Button>
            }
          />
        ) : (
          <form id="add-rent-form" className="space-y-4" onSubmit={handleCreate}>
            <Field label="Tenant" htmlFor="rent-tenant">
              <Select
                id="rent-tenant"
                value={form.tenant_id}
                onChange={(event) =>
                  setForm({ ...form, tenant_id: event.target.value })
                }
                required
              >
                <option value="">Select a tenant</option>
                {activeTenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} · {unitById[tenant.unit_id]?.name || "Unit"}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount due (₦)" htmlFor="rent-amount">
                <Input
                  id="rent-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount_due}
                  onChange={(event) =>
                    setForm({ ...form, amount_due: event.target.value })
                  }
                  placeholder="50000"
                  required
                />
              </Field>
              <Field label="Due date" htmlFor="rent-due-date">
                <Input
                  id="rent-due-date"
                  type="date"
                  value={form.due_date}
                  onChange={(event) =>
                    setForm({ ...form, due_date: event.target.value })
                  }
                  required
                />
              </Field>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit rent record"
        description={
          editing
            ? `${tenantById[editing.tenant_id]?.name || "Tenant"} · ${
                unitById[tenantById[editing.tenant_id]?.unit_id]?.name || "Unit"
              }`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-rent-form" loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </div>
        )}
        <form id="edit-rent-form" className="space-y-4" onSubmit={handleUpdate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Amount due (₦)"
              htmlFor="edit-rent-amount"
              hint="Changing this recalculates the record status."
            >
              <Input
                id="edit-rent-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount_due}
                onChange={(event) =>
                  setForm({ ...form, amount_due: event.target.value })
                }
                required
              />
            </Field>
            <Field label="Due date" htmlFor="edit-rent-due-date">
              <Input
                id="edit-rent-due-date"
                type="date"
                value={form.due_date}
                onChange={(event) =>
                  setForm({ ...form, due_date: event.target.value })
                }
                required
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
