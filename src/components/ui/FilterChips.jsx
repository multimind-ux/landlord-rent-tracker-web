import { cn } from "../../utils/cn";

export default function FilterChips({ options, value, onChange, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface p-1",
        className
      )}
      role="group"
      aria-label="Filter"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              active
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-elevated hover:text-ink"
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  active ? "bg-accent/10" : "bg-elevated"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
