import { cn } from "../../utils/cn";

export default function Table({ children, className, minWidth = "720px" }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table
        className="w-full border-collapse text-left text-sm"
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-line bg-elevated/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }) {
  return (
    <td
      className={cn(
        "border-b border-line px-5 py-3.5 align-middle text-sm text-ink last:border-0",
        className
      )}
    >
      {children}
    </td>
  );
}
