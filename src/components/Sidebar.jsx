import { NavLink } from "react-router-dom";
import {
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useNotifications } from "../context/NotificationContext";
import Badge from "./ui/Badge";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tenants", label: "Tenants", icon: Users },
  { to: "/units", label: "Units", icon: Building2 },
  { to: "/rent-records", label: "Rent records", icon: ReceiptText },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function SidebarContent({ onNavigate, onClose }) {
  const { unreadCount } = useNotifications();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-line px-5">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-ink">
              RentTracker
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Landlord workspace
            </span>
          </span>
        </NavLink>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Main">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Workspace
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-elevated hover:text-ink"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {to === "/notifications" && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="rounded-xl border border-line bg-elevated/50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Reminder engine</span>
            <Badge tone="green" dot>
              Active
            </Badge>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-muted">
            Rent reminders are checked daily and delivered to your notification
            inbox.
          </p>
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Manage reminders
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-surface lg:block">
      <SidebarContent />
    </aside>
  );
}
