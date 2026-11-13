import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const TONES = {
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-white text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950/90 dark:text-emerald-100",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    className:
      "border-red-200 bg-white text-red-900 dark:border-red-500/20 dark:bg-red-950/90 dark:text-red-100",
    iconClass: "text-red-600 dark:text-red-400",
  },
  info: {
    icon: Info,
    className:
      "border-line bg-white text-ink dark:bg-slate-900/95",
    iconClass: "text-accent",
  },
};

export default function Toast({ type = "success", message, onClose }) {
  if (!message) return null;
  const tone = TONES[type] || TONES.info;
  const Icon = tone.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-dropdown animate-slide-in ${tone.className}`}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.iconClass}`} aria-hidden="true" />
      <p className="flex-1 text-sm leading-5">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-0.5 text-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
