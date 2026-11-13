# Landlord Rent Tracker — React frontend

A modern, responsive dashboard for the **Landlord Rent Tracker API**. One landlord can manage tenants, units, rent records, payments, overdue rent, and reminder notifications for a building with self-contain rooms and twin flats.

Built with **React + Vite (JavaScript)**, **React Router**, **Axios**, **Tailwind CSS**, **Inter**, and **lucide-react**.

## Requirements

- Node.js 18+ and npm
- The FastAPI backend (local at `http://localhost:8000`, or the deployed API below)

## Live deployment

- Website: <https://landlord-rent-tracker-web.vercel.app>
- API: <https://landlord-rent-tracker-api.vercel.app>
- Vercel project: `multimind/landlord-rent-tracker-web`

The production build reads `VITE_API_URL` from the Vercel environment and points at the deployed API.

## 1. Start the backend

```bash
cd ../landlord-rent-tracker-api
source venv/bin/activate
python main.py
```

The API and Swagger docs will be at <http://localhost:8000/docs>. The seven units are seeded automatically on first startup.

The backend's CORS is configured to allow `http://localhost:5173`, which is Vite's default port.

## 2. Configure the API URL

The base URL lives in `.env`:

```bash
VITE_API_URL=http://localhost:8000
```

If your backend runs elsewhere, copy `.env.example` to `.env` and change the value. (`.env` is gitignored; `.env.example` is the template.)

## 3. Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

## 4. Log in with the admin-created account

There is no public registration. The API creates the single landlord account from the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables when the database has no users:

```bash
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="replace-with-a-strong-password"
```

Log in with those details. On the first login, the app redirects to **Change password** and blocks every other page until the password is changed. You can also change it later from the **Account** menu.

## Pages

| Route | Page | What it does |
| ----- | ---- | ------------ |
| `/login` | Login | Centred login card with a loading state; no registration link |
| `/` | Dashboard | Summary cards, collection progress, overdue rent with copy-reminder actions, due this week, vacant units |
| `/tenants` | Tenants | Search and filter; add/edit; move out and delete with confirmation |
| `/units` | Units | Search and filter; add/edit rent and occupancy; delete with confirmation |
| `/rent-records` | Rent Records | Search and status filters; add/edit/delete records; partial, paid and overdue badges |
| `/payments` | Payments | Search and date filters; record payments against open rent records |
| `/notifications` | Notifications | All/Unread filters, mark one or all as read, latest reminder alerts |
| `/settings` | Settings | Notification email, reminder days, overdue repeat interval, email switch, password link |
| `/change-password` | Change Password | Forced on first login; also available from the Account menu |

## Features

- **Modern dashboard layout** — fixed desktop sidebar, mobile top bar and slide-in navigation drawer.
- **Dark mode** — persisted in `localStorage` and applied before paint to avoid a flash.
- **Notification bell** — unread badge polled every 60 seconds, latest notifications dropdown, and a full inbox page.
- **Rent reminders** — due-soon, due-today and overdue notifications are colour-coded; overdue tenants include a one-tap **Copy reminder** message.
- **Dashboard actions** — tap-to-call phone links for rent due this week, collection progress, vacant units, and quick links.
- **Reusable UI kit** — `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Table`, `Skeleton`, `EmptyState`, `ConfirmDialog`, `FilterChips`, and `Switch`.
- **Skeleton loading** — no plain "Loading..." text; friendly empty states include an action.
- **Toast feedback** — every create, update, delete, payment and settings action confirms the result.
- **Confirmations** — deletes and tenant move-outs require confirmation.
- **Protected routes** — no token means a redirect to `/login`; any API `401` clears the token and redirects automatically.
- **Forced password change** — a new admin-created account must change its password before any other page is available.
- **Naira formatting** (`₦50,000`) and dates as `DD/MM/YYYY`; reminder copy is normalised too.
- **Responsive tables** — wide tables scroll horizontally without causing page-level overflow; cards stack cleanly on small screens.
- **Accessible focus states** — visible focus rings, labelled form fields, and keyboard-friendly dialogs.

## Project structure

```
src/
  api.js                    Axios instance, JWT handling, error helper
  App.jsx                   Routes and providers
  main.jsx                  React entry point and Inter font imports
  styles.css                Tailwind layers, theme tokens and utilities
  components/
    AuthShell.jsx           Shared login/change-password shell
    PasswordInput.jsx       Password field with show/hide control
    Sidebar.jsx             Desktop sidebar and mobile drawer content
    Topbar.jsx              Top bar, notification bell, theme and account menu
    Layout.jsx              App shell and page outlet
    Toast.jsx               Toast presentation
    ProtectedRoute.jsx      Token and forced-password-change guard
    ErrorBanner.jsx         Error + retry banner
    ui/                     Reusable Button, Card, Badge, Input, Modal, Table,
                            Skeleton, EmptyState, ConfirmDialog, FilterChips, Switch
  context/
    NotificationContext.jsx Unread count polling and latest notifications
    ThemeContext.jsx        Light/dark theme
    ToastContext.jsx        Toast provider
  pages/
    Login.jsx
    ChangePassword.jsx
    Dashboard.jsx
    Tenants.jsx
    Units.jsx
    RentRecords.jsx
    Payments.jsx
    Notifications.jsx
    Settings.jsx
  utils/
    clipboard.js            Clipboard copy with fallback
    cn.js                   Class-name helper
    format.js               Naira, dates, notification copy, unit labels
```

## Build for production

```bash
npm run build
npm run preview
```

The production build is written to `dist/` (gitignored).

To deploy on Vercel, set `VITE_API_URL` in the project's environment variables and deploy with `vercel --prod`. The committed `vercel.json` rewrites all routes to `index.html` so React Router paths such as `/login` and `/tenants` work on refresh.
