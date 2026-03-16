import { ALL_MODULES, generateAdminPermissions } from "../constants/modulePermissions";

class PermissionsService {
  constructor() {
    this.userPermissions = null;
    this.userRole = null;
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

    const modulePermissions = this.userPermissions?.[module];
    if (!modulePermissions) return false;

    // Compatibilidad: Listar legado equivale a Ver
    if (action === "Ver") {
      return Boolean(modulePermissions.Ver || modulePermissions.Listar);
    }

    if (action === "Listar") {
      return Boolean(modulePermissions.Ver || modulePermissions.Listar);
    }

    return Boolean(modulePermissions[action]);
  }

  hasModuleAccess(module) {
    if (this.isAdmin()) return true;
    if (!this.userPermissions || !this.userPermissions[module]) return false;
    return Object.values(this.userPermissions[module]).some(Boolean);
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

    return this.userPermissions?.[module] || {};
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
