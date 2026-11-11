import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import Modal from "../components/Modal";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";
import { dateInDays, formatDate, formatMoney, todayISO } from "../utils/format";

const emptyForm = () => ({
  tenant_id: "",
  amount_due: "",
  due_date: dateInDays(7),
});

export default function RentRecords() {
  const [records, setRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [recordRes, tenantRes] = await Promise.all([
        api.get("/rent-records"),
        api.get("/tenants"),
      ]);
      setRecords(recordRes.data);
      setTenants(tenantRes.data);
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
  const activeTenants = useMemo(
    () => tenants.filter((tenant) => !tenant.move_out_date),
    [tenants]
  );
  const filtered = useMemo(() => {
    if (statusFilter === "all") return records;
    return records.filter((record) => record.status === statusFilter);
  }, [records, statusFilter]);

  function openAdd() {
    setForm({
      ...emptyForm(),
      tenant_id: activeTenants[0]?.id ?? "",
    });
    setFormError("");
    setShowAdd(true);
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
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not create the rent record."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading rent records..." />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Rent records</h1>
          <p className="muted">Rent charged, paid and still outstanding.</p>
        </div>
        <button type="button" className="btn primary" onClick={openAdd}>
          + New rent record
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <section className="card">
        <div className="card-head">
          <h2>All records</h2>
          <select
            className="search"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="empty">
            {records.length === 0
              ? "No rent records yet. Create one to start tracking rent."
              : "No records match this status."}
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Due date</th>
                  <th>Amount due</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const balance = Math.max(
                    record.amount_due - record.amount_paid,
                    0
                  );
                  const overdue =
                    record.status !== "paid" && record.due_date < todayISO();

                  return (
                    <tr key={record.id}>
                      <td>
                        {tenantById[record.tenant_id]?.name ||
                          `Tenant #${record.tenant_id}`}
                      </td>
                      <td>{formatDate(record.due_date)}</td>
                      <td className="num">{formatMoney(record.amount_due)}</td>
                      <td className="num">{formatMoney(record.amount_paid)}</td>
                      <td className="num">{formatMoney(balance)}</td>
                      <td>
                        <div className="actions">
                          <StatusBadge status={record.status} />
                          {overdue && <StatusBadge status="overdue" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showAdd && (
        <Modal title="New rent record" onClose={() => setShowAdd(false)}>
          {formError && (
            <div className="alert error" role="alert">
              {formError}
            </div>
          )}

          {activeTenants.length === 0 ? (
            <p className="empty">
              Add an active tenant first, then create a rent record for them.
            </p>
          ) : (
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="rent-tenant">Tenant</label>
                  <select
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
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="rent-due">Amount due (₦)</label>
                  <input
                    id="rent-due"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount_due}
                    onChange={(event) =>
                      setForm({ ...form, amount_due: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="rent-date">Due date</label>
                  <input
                    id="rent-date"
                    type="date"
                    value={form.due_date}
                    onChange={(event) =>
                      setForm({ ...form, due_date: event.target.value })
                    }
                    required
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
                  {saving ? "Creating..." : "Create record"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
