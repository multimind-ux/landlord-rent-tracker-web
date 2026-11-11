# Landlord Rent Tracker — React frontend

A clean, mobile-friendly React dashboard for the **Landlord Rent Tracker API**. It lets one landlord manage 5 self-contain rooms and a twin flat: tenants, units, rent records, payments, overdue rent and vacant units.

Built with **React + Vite (JavaScript)**, **React Router**, **Axios**, and plain CSS.

## Requirements

- Node.js 18+ and npm
- The FastAPI backend running at `http://localhost:8000` (see below)

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

## 4. Register the landlord (first run only)

The API allows a single landlord account. Create it once with curl (or from Swagger):

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Landlord", "email": "landlord@example.com", "password": "secret123"}'
```

Then log in on the website with that email and password. Tokens are valid for 2 hours.

> If you already registered while testing, just log in — registering again returns `400 Landlord account already exists`.

## Pages

| Route | Page | What it does |
| ----- | ---- | ------------ |
| `/login` | Login | Logs in via `POST /auth/login`, saves the JWT in `localStorage` |
| `/` | Dashboard | Summary cards, overdue table, vacant units |
| `/tenants` | Tenants | Search, add, edit, move out (with confirmation) |
| `/units` | Units | Type, rent, occupied/vacant status, edit rent amount |
| `/rent-records` | Rent Records | Filter by status; create rent records |
| `/payments` | Payments | Record a payment against an open rent record; view history |

## Features

- **Protected routes** — no token means a redirect to `/login`; any API `401` clears the token and redirects automatically.
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
