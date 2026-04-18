import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { api } from "../utils/api.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | anonymous | authenticated
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const initStartedRef = useRef(false);

  async function loadMe(token) {
    const res = await api.get("/api/me", { accessToken: token });
    setUser(res.user);
    setStatus("authenticated");
  }

  async function refresh() {
    try {
      const res = await api.post("/api/auth/refresh", null, { accessToken: null });
      setAccessToken(res.accessToken);
      if (res.user) {
        setUser(res.user);
        setStatus("authenticated");
        return;
      }
      await loadMe(res.accessToken);
    } catch {
      setAccessToken(null);
      setUser(null);
      setStatus("anonymous");
    }
  }

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      accessToken,
      async login({ email, password }) {
        const res = await api.post("/api/auth/login", { email, password }, { accessToken: null });
        setAccessToken(res.accessToken);
        if (res.user) {
          setUser(res.user);
          setStatus("authenticated");
          return;
        }
        await loadMe(res.accessToken);
      },
      async logout() {
        try {
          await api.post("/api/auth/logout", null, { accessToken });
        } finally {
          setAccessToken(null);
          setUser(null);
          setStatus("anonymous");
        }
      },
      async reloadMe() {
        if (!accessToken) return;
        await loadMe(accessToken);
      },
      async ensureFreshAccess() {
        if (status !== "authenticated") return null;
        try {
          const r = await api.post("/api/auth/refresh", null, { accessToken: null });
          setAccessToken(r.accessToken);
          if (r.user) setUser(r.user);
          return r.accessToken;
        } catch {
          setAccessToken(null);
          setUser(null);
          setStatus("anonymous");
          return null;
        }
      },
    }),
    [accessToken, status, user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("AuthContext missing");
  return v;
}

