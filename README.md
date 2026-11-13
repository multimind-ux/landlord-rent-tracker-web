# Landlord Rent Tracker — React frontend

A clean, mobile-friendly React dashboard for the **Landlord Rent Tracker API**. It lets one landlord manage 5 self-contain rooms and a twin flat: tenants, units, rent records, payments, overdue rent and vacant units.

Built with **React + Vite (JavaScript)**, **React Router**, **Axios**, and plain CSS.

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

The backend's CORS is already configured to allow `http://localhost:5173`, which is Vite's default port.

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
| `/login` | Login | Logs in via `POST /auth/login`, saves the JWT in `localStorage` |
| `/` | Dashboard | Summary cards, overdue table, vacant units |
| `/tenants` | Tenants | Search, add, edit, move out (with confirmation) |
| `/units` | Units | Type, rent, occupied/vacant status, edit rent amount |
| `/rent-records` | Rent Records | Filter by status; create rent records |
| `/payments` | Payments | Record a payment against an open rent record; view history |
| `/change-password` | Change Password | Forced on first login; also available from the Account menu |

## Features

- **Protected routes** — no token means a redirect to `/login`; any API `401` clears the token and redirects automatically.
- **Forced password change** — a new admin-created account must change its password before any other page is available.
- **Account menu** — change the password or log out from the profile menu.
- **One Axios instance** (`src/api.js`) attaches the Bearer token to every request.
- **Loading states and error messages** on every request, with retry buttons.
- **Colour-coded badges** — green for paid/active/occupied, yellow for partial/vacant, red for unpaid/overdue.
- **Naira formatting** (`₦50,000`) and dates as `DD/MM/YYYY`.
- **Confirmation** before moving a tenant out.
- **Responsive layout** — the navbar collapses into a menu on mobile and tables scroll horizontally.
- **Payment history** comes from the backend `GET /payments` endpoint.

## Project structure

```
src/
  api.js                  Axios instance, JWT handling, error helper
  App.jsx                 Routes
  main.jsx                React entry point
  styles.css              Global plain CSS
  components/
    Navbar.jsx            Responsive navigation + logout
    ProtectedRoute.jsx    Token guard
    Layout.jsx            Navbar + page outlet
    StatusBadge.jsx       Colour-coded status pill
    SummaryCard.jsx       Dashboard metric card
    Modal.jsx             Reusable dialog
    PageLoader.jsx        Loading spinner
    ErrorBanner.jsx       Error + retry banner
  pages/
    Login.jsx
    Dashboard.jsx
    Tenants.jsx
    Units.jsx
    RentRecords.jsx
    Payments.jsx
  utils/
    format.js             Naira, dates, unit labels
```

## Build for production

```bash
npm run build
npm run preview
```

The production build is written to `dist/` (gitignored).

To deploy on Vercel, set `VITE_API_URL` in the project's environment variables and deploy with `vercel --prod`. The committed `vercel.json` rewrites all routes to `index.html` so React Router paths such as `/login` and `/tenants` work on refresh.
