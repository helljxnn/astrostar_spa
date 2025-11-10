import { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import permissionsService from "../services/permissionsService";

/**
 * Hook para gestionar permisos en componentes React
 */
export const usePermissions = () => {
  // 1. Pide al contexto los valores que ya están calculados.
  const { user, isAuthenticated, userRole, userPermissions } = useAuth();
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // 2. Usa directamente los permisos del contexto.
      // Esto funciona para CUALQUIER rol (admin, entrenador, etc.)
      // porque authContext ya tiene la lógica para obtenerlos.
      const finalPermissions = userPermissions || {};
      // 3. Establece los permisos correctos.
      permissionsService.setUserPermissions(user, finalPermissions);
      setPermissions(finalPermissions);
    } else {
      // Limpiar permisos si no está autenticado
      permissionsService.clearPermissions();
      setPermissions(null);
    }
  }, [user, isAuthenticated, userRole, userPermissions]); // 4. Reacciona a cambios en los datos del contexto.

  /**
   * Verificar si tiene un permiso específico
   */
  const hasPermission = (module, action) => {
    return permissionsService.hasPermission(module, action);
  };

  /**
   * Verificar si tiene acceso a un módulo
   */
  const hasModuleAccess = (module) => {
    return permissionsService.hasModuleAccess(module);
  };

  /**
   * Obtener módulos accesibles
   */
  const getAccessibleModules = () => {
    return permissionsService.getAccessibleModules();
  };

  /**
   * Obtener permisos de un módulo específico
   */
  const getModulePermissions = (module) => {
    return permissionsService.getModulePermissions(module);
  };

  /**
   * Verificar múltiples permisos
   */
  const hasAllPermissions = (permissionChecks) => {
    return permissionsService.hasAllPermissions(permissionChecks);
  };

  /**
   * Verificar si tiene al menos uno de los permisos
   */
  const hasAnyPermission = (permissionChecks) => {
    return permissionsService.hasAnyPermission(permissionChecks);
  };

  return {
    permissions,
    hasPermission,
    hasModuleAccess,
    getAccessibleModules,
    getModulePermissions,
    hasAllPermissions,
    hasAnyPermission,
  };
};
