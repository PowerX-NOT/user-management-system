import { permissionsForRole } from "../rbac/permissions.js";

export function requirePermission(permission) {
  return (req, _res, next) => {
    const role = req.auth?.role;
    if (!role) return next({ status: 401, code: "UNAUTHORIZED", message: "Unauthorized" });
    const perms = permissionsForRole(role);
    if (perms.has("users:*") && permission.startsWith("users:")) return next();
    if (perms.has(permission)) return next();
    next({ status: 403, code: "FORBIDDEN", message: "Forbidden" });
  };
}

