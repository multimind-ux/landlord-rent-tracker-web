import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover focus-visible:ring-accent/40",
  secondary:
    "border border-line bg-surface text-ink shadow-sm hover:bg-elevated focus-visible:ring-accent/30",
  ghost:
    "text-muted hover:bg-elevated hover:text-ink focus-visible:ring-accent/30",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/40 dark:bg-red-500 dark:hover:bg-red-600",
  "danger-ghost":
    "text-red-600 hover:bg-red-50 focus-visible:ring-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
};

const SIZES = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold",
  md: "h-10 gap-2 rounded-xl px-4 text-sm font-semibold",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm font-semibold",
  icon: "h-9 w-9 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap transition-colors",
    "focus-visible:outline-none focus-visible:ring-4",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className
  );
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
