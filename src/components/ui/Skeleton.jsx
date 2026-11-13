import { cn } from "../../utils/cn";

export function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

export function SummarySkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="mt-5 h-7 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-5 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, column) => (
              <Skeleton
                key={column}
                className={cn(
                  "h-4",
                  column === 0 ? "w-32" : column === columns - 1 ? "w-20" : "w-24"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ cards = 4, rows = 6, columns = 5 }) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>
      {cards > 0 && <SummarySkeleton count={cards} />}
      <TableSkeleton rows={rows} columns={columns} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      </div>
      <SummarySkeleton />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card xl:col-span-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-52" />
          <Skeleton className="mt-6 h-40 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
