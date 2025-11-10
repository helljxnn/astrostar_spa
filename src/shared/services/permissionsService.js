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
    // Hacemos la extracción del rol más segura para evitar errores.
    this.userRole = user?.role?.name || user?.rol || user?.role || null;
    // Asignamos los permisos que ya vienen procesados desde el hook.
    this.userPermissions = permissions || {};
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} module - Módulo (ej: 'users', 'roles', 'dashboard')
   * @param {string} action - Acción (ej: 'Ver', 'Crear', 'Editar', 'Eliminar')
   * @returns {boolean}
   */
  hasPermission(module, action) {
    // Si es admin, permitir todo
    if (this.userRole === "Administrador" || this.userRole === "Admin") {
      return true;
    }

    // 1. CORRECCIÓN: Si los permisos no han cargado, retorna false inmediatamente.
    // Y usamos la sintaxis de corchetes `[module]` para acceder a la propiedad dinámicamente.
    if (!this.userPermissions || !this.userPermissions[module]) {
      return false;
    }

    // 2. CORRECCIÓN: Usamos .includes() porque tus permisos son un array de strings.
    return this.userPermissions[module].includes(action);
  }

  /**
   * Verificar si el usuario tiene acceso a un módulo (cualquier acción)
   * @param {string} module - Módulo a verificar
   * @returns {boolean}
   */
  hasModuleAccess(module) {
    // Si es admin, permitir todo
    if (this.userRole === "Administrador" || this.userRole === "Admin") {
      return true;
    }

    // 3. CORRECCIÓN: Misma corrección de sintaxis y de tiempo que en hasPermission.
    if (!this.userPermissions || !this.userPermissions[module]) {
      return false;
    }

    // 4. CORRECCIÓN: Verificamos si el array de permisos para el módulo tiene al menos un elemento.
    return this.userPermissions[module].length > 0;
  }

  /**
   * Obtener todos los módulos a los que tiene acceso
   * @returns {Array} Array de módulos
   */
  getAccessibleModules() {
    if (this.userRole === "Administrador" || this.userRole === "Admin") {
      return ALL_MODULES;
    }

    if (!this.userPermissions) {
      return [];
    }

    return Object.keys(this.userPermissions).filter((module) => {
      // 5. CORRECCIÓN: Usamos la sintaxis correcta aquí también.
      return (
        this.userPermissions[module] && this.userPermissions[module].length > 0
      );
    });
  }

  /**
   * Obtener permisos específicos de un módulo
   * @param {string} module - Módulo
   * @returns {Object} Permisos del módulo
   */
  getModulePermissions(module) {
    if (this.userRole === "Admin" || this.userRole === "Administrador") {
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
      accessibleModules: this.getAccessibleModules(),
    };
  }
}

// Crear instancia singleton
const permissionsService = new PermissionsService();

export default permissionsService;
