import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const loc = useLocation();

  if (status === "loading") return <div className="container">Loading…</div>;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

