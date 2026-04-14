import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";

export function DashboardPage() {
  const { user } = useAuth();
  const canManage = user.role === "admin" || user.role === "manager";

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <p className="muted" style={{ marginTop: -8 }}>
          Signed in as <b>{user.email}</b>
        </p>

        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn" to="/me">
            My profile
          </Link>
          {canManage && (
            <Link className="btn btnPrimary" to="/users">
              User management
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

