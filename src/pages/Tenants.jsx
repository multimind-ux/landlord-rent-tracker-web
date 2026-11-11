import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import Modal from "../components/Modal";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";

const BLANK_FORM = { name: "", phone: "", unit_id: "", move_in_date: "" };

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionId, setActionId] = useState(null);

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tenants;
    return tenants.filter((tenant) => {
      const unitName = unitById[tenant.unit_id]?.name || "";
      return (
        tenant.name.toLowerCase().includes(query) ||
        tenant.phone.toLowerCase().includes(query) ||
        unitName.toLowerCase().includes(query)
      );
    });
  }, [tenants, search, unitById]);

  function openAdd() {
    setForm({ ...BLANK_FORM, unit_id: vacantUnits[0]?.id ?? "" });
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
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not update the tenant."));
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveOut(tenant) {
    const unitName = unitById[tenant.unit_id]?.name || "their unit";
    const confirmed = window.confirm(
      `Move ${tenant.name} out of ${unitName}? The unit will become vacant.`
    );
    if (!confirmed) return;

    setActionId(tenant.id);
    setError("");
    try {
      await api.post(`/tenants/${tenant.id}/move-out`);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Could not move the tenant out."));
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <PageLoader label="Loading tenants..." />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tenants</h1>
          <p className="muted">Everyone renting a unit in the building.</p>
        </div>
        <button type="button" className="btn primary" onClick={openAdd}>
          + Add tenant
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <section className="card">
        <div className="card-head">
          <h2>All tenants</h2>
          <input
            className="search"
            type="search"
            placeholder="Search name, phone or unit..."
            aria-label="Search tenants"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty">
            {tenants.length === 0
              ? "No tenants yet. Add the first tenant to get started."
              : "No tenants match your search."}
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Unit</th>
                  <th>Move-in</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <strong>{tenant.name}</strong>
                    </td>
                    <td>{tenant.phone}</td>
                    <td>{unitById[tenant.unit_id]?.name || `#${tenant.unit_id}`}</td>
                    <td>{formatDate(tenant.move_in_date)}</td>
                    <td>
                      <StatusBadge
                        status={tenant.move_out_date ? "moved_out" : "active"}
                      />
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn secondary small"
                          onClick={() => openEdit(tenant)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn danger small"
                          disabled={
                            Boolean(tenant.move_out_date) ||
                            actionId === tenant.id
                          }
                          onClick={() => handleMoveOut(tenant)}
                        >
                          {actionId === tenant.id ? "Moving..." : "Move out"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showAdd && (
        <Modal title="Add tenant" onClose={() => setShowAdd(false)}>
          {formError && (
            <div className="alert error" role="alert">
              {formError}
            </div>
          )}

          {vacantUnits.length === 0 ? (
            <p className="empty">
              There are no vacant units. Move a tenant out before adding a new
              one.
            </p>
          ) : (
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="tenant-name">Full name</label>
                  <input
                    id="tenant-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="tenant-phone">Phone</label>
                  <input
                    id="tenant-phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="tenant-unit">Unit</label>
                  <select
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
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="tenant-move-in">Move-in date (optional)</label>
                  <input
                    id="tenant-move-in"
                    type="date"
                    value={form.move_in_date}
                    onChange={(event) =>
                      setForm({ ...form, move_in_date: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? "Adding..." : "Add tenant"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {editing && (
        <Modal title="Edit tenant" onClose={() => setEditing(null)}>
          {formError && (
            <div className="alert error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="edit-name">Full name</label>
                <input
                  id="edit-name"
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="field full">
                <label htmlFor="edit-phone">Phone</label>
                <input
                  id="edit-phone"
                  value={editing.phone}
                  onChange={(event) =>
                    setEditing({ ...editing, phone: event.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
