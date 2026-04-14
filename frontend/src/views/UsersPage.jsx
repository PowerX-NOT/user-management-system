import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../utils/api.js";

export function UsersPage() {
  const { accessToken, ensureFreshAccess, user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createdPassword, setCreatedPassword] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    autoPassword: true,
  });

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      const res = await api.get(`/api/users?${params.toString()}`, { accessToken: token });
      setItems(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setBusy(false);
    }
  }

  async function createUser(e) {
    e.preventDefault();
    setError(null);
    setCreatedPassword(null);
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const res = await api.post(
        "/api/users",
        {
          name: createForm.name,
          email: createForm.email,
          role: createForm.role,
          status: createForm.status,
          autoPassword: !!createForm.autoPassword,
        },
        { accessToken: token }
      );
      setCreatedPassword(res.initialPassword);
      setCreateForm({ name: "", email: "", role: "user", status: "active", autoPassword: true });
      setCreateOpen(false);
      await load();
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Users</h2>
            <div className="muted" style={{ marginTop: 6 }}>
              Manage users (role-based). Logged in as <b>{user.role}</b>.
            </div>
          </div>
          {user.role === "admin" && (
            <button className="btn btnPrimary" onClick={() => setCreateOpen((v) => !v)} disabled={busy}>
              {createOpen ? "Close" : "Create user"}
            </button>
          )}
        </div>

        {createdPassword && (
          <div className="card" style={{ marginTop: 12, borderColor: "#86efac", background: "#f0fdf4" }}>
            <div style={{ fontWeight: 900 }}>User created</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Share this initial password once (it won’t be shown again):
            </div>
            <div style={{ marginTop: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 800 }}>
              {createdPassword}
            </div>
          </div>
        )}

        {createOpen && user.role === "admin" && (
          <div className="card" style={{ marginTop: 12, borderColor: "#c7d2fe", background: "#eef2ff" }}>
            <form onSubmit={createUser}>
              <div className="row">
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div style={{ width: 180 }}>
                  <label className="label">Role</label>
                  <select
                    className="input"
                    value={createForm.role}
                    onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="user">user</option>
                  </select>
                </div>
                <div style={{ width: 180 }}>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={createForm.status}
                    onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={createForm.autoPassword}
                      onChange={(e) => setCreateForm((f) => ({ ...f, autoPassword: e.target.checked }))}
                    />
                    <span style={{ fontWeight: 700 }}>Auto-generate password</span>
                  </label>
                </div>
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btnPrimary" disabled={busy}>
                  {busy ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 2, minWidth: 220 }}>
            <label className="label">Search</label>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="name or email" />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Any</option>
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="user">user</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btnPrimary" onClick={() => { setPage(1); load(); }} disabled={busy}>
              Apply
            </button>
          </div>
        </div>

        {error && (
          <div className="error" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td>{new Date(u.updatedAt).toLocaleString()}</td>
                  <td>
                    <Link className="btn" to={`/users/${u.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !busy && (
                <tr>
                  <td colSpan={6} className="muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="row" style={{ marginTop: 12, justifyContent: "space-between", alignItems: "center" }}>
          <div className="muted">
            Page {page} / {totalPages}
          </div>
          <div className="row">
            <button className="btn" disabled={page <= 1 || busy} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <button className="btn" disabled={page >= totalPages || busy} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

