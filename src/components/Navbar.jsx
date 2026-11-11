import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { clearToken } from "../api";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/tenants", label: "Tenants" },
  { to: "/units", label: "Units" },
  { to: "/rent-records", label: "Rent Records" },
  { to: "/payments", label: "Payments" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span aria-hidden="true">🏠</span> RentTracker
        </Link>

        {/* Collapses into a menu on small screens */}
        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button type="button" className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
