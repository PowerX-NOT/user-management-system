import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";

function StatCard({ value, label, icon, colorClass }) {
  return (
    <div className="stat-card animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className={`stat-value ${colorClass || ""}`}>{value}</span>
        <span style={{ fontSize: 24, opacity: 0.6 }}>{icon}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const canManage = isAdmin || isManager;

  return (
    <div className="container">
      {/* Page Header */}
      <div className="animate-in" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            boxShadow: "0 0 20px var(--accent-glow)",
          }}>
            👋
          </div>
          <div>
            <h1 className="h1">
              Hello, {user.name}!
            </h1>
            <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Role Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        <StatCard value={user.name} label="Signed in as" icon="👤" />
        <StatCard
          value={
            <span className={
              isAdmin ? "pill pill-role-admin" :
              isManager ? "pill pill-role-manager" : "pill pill-role-user"
            } style={{ fontSize: 16 }}>
              {user.role}
            </span>
          }
          label="Your role"
          icon="🔑"
        />
        <StatCard
          value={
            <span className="pill pill-active" style={{ fontSize: 16 }}>
              active
            </span>
          }
          label="Account status"
          icon="✅"
        />
      </div>

      {/* Quick Actions */}
      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <div className="section-title">Quick Actions</div>

        <div className="row" style={{ gap: 14 }}>
          <Link
            to="/me"
            className="btn"
            id="dashboard-profile-link"
            style={{
              padding: "14px 20px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-start",
              minWidth: 160,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 22 }}>⚙️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>My Profile</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Update name &amp; password
              </div>
            </div>
          </Link>

          {canManage && (
            <Link
              to="/users"
              className="btn btnPrimary"
              id="dashboard-users-link"
              style={{
                padding: "14px 20px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-start",
                minWidth: 160,
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 22 }}>👥</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>User Management</div>
                <div style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>
                  {isAdmin ? "Create, edit, delete users" : "View & update users"}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Role capabilities info */}
      <div className="card animate-in">
        <div className="section-title">Your Permissions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              ok: true,
              label: "View and update your own profile",
            },
            {
              ok: canManage,
              label: "View the user list",
            },
            {
              ok: canManage,
              label: "View and update individual user details",
            },
            {
              ok: isAdmin,
              label: "Create new users",
            },
            {
              ok: isAdmin,
              label: "Assign or change user roles",
            },
            {
              ok: isAdmin,
              label: "Deactivate (soft-delete) users",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: item.ok ? "var(--success-light)" : "rgba(100,116,139,0.06)",
                border: `1px solid ${item.ok ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
              }}
            >
              <span style={{ fontSize: 14 }}>{item.ok ? "✅" : "🔒"}</span>
              <span style={{
                fontSize: 14,
                color: item.ok ? "var(--text-primary)" : "var(--text-muted)",
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
