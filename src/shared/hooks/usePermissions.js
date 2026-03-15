import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/authContext";
import permissionsService from "../services/permissionsService";
import { generateAdminPermissions } from "../constants/modulePermissions";
import apiClient from "../services/apiClient";

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
      // Obtener los permisos actualizados del servidor SIN mostrar loader
      const response = await apiClient.getWithoutLoader("/auth/me");

      if (response.success && response.data) {
        const updatedUser = response.data;
        let userPermissions = {};
        let userRole =
          updatedUser.role?.name || updatedUser.rol || updatedUser.role;

        // Si es admin, dar todos los permisos
        if (userRole === "admin" || userRole === "Administrador" || userRole === "Administrador Sistema") {
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
      // Si el error es 403 (token expirado/inválido), el apiClient ya intentará refrescar
      // Si falla el refresh, redirigirá al login automáticamente
      // Solo logueamos errores que no sean de autenticación
      if (
        !error.message?.includes("Token") &&
        !error.message?.includes("401") &&
        !error.message?.includes("403")
      ) {
        console.error("Error al refrescar permisos:", error);
      }
    }
  }, [isAuthenticated, user, updateUser]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Manejar diferentes estructuras de usuario
      let userPermissions = {};
      let userRole = user.role?.name || user.rol || user.role;

      // Si es admin, dar todos los permisos usando función centralizada
      if (userRole === "admin" || userRole === "Administrador" || userRole === "Administrador Sistema") {
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

  // DESACTIVADO: Refrescar permisos periódicamente
  // Los permisos no cambian frecuentemente, solo se refrescan:
  // 1. Al iniciar sesión
  // 2. Al recargar la página
  // 3. Manualmente llamando a refreshPermissions()
  // Si necesitas refrescar permisos automáticamente, considera usar WebSockets
  // o aumentar el intervalo a 5-10 minutos

  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //
  //   const interval = setInterval(() => {
  //     refreshPermissions();
  //   }, 30000); // 30 segundos
  //
  //   return () => clearInterval(interval);
  // }, [isAuthenticated, refreshPermissions]);

  /**
   * Verificar si tiene un permiso específico
   */
  const hasPermission = useCallback(
    (module, action) => permissionsService.hasPermission(module, action),
    [permissions],
  );

  /**
   * Verificar si tiene acceso a un módulo
   */
  const hasModuleAccess = useCallback(
    (module) => permissionsService.hasModuleAccess(module),
    [permissions],
  );

  /**
   * Obtener módulos accesibles
   */
  const getAccessibleModules = useCallback(
    () => permissionsService.getAccessibleModules(),
    [permissions],
  );

  /**
   * Obtener permisos de un módulo específico
   */
  const getModulePermissions = useCallback(
    (module) => permissionsService.getModulePermissions(module),
    [permissions],
  );

  /**
   * Verificar múltiples permisos
   */
  const hasAllPermissions = useCallback(
    (permissionChecks) =>
      permissionsService.hasAllPermissions(permissionChecks),
    [permissions],
  );

  /**
   * Verificar si tiene al menos uno de los permisos
   */
  const hasAnyPermission = useCallback(
    (permissionChecks) => permissionsService.hasAnyPermission(permissionChecks),
    [permissions],
  );

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
    isAdmin:
      user?.role?.name === "admin" ||
      user?.rol === "admin" ||
      user?.role === "admin" ||
      user?.role?.name === "Administrador" ||
      user?.role?.name === "Administrador Sistema" ||
      user?.rol === "Administrador" ||
      user?.rol === "Administrador Sistema",
  };
};
