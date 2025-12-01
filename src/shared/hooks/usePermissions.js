import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import permissionsService from '../services/permissionsService';
import { generateAdminPermissions } from '../constants/modulePermissions';
import apiClient from '../services/apiClient';

/**
 * Hook para gestionar permisos en componentes React
 */
export const usePermissions = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Refrescar permisos desde el servidor
   */
  const refreshPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Obtener los permisos actualizados del servidor
      const response = await apiClient.get('/auth/me');
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        let userPermissions = {};
        let userRole = updatedUser.role?.name || updatedUser.rol || updatedUser.role;

        // Si es admin, dar todos los permisos
        if (userRole === 'admin' || userRole === 'Administrador') {
          userPermissions = generateAdminPermissions();
        } else {
          userPermissions = updatedUser.role?.permissions || {};
        }

        // Actualizar permisos en el servicio y estado
        permissionsService.setUserPermissions(updatedUser, userPermissions);
        setPermissions(userPermissions);
        
        // Actualizar el usuario en el contexto de autenticación
        if (updateUser) {
          updateUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error al refrescar permisos:', error);
    }
  }, [isAuthenticated, user, updateUser]);

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

  // Refrescar permisos periódicamente (cada 30 segundos)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshPermissions();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshPermissions]);

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
    refreshPermissions,
    isAdmin: user?.role?.name === 'admin' || user?.rol === 'admin' || user?.role === 'admin' || user?.role?.name === 'Administrador'
  };
};