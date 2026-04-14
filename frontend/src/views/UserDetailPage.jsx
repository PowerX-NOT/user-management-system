import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../utils/api.js";

function RolePill({ role }) {
  const cls =
    role === "admin" ? "pill pill-role-admin" :
    role === "manager" ? "pill pill-role-manager" : "pill pill-role-user";
  return <span className={cls}>{role}</span>;
}

function StatusPill({ status }) {
  return (
    <span className={status === "active" ? "pill pill-active" : "pill pill-inactive"}>
      {status}
    </span>
  );
}

export function UserDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { accessToken, ensureFreshAccess, user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", status: "" });
  const [busy, setBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const canEditRole = authUser.role === "admin";
  const canDeactivate = authUser.role === "admin";
  // Manager cannot edit admin users (enforced backend + UI)
  const isTargetAdmin = userData?.role === "admin";
  const canEdit = authUser.role === "admin" || (authUser.role === "manager" && !isTargetAdmin);

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const res = await api.get(`/api/users/${id}`, { accessToken: token });
      setUserData(res.user);
      setForm({
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        status: res.user.status,
      });
    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaveBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const payload = {
        name: form.name,
        email: form.email,
        status: form.status,
        ...(canEditRole ? { role: form.role } : {}),
      };
      const res = await api.patch(`/api/users/${id}`, payload, { accessToken: token });
      setUserData(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaveBusy(false);
    }
  }

  async function doDeactivate() {
    setConfirmDeactivate(false);
    setError(null);
    setDeleteBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      await api.delete(`/api/users/${id}`, { accessToken: token });
      nav("/users");
    } catch (err) {
      setError(err.message || "Failed to deactivate");
    } finally {
      setDeleteBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (busy && !userData) {
    return (
      <div className="loading-state" style={{ minHeight: 400 }}>
        <div className="spinner spinner-lg" />
        <span>Loading user…</span>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back button + header */}
      <div className="page-header animate-in">
        <div>
          <div style={{ marginBottom: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => nav("/users")}
              id="back-to-users-btn"
              style={{ marginBottom: 10 }}
            >
              ← Back to Users
            </button>
          </div>
          <h1 className="page-title">
            {userData ? userData.name : "User Detail"}
          </h1>
          {userData && (
            <p className="page-subtitle"
              style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{userData.email}</span>
              <RolePill role={userData.role} />
              <StatusPill status={userData.status} />
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error animate-sd" style={{ marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {saved && (
        <div className="alert alert-success animate-sd" style={{ marginBottom: 20 }}>
          ✅ Changes saved successfully.
        </div>
      )}

      {userData && (
        <>
          {/* Edit form */}
          <div className="card animate-in" style={{ marginBottom: 20 }}>
            <div className="h3" style={{ marginBottom: 20 }}>Edit User</div>
            {!canEdit && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                🔒 Managers cannot edit admin users.
              </div>
            )}
            <form onSubmit={save} id="user-edit-form">
              <div className="row" style={{ marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label className="label" htmlFor="ue-name">Name</label>
                  <input
                    id="ue-name"
                    className="input"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={!canEdit || saveBusy}
                  />
                </div>
                <div style={{ flex: 1.5, minWidth: 220 }}>
                  <label className="label" htmlFor="ue-email">Email</label>
                  <input
                    id="ue-email"
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    disabled={!canEdit || saveBusy}
                  />
                </div>
                <div style={{ width: 160 }}>
                  <label className="label" htmlFor="ue-role">Role</label>
                  <select
                    id="ue-role"
                    className="input"
                    value={form.role}
                    disabled={!canEditRole || saveBusy}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                  {!canEditRole && (
                    <div className="muted" style={{ fontSize: 11, marginTop: 5 }}>
                      Only admins can change roles.
                    </div>
                  )}
                </div>
                <div style={{ width: 160 }}>
                  <label className="label" htmlFor="ue-status">Status</label>
                  <select
                    id="ue-status"
                    className="input"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    disabled={!canEdit || saveBusy}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="row row-between">
                <div className="row">
                  <button
                    id="save-user-btn"
                    className="btn btnPrimary"
                    type="submit"
                    disabled={saveBusy || !canEdit}
                  >
                    {saveBusy ? (
                      <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                    ) : "Save Changes"}
                  </button>
                </div>

                {canDeactivate && (
                  <button
                    id="deactivate-user-btn"
                    type="button"
                    className="btn btnDanger"
                    onClick={() => setConfirmDeactivate(true)}
                    disabled={deleteBusy || saveBusy}
                  >
                    {deleteBusy ? (
                      <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Deactivating…</>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                        Deactivate
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Deactivate confirmation */}
          {confirmDeactivate && (
            <div className="card card-accent animate-sd" style={{ marginBottom: 20, borderColor: "rgba(239,68,68,0.4)" }}>
              <div className="h3" style={{ marginBottom: 10, color: "#fca5a5" }}>⚠️ Confirm Deactivation</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
                This will soft-delete the user. They won't be able to log in anymore. This action cannot be undone from the UI.
              </p>
              <div className="row">
                <button
                  id="confirm-deactivate-btn"
                  className="btn btnDanger"
                  onClick={doDeactivate}
                  disabled={deleteBusy}
                >
                  Yes, Deactivate
                </button>
                <button className="btn" onClick={() => setConfirmDeactivate(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Audit info */}
          <div className="card animate-in">
            <div className="section-title" style={{ marginBottom: 16 }}>Audit Information</div>
            <div className="audit-row">
              <div className="audit-field">
                <span className="audit-key">Created At</span>
                <span className="audit-val">{new Date(userData.createdAt).toLocaleString()}</span>
              </div>
              {userData.createdBy && (
                <div className="audit-field">
                  <span className="audit-key">Created By</span>
                  <span className="audit-val">
                    {userData.createdBy.name || userData.createdBy.email || userData.createdBy.id}
                    {userData.createdBy.email && (
                      <span className="muted" style={{ fontSize: 12, marginLeft: 6 }}>
                        ({userData.createdBy.email})
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="audit-field">
                <span className="audit-key">Last Updated</span>
                <span className="audit-val">{new Date(userData.updatedAt).toLocaleString()}</span>
              </div>
              {userData.updatedBy && (
                <div className="audit-field">
                  <span className="audit-key">Updated By</span>
                  <span className="audit-val">
                    {userData.updatedBy.name || userData.updatedBy.email || userData.updatedBy.id}
                    {userData.updatedBy.email && (
                      <span className="muted" style={{ fontSize: 12, marginLeft: 6 }}>
                        ({userData.updatedBy.email})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
