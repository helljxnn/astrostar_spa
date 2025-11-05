import { useAuth } from "../contexts/authContext";

/**
 * Hook para gestionar permisos en componentes React.
 * Este hook es una capa delgada sobre useAuth para proporcionar
 * funciones de ayuda para la verificación de permisos.
 */
export const usePermissions = () => {
  // Obtenemos los datos directamente del contexto, que es nuestra única fuente de verdad.
  const { userRole, userPermissions } = useAuth();
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Manejar diferentes estructuras de usuario
      let userPermissions = {};
      let userRole = user.role?.name || user.rol || user.role;

      // Si es admin, dar todos los permisos usando función centralizada
      if (userRole === 'admin' || userRole === 'Administrador') {
        userPermissions = generateAdminPermissions();
      } else {
        // Para otros roles, usar los permisos del role si existen
        userPermissions = user.role?.permissions || {};
      }

      permissionsService.setUserPermissions(user, userPermissions);
      setPermissions(userPermissions);
      setLoading(false);
    } else {
      // Limpiar permisos si no está autenticado
      permissionsService.clearPermissions();
      setPermissions(null);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

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
    getAccessibleModules,
    getModulePermissions,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin: user?.role?.name === 'admin' || user?.rol === 'admin' || user?.role === 'admin' || user?.role?.name === 'Administrador'
  };
};
