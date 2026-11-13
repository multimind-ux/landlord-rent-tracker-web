import { Building2, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AuthShell({ title, subtitle, children, footer }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-canvas to-canvas dark:from-indigo-950/20 dark:via-canvas dark:to-canvas" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-xl border border-line bg-surface p-2.5 text-muted shadow-sm transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 sm:right-6 sm:top-6"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight text-ink">
              RentTracker
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Landlord workspace
            </span>
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm leading-6 text-muted">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {footer && <div className="mt-5 text-center">{footer}</div>}
        <p className="mt-5 text-center text-[11px] text-muted">
          RentTracker · Secure landlord access
        </p>
      </div>
    </div>
  );
}
