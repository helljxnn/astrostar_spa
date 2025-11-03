import { useAuth } from "../contexts/authContext";

/**
 * Hook para gestionar permisos en componentes React.
 * Este hook es una capa delgada sobre useAuth para proporcionar
 * funciones de ayuda para la verificación de permisos.
 */
export const usePermissions = () => {
  // Obtenemos los datos directamente del contexto, que es nuestra única fuente de verdad.
  const { userRole, userPermissions } = useAuth();

  /**
   * Verificar si tiene un permiso específico
   * @param {string} module - El nombre del módulo (ej: 'users').
   * @param {string} action - La acción a verificar (ej: 'Crear').
   * @returns {boolean}
   */
  const hasPermission = (module, action) => {
    // Si es Administrador, siempre tiene permiso.
    if (userRole === "Administrador") return true;
    // Verificamos directamente sobre el objeto de permisos del contexto.
    return userPermissions?.[module]?.[action] === true;
  };

  /**
   * Verificar si tiene acceso a un módulo
   * (es decir, si tiene al menos un permiso 'Ver', 'Crear', 'Editar' o 'Eliminar' en ese módulo).
   * @param {string} module - El nombre del módulo.
   * @returns {boolean}
   */
  const hasModuleAccess = (module) => {
    if (userRole === "Administrador") return true;
    if (!userPermissions || !userPermissions[module]) return false;
    return Object.values(userPermissions[module]).some(
      (permission) => permission === true
    );
  };

  return {
    permissions: userPermissions,
    hasPermission,
    hasModuleAccess,
    isAdmin: userRole === "Administrador",
  };
};
