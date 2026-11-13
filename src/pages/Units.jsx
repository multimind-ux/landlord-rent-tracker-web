import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Pencil,
  Plus,
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
import { formatMoney, unitTypeLabel } from "../utils/format";

const BLANK = {
  name: "",
  type: "self_contain",
  rent_amount: "",
  status: "vacant",
};

export default function Units() {
  const { toast } = useToast();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/units");
      setUnits(data);
    } catch (err) {
      setError(errorMessage(err, "Could not load units."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const occupiedCount = units.filter((unit) => unit.status === "occupied").length;
  const vacantCount = units.length - occupiedCount;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return units.filter((unit) => {
      if (filter !== "all" && unit.status !== filter) return false;
      if (!query) return true;
      return (
        unit.name.toLowerCase().includes(query) ||
        (unitTypeLabel[unit.type] || unit.type).toLowerCase().includes(query)
      );
    });
  }, [units, search, filter]);

  function openAdd() {
    setForm(BLANK);
    setFormError("");
    setShowAdd(true);
  }

  function openEdit(unit) {
    setEditing(unit);
    setForm({
      name: unit.name,
      type: unit.type,
      rent_amount: String(unit.rent_amount),
      status: unit.status,
    });
    setFormError("");
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/units", {
        name: form.name.trim(),
        type: form.type,
        rent_amount: Number(form.rent_amount),
        status: form.status,
      });
      setShowAdd(false);
      toast("Unit added successfully.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not add the unit."));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.put(`/units/${editing.id}`, {
        name: form.name.trim(),
        type: form.type,
        rent_amount: Number(form.rent_amount),
        status: form.status,
      });
      setEditing(null);
      toast("Unit updated successfully.", "success");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not update the unit."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      await api.delete(`/units/${confirm.id}`);
      toast(`${confirm.name} was deleted.`, "success");
      setConfirm(null);
      await load();
    } catch (err) {
      toast(errorMessage(err, "Could not delete the unit."), "error");
    } finally {
      setConfirmLoading(false);
    }
  }

  if (loading) return <PageSkeleton cards={0} rows={7} columns={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description={`${units.length} units in the building · ${vacantCount} vacant`}
        actions={
          <Button icon={Plus} onClick={openAdd}>
            Add unit
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
              { value: "all", label: "All", count: units.length },
              { value: "occupied", label: "Occupied", count: occupiedCount },
              { value: "vacant", label: "Vacant", count: vacantCount },
            ]}
          />
          <div className="sm:w-72">
            <Input
              type="search"
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search units or type"
              aria-label="Search units"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={units.length === 0 ? "No units yet" : "No matching units"}
            description={
              units.length === 0
                ? "Add your first room or flat to start tracking occupancy."
                : "Try a different search or filter."
            }
            action={
              units.length === 0 ? (
                <Button icon={Plus} onClick={openAdd}>
                  Add unit
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
          <Table minWidth="720px">
            <thead>
              <tr>
                <Th>Unit</Th>
                <Th>Type</Th>
                <Th className="text-right">Rent amount</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((unit) => (
                <tr key={unit.id} className="hover:bg-elevated/30">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-ink">{unit.name}</span>
                    </div>
                  </Td>
                  <Td className="text-muted">
                    {unitTypeLabel[unit.type] || unit.type}
                  </Td>
                  <Td className="text-right font-semibold">
                    {formatMoney(unit.rent_amount)}
                  </Td>
                  <Td>
                    <StatusBadge status={unit.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        icon={Pencil}
                        onClick={() => openEdit(unit)}
                        aria-label={`Edit ${unit.name}`}
                        title="Edit unit"
                      />
                      <Button
                        variant="danger-ghost"
                        size="icon-sm"
                        icon={Trash2}
                        onClick={() => setConfirm(unit)}
                        aria-label={`Delete ${unit.name}`}
                        title="Delete unit"
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
        title="Delete unit?"
        message={`Delete ${confirm?.name || "this unit"}? Units with active tenants cannot be deleted.`}
        confirmLabel="Delete unit"
        loading={confirmLoading}
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add unit"
        description="Create a room or flat in the building."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-unit-form" loading={saving}>
              Add unit
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </div>
        )}
        <UnitForm id="add-unit-form" form={form} setForm={setForm} onSubmit={handleCreate} />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name || "unit"}`}
        description="Update the unit details and rent amount."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-unit-form" loading={saving}>
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
        <UnitForm id="edit-unit-form" form={form} setForm={setForm} onSubmit={handleUpdate} />
      </Modal>
    </div>
  );
}

function UnitForm({ id, form, setForm, onSubmit }) {
  return (
    <form id={id} className="space-y-4" onSubmit={onSubmit}>
      <Field label="Unit name" htmlFor={`${id}-name`}>
        <Input
          id={`${id}-name`}
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="e.g. Self-contain 6"
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor={`${id}-type`}>
          <Select
            id={`${id}-type`}
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            <option value="self_contain">Self-contain</option>
            <option value="twin_flat">Twin Flat</option>
          </Select>
        </Field>
        <Field label="Status" htmlFor={`${id}-status`}>
          <Select
            id={`${id}-status`}
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </Select>
        </Field>
      </div>
      <Field label="Rent amount (₦)" htmlFor={`${id}-rent`}>
        <Input
          id={`${id}-rent`}
          type="number"
          min="0"
          step="0.01"
          value={form.rent_amount}
          onChange={(event) =>
            setForm({ ...form, rent_amount: event.target.value })
          }
          placeholder="50000"
          required
        />
      </Field>
    </form>
  );
}
