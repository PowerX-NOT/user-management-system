import React, { useEffect, useState } from "react";

import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../utils/api.js";

export function MePage() {
  const { user, accessToken, ensureFreshAccess, reloadMe } = useAuth();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  async function save(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const payload = {};
      if (name.trim() && name.trim() !== user.name) payload.name = name.trim();
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError("No changes to save.");
        setBusy(false);
        return;
      }

      await api.patch("/api/me", payload, { accessToken: token });
      await reloadMe();
      setPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  const rolePillCls =
    user.role === "admin" ? "pill pill-role-admin" :
    user.role === "manager" ? "pill pill-role-manager" : "pill pill-role-user";

  return (
    <div className="container">
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: 28 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">
          Manage your account details and password
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* Profile info card */}
        <div className="card animate-in">
          <div className="section-title" style={{ marginBottom: 16 }}>Account Info</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div className="audit-key">Full Name</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{user.name}</div>
            </div>
            <div>
              <div className="audit-key">Email Address</div>
              <div style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 4 }}>{user.email}</div>
            </div>
            <div>
              <div className="audit-key">Role</div>
              <div style={{ marginTop: 6 }}>
                <span className={rolePillCls}>{user.role}</span>
              </div>
            </div>
            <div>
              <div className="audit-key">Account Status</div>
              <div style={{ marginTop: 6 }}>
                <span className="pill pill-active">Active</span>
              </div>
            </div>
          </div>

          <div className="divider" />
          <div className="alert alert-info" style={{ fontSize: 13 }}>
            🔒 Your role can only be changed by an administrator.
          </div>
        </div>

        {/* Edit form card */}
        <div className="card animate-in">
          <div className="section-title" style={{ marginBottom: 16 }}>Update Details</div>

          {saved && (
            <div className="alert alert-success animate-sd" style={{ marginBottom: 16 }}>
              ✅ Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="alert alert-error animate-sd" style={{ marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={save} id="profile-edit-form">
            <div className="formGroup" style={{ marginBottom: 16 }}>
              <label className="label" htmlFor="me-name">Display Name</label>
              <input
                id="me-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                placeholder="Your display name"
              />
            </div>

            <div className="divider" />
            <div style={{ marginBottom: 12 }}>
              <div className="audit-key" style={{ marginBottom: 8 }}>Change Password</div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
                Leave both fields blank to keep your current password.
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <label className="label" htmlFor="me-password">New Password</label>
              <input
                id="me-password"
                className="input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                disabled={busy}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 10,
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="formGroup" style={{ marginBottom: 20 }}>
              <label className="label" htmlFor="me-confirm-password">Confirm New Password</label>
              <input
                id="me-confirm-password"
                className="input"
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                disabled={busy}
              />
            </div>

            <button
              id="save-profile-btn"
              className="btn btnPrimary"
              type="submit"
              disabled={busy}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {busy ? (
                <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Saving…</>
              ) : "Save Changes"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
