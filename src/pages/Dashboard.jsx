import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "../api";
import ErrorBanner from "../components/ErrorBanner";
import PageLoader from "../components/PageLoader";
import StatusBadge from "../components/StatusBadge";
import SummaryCard from "../components/SummaryCard";
import { formatMoney, unitTypeLabel } from "../utils/format";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [vacant, setVacant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, overdueRes, vacantRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/overdue"),
        api.get("/dashboard/vacant"),
      ]);
      setSummary(summaryRes.data);
      setOverdue(overdueRes.data);
      setVacant(vacantRes.data);
    } catch (err) {
      setError(errorMessage(err, "Could not load the dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Rent overview for your building.</p>
        </div>
        <button type="button" className="btn secondary" onClick={load}>
          Refresh
        </button>
      </div>

      {summary && (
        <section className="summary-grid" aria-label="Summary">
          <SummaryCard
            label="Expected rent"
            value={formatMoney(summary.total_expected)}
            tone="blue"
          />
          <SummaryCard
            label="Collected"
            value={formatMoney(summary.total_collected)}
            tone="green"
          />
          <SummaryCard
            label="Outstanding"
            value={formatMoney(summary.total_outstanding)}
            tone="red"
          />
          <SummaryCard
            label="Overdue tenants"
            value={summary.overdue_tenants}
            tone={summary.overdue_tenants > 0 ? "yellow" : "green"}
          />
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Overdue rent</h2>
          <span className="count">{overdue.length}</span>
        </div>

        {overdue.length === 0 ? (
          <p className="empty">No overdue rent. Everything is up to date. 🎉</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Amount</th>
                  <th>Days overdue</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map((row) => (
                  <tr key={row.rent_record_id}>
                    <td>{row.tenant_name}</td>
                    <td>{row.unit_name}</td>
                    <td className="num">{formatMoney(row.amount_due)}</td>
                    <td>
                      <StatusBadge status="overdue" />{" "}
                      <span className="muted">
                        {row.days_overdue}{" "}
                        {row.days_overdue === 1 ? "day" : "days"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Vacant units</h2>
          <span className="count">{vacant.length}</span>
        </div>

        {vacant.length === 0 ? (
          <p className="empty">All units are occupied.</p>
        ) : (
          <div className="vacant-grid">
            {vacant.map((unit) => (
              <div className="vacant-card" key={unit.id}>
                <div className="vacant-top">
                  <div>
                    <strong>{unit.name}</strong>
                    <span className="muted">
                      {unitTypeLabel[unit.type] || unit.type}
                    </span>
                  </div>
                  <StatusBadge status="vacant" />
                </div>
                <div className="vacant-meta">
                  <span>{formatMoney(unit.rent_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
