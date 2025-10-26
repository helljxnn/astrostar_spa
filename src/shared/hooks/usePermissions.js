import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import permissionsService from '../services/permissionsService';
import { generateAdminPermissions } from '../constants/modulePermissions';

/**
 * Hook para gestionar permisos en componentes React
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Manejar diferentes estructuras de usuario
      let userPermissions = {};
      let userRole = user.role?.name || user.rol || user.role;

      // Si es admin, dar todos los permisos usando función centralizada
      if (userRole === 'admin') {
        userPermissions = generateAdminPermissions();
        console.log('🔐 Admin permissions loaded:', Object.keys(userPermissions).length, 'modules');
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
    loading,
    hasPermission,
    hasModuleAccess,
    getAccessibleModules,
    getModulePermissions,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin: user?.role?.name === 'admin' || user?.rol === 'admin' || user?.role === 'admin'
  };
};