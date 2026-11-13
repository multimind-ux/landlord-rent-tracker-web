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

// Show a short local date and time, e.g. 13/11/2026, 09:42.
export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

// Notification copy comes from the API. Normalise dates and whole naira
// amounts so the inbox follows the same display rules as the rest of the app.
export function formatNotificationMessage(value) {
  if (!value) return "";
  return String(value)
    .replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, year, month, day) => {
      return `${day}/${month}/${year}`;
    })
    .replace(/₦(\d{1,3}(?:,\d{3})*)\.00\b/g, "₦$1");
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
