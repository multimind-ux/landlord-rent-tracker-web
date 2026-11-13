import { cn } from "../../utils/cn";

export default function Card({ className, children, ...props }) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl border border-line bg-surface shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
    >
      <div className="min-w-0">
        {title && (
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}
