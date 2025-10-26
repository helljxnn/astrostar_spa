import { ALL_MODULES, generateAdminPermissions } from '../constants/modulePermissions';

/**
 * Servicio para gestionar permisos en el frontend
 */
class PermissionsService {
  constructor() {
    this.userPermissions = null;
    this.userRole = null;
  }

  /**
   * Inicializar permisos del usuario
   * @param {Object} user - Datos del usuario
   * @param {Object} permissions - Permisos del usuario
   */
  setUserPermissions(user, permissions) {
    this.userRole = user.role?.name || user.rol || user.role;
    this.userPermissions = permissions || user.role?.permissions || {};
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} module - Módulo (ej: 'users', 'roles', 'dashboard')
   * @param {string} action - Acción (ej: 'Ver', 'Crear', 'Editar', 'Eliminar')
   * @returns {boolean}
   */
  hasPermission(module, action) {
    // Si es admin, permitir todo
    if (this.userRole === 'admin') {
      return true;
    }

    if (!this.userPermissions || !this.userPermissions[module]) {
      return false;
    }

    return Boolean(this.userPermissions[module][action]);
  }

  /**
   * Verificar si el usuario tiene acceso a un módulo (cualquier acción)
   * @param {string} module - Módulo a verificar
   * @returns {boolean}
   */
  hasModuleAccess(module) {
    // Si es admin, permitir todo
    if (this.userRole === 'admin') {
      return true;
    }

    if (!this.userPermissions || !this.userPermissions[module]) {
      return false;
    }

    // Verificar si tiene al menos un permiso en el módulo
    return Object.values(this.userPermissions[module]).some(Boolean);
  }

  /**
   * Obtener todos los módulos a los que tiene acceso
   * @returns {Array} Array de módulos
   */
  getAccessibleModules() {
    if (this.userRole === 'admin') {
      return ALL_MODULES;
    }

    if (!this.userPermissions) {
      return [];
    }

    return Object.keys(this.userPermissions).filter(module => {
      const modulePermissions = this.userPermissions[module];
      return Object.values(modulePermissions).some(Boolean);
    });
  }

  /**
   * Obtener permisos específicos de un módulo
   * @param {string} module - Módulo
   * @returns {Object} Permisos del módulo
   */
  getModulePermissions(module) {
    if (this.userRole === 'admin') {
      const adminPerms = generateAdminPermissions();
      return adminPerms[module] || {
        'Ver': true,
        'Crear': true,
        'Editar': true,
        'Eliminar': true
      };
    }

    return this.userPermissions?.[module] || {};
  }

  /**
   * Verificar múltiples permisos a la vez
   * @param {Array} permissionChecks - Array de objetos {module, action}
   * @returns {boolean} True si tiene todos los permisos
   */
  hasAllPermissions(permissionChecks) {
    return permissionChecks.every(({ module, action }) => 
      this.hasPermission(module, action)
    );
  }

  /**
   * Verificar si tiene al menos uno de los permisos
   * @param {Array} permissionChecks - Array de objetos {module, action}
   * @returns {boolean} True si tiene al menos uno de los permisos
   */
  hasAnyPermission(permissionChecks) {
    return permissionChecks.some(({ module, action }) => 
      this.hasPermission(module, action)
    );
  }

  /**
   * Limpiar permisos (logout)
   */
  clearPermissions() {
    this.userPermissions = null;
    this.userRole = null;
  }

  /**
   * Obtener información de debug de permisos
   * @returns {Object}
   */
  getDebugInfo() {
    return {
      userRole: this.userRole,
      userPermissions: this.userPermissions,
      accessibleModules: this.getAccessibleModules()
    };
  }
}

// Crear instancia singleton
const permissionsService = new PermissionsService();

export default permissionsService;