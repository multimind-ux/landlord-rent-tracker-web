import { cn } from "../../utils/cn";

const TONES = {
  neutral:
    "bg-elevated text-muted ring-line dark:bg-white/5 dark:text-slate-300 dark:ring-white/10",
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  indigo:
    "bg-accent-soft text-accent ring-accent/20 dark:bg-accent/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
};

const STATUS = {
  paid: ["green", "Paid"],
  partial: ["amber", "Partial"],
  unpaid: ["red", "Unpaid"],
  overdue: ["red", "Overdue"],
  occupied: ["green", "Occupied"],
  vacant: ["amber", "Vacant"],
  active: ["green", "Active"],
  moved_out: ["gray", "Moved out"],
  due_soon: ["amber", "Due soon"],
  due_today: ["indigo", "Due today"],
  unread: ["indigo", "Unread"],
  read: ["gray", "Read"],
};

export default function Badge({
  tone = "neutral",
  children,
  className,
  dot = false,
  icon: Icon,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ring-inset",
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const value = String(status || "").toLowerCase();
  const [tone, label] = STATUS[value] || ["neutral", status || "—"];
  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
