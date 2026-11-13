import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { clearAuth, getSessionUser } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";
import { formatNotificationMessage, formatRelativeTime } from "../utils/format";
import Badge from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/tenants": "Tenants",
  "/units": "Units",
  "/rent-records": "Rent records",
  "/payments": "Payments",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

function notificationTone(type) {
  if (type === "overdue") return "red";
  if (type === "due_soon") return "amber";
  return "indigo";
}

export default function Topbar({ onOpenMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const {
    unreadCount,
    latest,
    loadingLatest,
    refreshUnreadCount,
    loadLatest,
    markRead,
  } = useNotifications();

  const [bellOpen, setBellOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const bellRef = useRef(null);
  const accountRef = useRef(null);
  const user = getSessionUser();

  const title = PAGE_TITLES[location.pathname] || "RentTracker";

  useEffect(() => {
    function handleOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setBellOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setBellOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  function openNotifications() {
    setBellOpen((current) => {
      const next = !current;
      if (next) {
        loadLatest();
        refreshUnreadCount();
      }
      return next;
    });
    setAccountOpen(false);
  }

  async function handleMarkRead(notification) {
    try {
      await markRead(notification.id);
      toast("Notification marked as read.", "success");
    } catch {
      toast("Could not update the notification.", "error");
    }
  }

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-xl border border-line bg-surface p-2 text-muted shadow-sm transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-ink">
              RentTracker
            </span>
          </Link>

          <div className="hidden min-w-0 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Workspace
            </p>
            <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 text-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={openNotifications}
              className="relative rounded-xl p-2 text-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
              aria-label={`Notifications${
                unreadCount ? `, ${unreadCount} unread` : ""
              }`}
              aria-expanded={bellOpen}
              aria-haspopup="menu"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-canvas">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div
                className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-dropdown animate-fade-in"
                role="menu"
              >
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Notifications</p>
                    <p className="text-[11px] text-muted">
                      {unreadCount
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </p>
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setBellOpen(false)}
                    className="text-xs font-semibold text-accent hover:text-accent-hover"
                  >
                    View all
                  </Link>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingLatest && latest.length === 0 ? (
                    <div className="space-y-4 p-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : latest.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <Bell className="mx-auto h-8 w-8 text-muted/50" />
                      <p className="mt-3 text-sm font-medium text-ink">
                        No notifications yet
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Reminders will appear here when rent is due.
                      </p>
                    </div>
                  ) : (
                    latest.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "border-b border-line/70 px-4 py-3.5 last:border-0",
                          !notification.is_read && "bg-accent-soft/30"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-1 h-2 w-2 shrink-0 rounded-full",
                              notification.type === "overdue"
                                ? "bg-red-500"
                                : notification.type === "due_soon"
                                  ? "bg-amber-500"
                                  : "bg-accent"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge tone={notificationTone(notification.type)}>
                                {notification.type.replace("_", " ")}
                              </Badge>
                              <span className="text-[10px] text-muted">
                                {formatRelativeTime(notification.created_at)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-ink">
                              {formatNotificationMessage(notification.message)}
                            </p>
                            {!notification.is_read && (
                              <button
                                type="button"
                                onClick={() => handleMarkRead(notification)}
                                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover"
                              >
                                <Check className="h-3 w-3" />
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => {
                setAccountOpen((current) => !current);
                setBellOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:bg-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-label="Open account menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold text-accent">
                L
              </span>
              <span className="hidden text-xs font-semibold text-ink sm:block">
                Account
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted sm:block" />
            </button>

            {accountOpen && (
              <div
                className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-dropdown animate-fade-in"
                role="menu"
              >
                <div className="border-b border-line px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {user?.email ? "Landlord" : "Account"}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {user?.email || "Signed in"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/settings"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink"
                    role="menuitem"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change password
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
