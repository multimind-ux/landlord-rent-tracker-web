import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import Modal from "../components/Modal";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";
import { formatMoney, unitTypeLabel } from "../utils/format";

export default function Units() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [rentAmount, setRentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

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

  function openEdit(unit) {
    setEditing(unit);
    setRentAmount(String(unit.rent_amount));
    setFormError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.put(`/units/${editing.id}`, {
        rent_amount: Number(rentAmount),
      });
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not update the rent amount."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading units..." />;

  const vacantCount = units.filter((unit) => unit.status === "vacant").length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Units</h1>
          <p className="muted">
            {units.length} units · {vacantCount} vacant
          </p>
        </div>
        <button type="button" className="btn secondary" onClick={load}>
          Refresh
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <section className="card">
        <div className="card-head">
          <h2>Building units</h2>
        </div>

        {units.length === 0 ? (
          <p className="empty">No units found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Rent amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td>
                      <strong>{unit.name}</strong>
                    </td>
                    <td>{unitTypeLabel[unit.type] || unit.type}</td>
                    <td className="num">{formatMoney(unit.rent_amount)}</td>
                    <td>
                      <StatusBadge status={unit.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary small"
                        onClick={() => openEdit(unit)}
                      >
                        Edit rent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <Modal title={`Edit rent · ${editing.name}`} onClose={() => setEditing(null)}>
          {formError && (
            <div className="alert error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="rent-amount">Rent amount (₦)</label>
              <input
                id="rent-amount"
                type="number"
                min="0"
                step="0.01"
                value={rentAmount}
                onChange={(event) => setRentAmount(event.target.value)}
                required
              />
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
                {saving ? "Saving..." : "Save rent"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
