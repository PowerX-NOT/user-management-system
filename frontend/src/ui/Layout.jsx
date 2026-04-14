import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";

export function Layout() {
  const { status, user, logout } = useAuth();
  const showUsers = status === "authenticated" && (user.role === "admin" || user.role === "manager");

  return (
    <div>
      <div className="nav">
        <div className="navLinks">
          <Link to={status === "authenticated" ? "/dashboard" : "/login"} style={{ fontWeight: 900 }}>
            UMS
          </Link>
          {status === "authenticated" ? (
            <span className="pill">{user.role}</span>
          ) : (
            <span className="pill">anonymous</span>
          )}
        </div>

        <div className="navLinks">
          {status === "authenticated" && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {showUsers && <NavLink to="/users">Users</NavLink>}
              <NavLink to="/me">My profile</NavLink>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          )}
          {status === "anonymous" && <NavLink to="/login">Login</NavLink>}
        </div>
      </div>

      <Outlet />
    </div>
  );
}

