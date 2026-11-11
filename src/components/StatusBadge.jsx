const LABELS = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  overdue: "Overdue",
  occupied: "Occupied",
  vacant: "Vacant",
  active: "Active",
  moved_out: "Moved out",
};

// Colour-coded pill: green paid/active, yellow partial/vacant, red unpaid/overdue.
export default function StatusBadge({ status }) {
  const value = String(status || "").toLowerCase();
  return (
    <span className={`badge badge-${value}`}>
      {LABELS[value] || status || "—"}
    </span>
  );
}
