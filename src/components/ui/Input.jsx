import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const base =
  "w-full rounded-xl border border-line bg-surface text-sm text-ink shadow-sm transition placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({ label, htmlFor, hint, error, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-ink"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs leading-5 text-muted">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { className, icon: Icon, right, id, ...props },
  ref
) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      )}
      <input
        ref={ref}
        id={id}
        className={cn(base, "h-10 px-3", Icon && "pl-9", right && "pr-10", className)}
        {...props}
      />
      {right && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          {right}
        </div>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { className, id, children, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        className={cn(
          base,
          "h-10 appearance-none px-3 pr-9 focus:ring-4",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, id, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      id={id}
      className={cn(base, "min-h-24 resize-y px-3 py-2.5", className)}
      {...props}
    />
  );
});
