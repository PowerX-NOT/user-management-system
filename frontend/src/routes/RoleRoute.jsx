import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../state/AuthContext.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

export function RoleRoute({ roles, children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {roles.includes(user.role) ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}

