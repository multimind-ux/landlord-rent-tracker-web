import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuth } from "../api";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/tenants", label: "Tenants" },
  { to: "/units", label: "Units" },
  { to: "/rent-records", label: "Rent Records" },
  { to: "/payments", label: "Payments" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearAuth();
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

          <div className="profile-menu" ref={menuRef}>
            <button
              type="button"
              className="profile-toggle"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="profile-avatar" aria-hidden="true">
                L
              </span>
              Account
            </button>

            {menuOpen && (
              <div className="profile-dropdown" role="menu">
                <NavLink
                  to="/change-password"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpen(false);
                  }}
                >
                  Change password
                </NavLink>
                <button
                  type="button"
                  className="logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
