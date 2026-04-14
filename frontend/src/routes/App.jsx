import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "../ui/Layout.jsx";
import { LoginPage } from "../views/LoginPage.jsx";
import { DashboardPage } from "../views/DashboardPage.jsx";
import { UsersPage } from "../views/UsersPage.jsx";
import { UserDetailPage } from "../views/UserDetailPage.jsx";
import { MePage } from "../views/MePage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <RoleRoute roles={["admin", "manager"]}>
              <UsersPage />
            </RoleRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <RoleRoute roles={["admin", "manager"]}>
              <UserDetailPage />
            </RoleRoute>
          }
        />

        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <MePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

