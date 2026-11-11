// Small metric card used on the dashboard.
export default function SummaryCard({ label, value, tone = "default" }) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <p className="summary-label">{label}</p>
      <p className="summary-value">{value}</p>
    </article>
  );
}
