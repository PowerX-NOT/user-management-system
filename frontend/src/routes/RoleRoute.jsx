import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

export function RoleRoute({ roles, children }) {
  const { status, user } = useAuth();

  return (
    <ProtectedRoute>
      {status !== "authenticated" ? (
        <div className="container">Loading…</div>
      ) : roles.includes(user.role) ? (
        children
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
}

