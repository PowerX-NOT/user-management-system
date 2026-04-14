import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../utils/api.js";

export function UserDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { accessToken, ensureFreshAccess, user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", status: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [initialPassword, setInitialPassword] = useState(null);

  const canEditRole = authUser.role === "admin";

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const res = await api.get(`/api/users/${id}`, { accessToken: token });
      setUser(res.user);
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

  async function save() {
    setError(null);
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const payload = {
        name: form.name,
        email: form.email,
        status: form.status,
        ...(canEditRole ? { role: form.role } : null),
      };
      const res = await api.patch(`/api/users/${id}`, payload, { accessToken: token });
      setUser(res.user);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    if (!confirm("Deactivate (soft delete) this user?")) return;
    setError(null);
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      await api.delete(`/api/users/${id}`, { accessToken: token });
      nav("/users");
    } catch (err) {
      setError(err.message || "Failed to deactivate");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>User detail</h2>
            {user && (
              <div className="muted" style={{ marginTop: 6 }}>
                Created {new Date(user.createdAt).toLocaleString()}
                {user.createdBy?.email ? ` by ${user.createdBy.email}` : ""} • Updated{" "}
                {new Date(user.updatedAt).toLocaleString()}
                {user.updatedBy?.email ? ` by ${user.updatedBy.email}` : ""}
              </div>
            )}
          </div>
          <button className="btn" onClick={() => nav("/users")}>
            Back
          </button>
        </div>

        {error && (
          <div className="error" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        {!user && busy && <div style={{ marginTop: 12 }}>Loading…</div>}

        {user && (
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={{ width: 180 }}>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                disabled={!canEditRole}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="user">user</option>
              </select>
              {!canEditRole && <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Managers cannot change roles.</div>}
            </div>
            <div style={{ width: 180 }}>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>
        )}

        {initialPassword && (
          <div className="card" style={{ marginTop: 12, borderColor: "#fde68a", background: "#fffbeb" }}>
            <div style={{ fontWeight: 800 }}>Initial password</div>
            <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{initialPassword}</div>
          </div>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={save} disabled={busy || !user}>
            Save
          </button>
          {authUser.role === "admin" && (
            <button className="btn btnDanger" onClick={deactivate} disabled={busy || !user}>
              Deactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

