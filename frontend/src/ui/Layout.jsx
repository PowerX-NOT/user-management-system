import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";

export function Layout() {
  const { status, user, logout } = useAuth();
  const nav = useNavigate();
  const showUsers =
    status === "authenticated" &&
    (user.role === "admin" || user.role === "manager");

  async function handleLogout() {
    await logout();
    nav("/login", { replace: true });
  }

  const rolePillClass =
    user?.role === "admin"
      ? "pill pill-role-admin"
      : user?.role === "manager"
      ? "pill pill-role-manager"
      : "pill pill-role-user";

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <nav className="nav">
        {/* Brand */}
        <Link to={status === "authenticated" ? "/dashboard" : "/login"} className="navBrand">
          <span className="navBrand-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="18" height="18">
              <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" />
            </svg>
          </span>
          UserFlow
        </Link>

        {/* Right side */}
        <div className="navLinks">
          {status === "authenticated" && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => "navLink" + (isActive ? " active" : "")}
              >
                Dashboard
              </NavLink>
              {showUsers && (
                <NavLink
                  to="/users"
                  className={({ isActive }) => "navLink" + (isActive ? " active" : "")}
                >
                  Users
                </NavLink>
              )}
              <NavLink
                to="/me"
                className={({ isActive }) => "navLink" + (isActive ? " active" : "")}
              >
                My Profile
              </NavLink>

              <div style={{ width: 1, height: 24, background: "var(--border-strong)", margin: "0 4px" }} />

              <span className={rolePillClass}>{user.role}</span>

              <button className="btn btn-sm" onClick={handleLogout} id="nav-logout-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          )}
          {status === "anonymous" && (
            <NavLink to="/login" className={({ isActive }) => "navLink" + (isActive ? " active" : "")}>
              Login
            </NavLink>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
