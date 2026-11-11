import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import PageLoader from "../components/PageLoader";
import { formatDate, formatMoney } from "../utils/format";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [records, setRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recordId, setRecordId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [paymentRes, recordRes, tenantRes] = await Promise.all([
        api.get("/payments"),
        api.get("/rent-records"),
        api.get("/tenants"),
      ]);
      setPayments(paymentRes.data);
      setRecords(recordRes.data);
      setTenants(tenantRes.data);
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
  const recordById = useMemo(
    () => Object.fromEntries(records.map((record) => [record.id, record])),
    [records]
  );

  // Only records with a balance can receive another payment.
  const openRecords = useMemo(
    () =>
      records.filter(
        (record) => record.amount_due - record.amount_paid > 0.001
      ),
    [records]
  );

  const selectedRecord = recordById[Number(recordId)];
  const outstanding = selectedRecord
    ? Math.max(selectedRecord.amount_due - selectedRecord.amount_paid, 0)
    : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccess("");
    try {
      await api.post("/payments", {
        rent_record_id: Number(recordId),
        amount: Number(amount),
      });
      setSuccess("Payment recorded successfully.");
      setRecordId("");
      setAmount("");
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not record the payment."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading payments..." />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <p className="muted">Record rent payments and review the history.</p>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <section className="card">
        <div className="card-head">
          <h2>Record a payment</h2>
        </div>

        {success && (
          <div className="alert success" role="status">
            {success}
          </div>
        )}
        {formError && (
          <div className="alert error" role="alert">
            {formError}
          </div>
        )}

        {openRecords.length === 0 ? (
          <p className="empty">
            There are no rent records with an outstanding balance.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="payment-record">Rent record</label>
                <select
                  id="payment-record"
                  value={recordId}
                  onChange={(event) => {
                    setRecordId(event.target.value);
                    setSuccess("");
                  }}
                  required
                >
                  <option value="">Select a rent record</option>
                  {openRecords.map((record) => {
                    const balance = record.amount_due - record.amount_paid;
                    return (
                      <option key={record.id} value={record.id}>
                        {tenantById[record.tenant_id]?.name ||
                          `Tenant #${record.tenant_id}`}{" "}
                        · due {formatDate(record.due_date)} ·{" "}
                        {formatMoney(balance)} left
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="field">
                <label htmlFor="payment-amount">Amount (₦)</label>
                <input
                  id="payment-amount"
                  type="number"
                  min="0.01"
                  max={outstanding || undefined}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={outstanding ? String(outstanding) : "0"}
                  required
                />
                {selectedRecord && (
                  <small className="muted">
                    Outstanding balance: {formatMoney(outstanding)}
                  </small>
                )}
              </div>

              <div className="field" style={{ justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={saving}
                >
                  {saving ? "Recording..." : "Record payment"}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Payment history</h2>
          <span className="count">{payments.length}</span>
        </div>

        {payments.length === 0 ? (
          <p className="empty">No payments recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tenant</th>
                  <th>Rent record</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const record = recordById[payment.rent_record_id];
                  return (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.date)}</td>
                      <td>
                        {record
                          ? tenantById[record.tenant_id]?.name ||
                            `Tenant #${record.tenant_id}`
                          : `Record #${payment.rent_record_id}`}
                      </td>
                      <td>#{payment.rent_record_id}</td>
                      <td className="num">{formatMoney(payment.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
