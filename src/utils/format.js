// Formatting helpers shared by the pages.

// Nigerian naira, e.g. ₦50,000 or ₦12,500.50
export function formatMoney(amount) {
  const value = Number(amount || 0);
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// Dates come from the API as YYYY-MM-DD (or ISO datetime). Show DD/MM/YYYY.
export function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

// Today's date in YYYY-MM-DD using the browser's local timezone.
export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Add days to today and return YYYY-MM-DD (used as a sensible due-date default).
export function dateInDays(days) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const unitTypeLabel = {
  self_contain: "Self-contain",
  twin_flat: "Twin Flat",
};
