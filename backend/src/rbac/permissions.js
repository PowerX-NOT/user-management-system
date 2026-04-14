const rolePermissions = {
  admin: ["users:*", "me:read", "me:update"],
  manager: ["users:read", "users:update", "me:read", "me:update"],
  user: ["me:read", "me:update"],
};

export function permissionsForRole(role) {
  return new Set(rolePermissions[role] ?? []);
}

