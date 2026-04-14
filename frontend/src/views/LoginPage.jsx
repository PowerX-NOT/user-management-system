import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";

export function LoginPage() {
  const { status, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email, password });
      nav(loc.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="loading-state" style={{ minHeight: "100dvh" }}>
        <div className="spinner spinner-lg" />
        <span>Checking session…</span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-base)",
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-10%",
          left: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-10%",
          right: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="card-glass animate-in"
        style={{ width: "100%", maxWidth: 440, padding: "40px 36px" }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px var(--accent-glow)",
          }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 9a7 7 0 1 1 14 0H5z" />
            </svg>
          </div>
        </div>

        <h1 className="h2" style={{ textAlign: "center", marginBottom: 6 }}>
          Welcome back
        </h1>
        <p className="muted" style={{ textAlign: "center", fontSize: 14, marginBottom: 28 }}>
          Sign in to your UserFlow account
        </p>

        <form onSubmit={onSubmit} noValidate>
          {/* Email */}
          <div className="formGroup" style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          {/* Password */}
          <div className="formGroup" style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                className="input"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={busy}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
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
          </div>

          {error && (
            <div className="alert alert-error animate-sd" style={{ marginBottom: 18 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            className="btn btnPrimary"
            type="submit"
            disabled={busy || !email || !password}
            style={{ width: "100%", justifyContent: "center", padding: "12px 20px", fontSize: 15 }}
          >
            {busy ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
          Session is secured with JWT + httpOnly refresh cookies.
        </p>
      </div>
    </div>
  );
}
