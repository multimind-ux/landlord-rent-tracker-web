import { cn } from "../../utils/cn";

export default function Switch({
  checked,
  onChange,
  label,
  description,
  id = "switch",
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 disabled:opacity-50",
          checked ? "bg-accent" : "bg-slate-300 dark:bg-slate-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-6"
          )}
        />
      </button>
    </div>
  );
}
