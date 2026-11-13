import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LogOut,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
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
import { formatDate, todayISO } from "../utils/format";

const BLANK_FORM = {
  name: "",
  phone: "",
  unit_id: "",
  move_in_date: "",
};

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Tenants() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [tenantRes, unitRes] = await Promise.all([
        api.get("/tenants"),
        api.get("/units"),
      ]);
      setTenants(tenantRes.data);
      setUnits(unitRes.data);
    } catch (err) {
      setError(errorMessage(err, "Could not load tenants."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unitById = useMemo(
    () => Object.fromEntries(units.map((unit) => [unit.id, unit])),
    [units]
  );
  const vacantUnits = useMemo(
    () => units.filter((unit) => unit.status === "vacant"),
    [units]
  );

  const activeCount = tenants.filter((tenant) => !tenant.move_out_date).length;
  const movedOutCount = tenants.length - activeCount;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tenants.filter((tenant) => {
      if (filter === "active" && tenant.move_out_date) return false;
      if (filter === "moved_out" && !tenant.move_out_date) return false;
      if (!query) return true;
      const unitName = unitById[tenant.unit_id]?.name || "";
      return (
        tenant.name.toLowerCase().includes(query) ||
        tenant.phone.toLowerCase().includes(query) ||
        unitName.toLowerCase().includes(query)
      );
    });
  }, [tenants, search, filter, unitById]);

  function openAdd() {
    setForm({
      ...BLANK_FORM,
      unit_id: vacantUnits[0]?.id ? String(vacantUnits[0].id) : "",
      move_in_date: todayISO(),
    });
    setFormError("");
    setShowAdd(true);
  }

  function openEdit(tenant) {
    setEditing({ id: tenant.id, name: tenant.name, phone: tenant.phone });
    setFormError("");
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/tenants", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        unit_id: Number(form.unit_id),
        move_in_date: form.move_in_date || null,
      });
      setShowAdd(false);
      setForm(BLANK_FORM);
      toast("Tenant added successfully.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not add the tenant."));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.put(`/tenants/${editing.id}`, {
        name: editing.name.trim(),
        phone: editing.phone.trim(),
      });
      setEditing(null);
      toast("Tenant updated successfully.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not update the tenant."));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm() {
    if (!confirm) return;
    const { type, tenant } = confirm;
    setConfirmLoading(true);
    try {
      if (type === "moveout") {
        await api.post(`/tenants/${tenant.id}/move-out`);
        toast(`${tenant.name} has been moved out.`, "success");
      } else {
        await api.delete(`/tenants/${tenant.id}`);
        toast(`${tenant.name} was deleted.`, "success");
      }
      setConfirm(null);
      await load();
    } catch (err) {
      toast(
        errorMessage(
          err,
          type === "moveout"
            ? "Could not move the tenant out."
            : "Could not delete the tenant."
        ),
        "error"
      );
    } finally {
      setConfirmLoading(false);
    }
  }

  const confirmCopy =
    confirm?.type === "moveout"
      ? {
          title: "Move tenant out?",
          message: `Move ${confirm.tenant.name} out of ${
            unitById[confirm.tenant.unit_id]?.name || "their unit"
          }? The unit will become vacant.`,
          label: "Move out",
        }
      : confirm
        ? {
            title: "Delete tenant?",
            message: `Delete ${confirm.tenant.name}? This also removes their rent history and payments. This cannot be undone.`,
            label: "Delete tenant",
          }
        : null;

  if (loading) return <PageSkeleton cards={0} rows={7} columns={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Everyone renting a unit in the building, with quick contact and move-out actions."
        actions={
          <Button icon={Plus} onClick={openAdd}>
            Add tenant
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
              { value: "all", label: "All", count: tenants.length },
              { value: "active", label: "Active", count: activeCount },
              { value: "moved_out", label: "Moved out", count: movedOutCount },
            ]}
          />
          <div className="sm:w-72">
            <Input
              type="search"
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone or unit"
              aria-label="Search tenants"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={tenants.length === 0 ? "No tenants yet" : "No matching tenants"}
            description={
              tenants.length === 0
                ? "Add the first tenant to start tracking rent and occupancy."
                : "Try a different search or filter to find who you're looking for."
            }
            action={
              tenants.length === 0 ? (
                <Button icon={Plus} onClick={openAdd}>
                  Add tenant
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
          <Table minWidth="820px">
            <thead>
              <tr>
                <Th>Tenant</Th>
                <Th>Phone</Th>
                <Th>Unit</Th>
                <Th>Move-in</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-elevated/30">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-[11px] font-bold text-accent">
                        {initials(tenant.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {tenant.name}
                        </p>
                        <p className="text-[11px] text-muted">
                          Tenant #{tenant.id}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {tenant.phone ? (
                      <a
                        href={`tel:${tenant.phone}`}
                        className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {tenant.phone}
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Td>
                  <Td className="text-muted">
                    {unitById[tenant.unit_id]?.name || `#${tenant.unit_id}`}
                  </Td>
                  <Td className="text-muted">
                    {formatDate(tenant.move_in_date)}
                  </Td>
                  <Td>
                    <StatusBadge
                      status={tenant.move_out_date ? "moved_out" : "active"}
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        icon={Pencil}
                        onClick={() => openEdit(tenant)}
                        aria-label={`Edit ${tenant.name}`}
                        title="Edit tenant"
                      />
                      {!tenant.move_out_date && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          icon={LogOut}
                          onClick={() =>
                            setConfirm({ type: "moveout", tenant })
                          }
                          aria-label={`Move ${tenant.name} out`}
                          title="Move out"
                        />
                      )}
                      <Button
                        variant="danger-ghost"
                        size="icon-sm"
                        icon={Trash2}
                        onClick={() => setConfirm({ type: "delete", tenant })}
                        aria-label={`Delete ${tenant.name}`}
                        title="Delete tenant"
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirmCopy?.title}
        message={confirmCopy?.message}
        confirmLabel={confirmCopy?.label}
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onClose={() => setConfirm(null)}
      />

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add tenant"
        description="Assign a tenant to a vacant unit."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-tenant-form"
              loading={saving}
              disabled={vacantUnits.length === 0}
            >
              Add tenant
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </div>
        )}

        {vacantUnits.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No vacant units"
            description="Move a tenant out or add a vacant unit before creating another tenant."
            action={
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                Close
              </Button>
            }
          />
        ) : (
          <form id="add-tenant-form" className="space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="tenant-name">
                <Input
                  id="tenant-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Ada Okafor"
                  required
                />
              </Field>
              <Field label="Phone" htmlFor="tenant-phone">
                <Input
                  id="tenant-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="e.g. 0801 234 5678"
                  required
                />
              </Field>
              <Field label="Unit" htmlFor="tenant-unit">
                <Select
                  id="tenant-unit"
                  value={form.unit_id}
                  onChange={(event) =>
                    setForm({ ...form, unit_id: event.target.value })
                  }
                  required
                >
                  <option value="">Select a vacant unit</option>
                  {vacantUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Move-in date" htmlFor="tenant-move-in" hint="Optional">
                <Input
                  id="tenant-move-in"
                  type="date"
                  value={form.move_in_date}
                  onChange={(event) =>
                    setForm({ ...form, move_in_date: event.target.value })
                  }
                />
              </Field>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit tenant"
        description="Update the tenant's contact details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-tenant-form"
              loading={saving}
            >
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
        <form id="edit-tenant-form" className="space-y-4" onSubmit={handleUpdate}>
          <Field label="Full name" htmlFor="edit-name">
            <Input
              id="edit-name"
              value={editing?.name || ""}
              onChange={(event) =>
                setEditing({ ...editing, name: event.target.value })
              }
              required
            />
          </Field>
          <Field label="Phone" htmlFor="edit-phone">
            <Input
              id="edit-phone"
              type="tel"
              value={editing?.phone || ""}
              onChange={(event) =>
                setEditing({ ...editing, phone: event.target.value })
              }
              required
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
