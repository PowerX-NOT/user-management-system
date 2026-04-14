import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

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

export function UsersPage() {
  const { accessToken, ensureFreshAccess, user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createdPassword, setCreatedPassword] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [createBusy, setCreateBusy] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    autoPassword: true,
    password: "",
  });

  const load = useCallback(
    async (p = page) => {
      setError(null);
      setBusy(true);
      try {
        const token = accessToken || (await ensureFreshAccess());
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", "20");
        if (q.trim()) params.set("q", q.trim());
        if (role) params.set("role", role);
        if (status) params.set("status", status);
        const res = await api.get(`/api/users?${params.toString()}`, { accessToken: token });
        setItems(res.items);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, page, q, role, status]
  );

  async function applyFilters() {
    setPage(1);
    await load(1);
  }

  async function createUser(e) {
    e.preventDefault();
    setCreateError(null);
    setCreatedPassword(null);
    setCreateBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const payload = {
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        status: createForm.status,
        autoPassword: !!createForm.autoPassword,
      };
      if (!createForm.autoPassword && createForm.password) {
        payload.password = createForm.password;
        delete payload.autoPassword;
      }
      const res = await api.post("/api/users", payload, { accessToken: token });
      setCreatedPassword(res.initialPassword || null);
      setCreateForm({ name: "", email: "", role: "user", status: "active", autoPassword: true, password: "" });
      setCreateOpen(false);
      await load(1);
      setPage(1);
    } catch (err) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setCreateBusy(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            {total > 0 ? `${total} user${total !== 1 ? "s" : ""} found` : "Manage platform users"}
            {" "}· Signed in as <RolePill role={user.role} />
          </p>
        </div>
        {user.role === "admin" && (
          <button
            id="create-user-toggle-btn"
            className={createOpen ? "btn" : "btn btnPrimary"}
            onClick={() => { setCreateOpen((v) => !v); setCreateError(null); }}
            disabled={busy}
          >
            {createOpen ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Close
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Create User
              </>
            )}
          </button>
        )}
      </div>

      {/* Created password banner */}
      {createdPassword && (
        <div className="alert alert-success animate-sd" style={{ marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>User created successfully!</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
              Share this one-time password with the user — it won't be shown again:
            </div>
            <div className="password-box">
              <span className="password-value font-mono">{createdPassword}</span>
              <button
                className="btn btn-sm"
                onClick={() => { navigator.clipboard.writeText(createdPassword); }}
                title="Copy to clipboard"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {createOpen && user.role === "admin" && (
        <div className="card card-accent animate-sd" style={{ marginBottom: 20 }}>
          <div className="h3" style={{ marginBottom: 18 }}>Create new user</div>
          <form onSubmit={createUser} id="create-user-form">
            <div className="row" style={{ marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="label" htmlFor="cu-name">Name</label>
                <input
                  id="cu-name"
                  className="input"
                  type="text"
                  placeholder="Full name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div style={{ flex: 1.5, minWidth: 220 }}>
                <label className="label" htmlFor="cu-email">Email</label>
                <input
                  id="cu-email"
                  className="input"
                  type="email"
                  placeholder="user@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div style={{ width: 160 }}>
                <label className="label" htmlFor="cu-role">Role</label>
                <select
                  id="cu-role"
                  className="input"
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ width: 160 }}>
                <label className="label" htmlFor="cu-status">Status</label>
                <select
                  id="cu-status"
                  className="input"
                  value={createForm.status}
                  onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Password section */}
            <div style={{ marginBottom: 16 }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={createForm.autoPassword}
                  onChange={(e) => setCreateForm((f) => ({ ...f, autoPassword: e.target.checked, password: "" }))}
                />
                Auto-generate a secure password
              </label>
              {!createForm.autoPassword && (
                <div style={{ marginTop: 10 }}>
                  <label className="label" htmlFor="cu-password">Password (min 8 chars)</label>
                  <input
                    id="cu-password"
                    className="input"
                    type="password"
                    placeholder="Choose a password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                    minLength={8}
                    required={!createForm.autoPassword}
                  />
                </div>
              )}
            </div>

            {createError && (
              <div className="alert alert-error animate-sd" style={{ marginBottom: 14 }}>
                {createError}
              </div>
            )}

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn"
                onClick={() => { setCreateOpen(false); setCreateError(null); }}
              >
                Cancel
              </button>
              <button id="create-user-submit-btn" className="btn btnPrimary" type="submit" disabled={createBusy}>
                {createBusy ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating…</>
                ) : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card animate-in" style={{ marginBottom: 20 }}>
        <div className="row row-center" style={{ gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="label" htmlFor="filter-q">Search</label>
            <input
              id="filter-q"
              className="input"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or email…"
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label" htmlFor="filter-role">Role</label>
            <select id="filter-role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label" htmlFor="filter-status">Status</label>
            <select id="filter-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              id="apply-filter-btn"
              className="btn btnPrimary"
              onClick={applyFilters}
              disabled={busy}
            >
              {busy ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              )}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error animate-sd" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card animate-in" style={{ padding: 0, overflow: "hidden" }}>
        {busy && items.length === 0 ? (
          <div className="loading-state">
            <div className="spinner spinner-lg" />
            <span>Loading users…</span>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{u.email}</td>
                    <td><RolePill role={u.role} /></td>
                    <td><StatusPill status={u.status} /></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {new Date(u.updatedAt).toLocaleString()}
                    </td>
                    <td>
                      <Link
                        className="btn btn-sm"
                        to={`/users/${u.id}`}
                        id={`view-user-${u.id}`}
                        style={{ fontSize: 13 }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !busy && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <div className="empty-title">No users found</div>
                        <div className="empty-text">Try adjusting your search or filters.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="row row-between animate-in" style={{ marginTop: 16 }}>
          <span className="page-info">Page {page} of {totalPages}</span>
          <div className="pagination">
            <button
              className="btn btn-sm"
              disabled={page <= 1 || busy}
              onClick={() => setPage((p) => p - 1)}
              id="pagination-prev"
            >
              ← Prev
            </button>
            <button
              className="btn btn-sm"
              disabled={page >= totalPages || busy}
              onClick={() => setPage((p) => p + 1)}
              id="pagination-next"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
