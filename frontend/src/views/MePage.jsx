import React, { useEffect, useState } from "react";

import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../utils/api.js";

export function MePage() {
  const { user, accessToken, ensureFreshAccess, reloadMe } = useAuth();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
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
    setBusy(true);
    try {
      const token = accessToken || (await ensureFreshAccess());
      const payload = {};
      if (name !== user.name) payload.name = name;
      if (password) payload.password = password;
      await api.patch("/api/me", payload, { accessToken: token });
      await reloadMe();
      setPassword("");
      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 700 }}>
        <h2 style={{ marginTop: 0 }}>My profile</h2>
        <div className="muted" style={{ marginTop: -8 }}>
          {user.email} • role: <b>{user.role}</b>
        </div>

        <form onSubmit={save} style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">New password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          {error && <div className="error">{error}</div>}
          {saved && <div style={{ color: "#047857", fontWeight: 700 }}>Saved.</div>}

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

