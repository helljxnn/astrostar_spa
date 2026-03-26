import { ALL_MODULES, generateAdminPermissions } from "../constants/modulePermissions";

class PermissionsService {
  constructor() {
    this.userPermissions = null;
    this.userRole = null;
  }

  normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  getModulePermissionsSafe(module) {
    if (!this.userPermissions || !module) return null;

    if (this.userPermissions[module]) {
      return this.userPermissions[module];
    }

    const target = this.normalizeKey(module);
    const matchKey = Object.keys(this.userPermissions).find(
      (key) => this.normalizeKey(key) === target,
    );

    return matchKey ? this.userPermissions[matchKey] : null;
  }

  getActionValue(modulePermissions, action) {
    if (!modulePermissions || !action) return false;

    const actionAliases =
      action === "Ver" || action === "Listar"
        ? ["Ver", "Listar", "ver", "listar", "View", "Read"]
        : [action];

    for (const alias of actionAliases) {
      if (Object.prototype.hasOwnProperty.call(modulePermissions, alias)) {
        return Boolean(modulePermissions[alias]);
      }
    }

    const normalizedAliases = actionAliases.map((alias) =>
      this.normalizeKey(alias),
    );

    const matchedKey = Object.keys(modulePermissions).find((key) =>
      normalizedAliases.includes(this.normalizeKey(key)),
    );

    return matchedKey ? Boolean(modulePermissions[matchedKey]) : false;
  }

  setUserPermissions(user, permissions) {
    this.userRole = user.role?.name || user.rol || user.role;
    this.userPermissions = permissions || user.role?.permissions || {};
  }

  isAdmin() {
    const role = String(this.userRole || "").toLowerCase();
    return role === "admin" || role === "administrador" || role === "administrador sistema";
  }

  hasPermission(module, action) {
    if (this.isAdmin()) return true;

    const modulePermissions = this.getModulePermissionsSafe(module);
    if (!modulePermissions) return false;
    return this.getActionValue(modulePermissions, action);
  }

  hasModuleAccess(module) {
    if (this.isAdmin()) return true;
    const modulePermissions = this.getModulePermissionsSafe(module);
    if (!modulePermissions) return false;
    return Object.values(modulePermissions).some(Boolean);
  }

  getAccessibleModules() {
    if (this.isAdmin()) return ALL_MODULES;
    if (!this.userPermissions) return [];

    return Object.keys(this.userPermissions).filter((module) => {
      const modulePermissions = this.userPermissions[module];
      return Object.values(modulePermissions).some(Boolean);
    });
  }

  getModulePermissions(module) {
    if (this.isAdmin()) {
      const adminPerms = generateAdminPermissions();
      return (
        adminPerms[module] || {
          Ver: true,
          Crear: true,
          Editar: true,
          Eliminar: true,
        }
      );
    }

    return this.getModulePermissionsSafe(module) || {};
  }

  hasAllPermissions(permissionChecks) {
    return permissionChecks.every(({ module, action }) =>
      this.hasPermission(module, action),
    );
  }

  hasAnyPermission(permissionChecks) {
    return permissionChecks.some(({ module, action }) =>
      this.hasPermission(module, action),
    );
  }

  clearPermissions() {
    this.userPermissions = null;
    this.userRole = null;
  }

  getDebugInfo() {
    return {
      userRole: this.userRole,
      userPermissions: this.userPermissions,
      accessibleModules: this.getAccessibleModules(),
    };
  }
}

const permissionsService = new PermissionsService();

export default permissionsService;
