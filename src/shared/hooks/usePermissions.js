import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/authContext";
import permissionsService from "../services/permissionsService";
import { generateAdminPermissions } from "../constants/modulePermissions";
import apiClient from "../services/apiClient";

/**
 * Hook para gestionar permisos en componentes React
 */
export const usePermissions = () => {
  const PERMISSIONS_CACHE_KEY = "lastKnownPermissionsByUser";
  const { user, isAuthenticated, updateUser } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const hydrationAttemptRef = useRef("");

  const getUserIdentity = useCallback((targetUser) => {
    return String(
      targetUser?.id ||
        targetUser?.email ||
        targetUser?.documentNumber ||
        "unknown",
    );
  }, []);

  const getCachedPermissions = useCallback((targetUser) => {
    const userIdentity = getUserIdentity(targetUser);
    if (userIdentity === "unknown") return {};

    try {
      const raw = localStorage.getItem(PERMISSIONS_CACHE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      const scopedPermissions = parsed[userIdentity];
      return scopedPermissions && typeof scopedPermissions === "object"
        ? scopedPermissions
        : {};
    } catch {
      return {};
    }
  }, [getUserIdentity]);

  const saveCachedPermissions = useCallback((nextPermissions, targetUser) => {
    const safePermissions =
      nextPermissions && typeof nextPermissions === "object"
        ? nextPermissions
        : {};
    const userIdentity = getUserIdentity(targetUser);

    if (userIdentity === "unknown") return;

    if (Object.keys(safePermissions).length > 0) {
      try {
        const raw = localStorage.getItem(PERMISSIONS_CACHE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        const nextCache =
          parsed && typeof parsed === "object" ? { ...parsed } : {};
        nextCache[userIdentity] = safePermissions;
        localStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(nextCache));
      } catch {
        // Ignore cache write errors and keep runtime permissions in memory.
      }
    }
  }, [getUserIdentity]);

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
        const fallbackPermissions =
          user?.role?.permissions ||
          user?.permissions ||
          getCachedPermissions(updatedUser);

        // Si es admin, dar todos los permisos
        if (userRole === "admin" || userRole === "Administrador" || userRole === "Administrador Sistema") {
          userPermissions = generateAdminPermissions();
        } else {
          userPermissions =
            updatedUser.role?.permissions ||
            updatedUser.permissions ||
            fallbackPermissions;
        }

        // Actualizar permisos en el servicio y estado
        permissionsService.setUserPermissions(updatedUser, userPermissions);
        setPermissions(userPermissions);
        saveCachedPermissions(userPermissions, updatedUser);

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
  }, [
    getCachedPermissions,
    isAuthenticated,
    saveCachedPermissions,
    updateUser,
    user,
  ]);

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
        userPermissions =
          user.role?.permissions ||
          user.permissions ||
          getCachedPermissions(user);
      }

      const permissionsCount = Object.keys(userPermissions || {}).length;
      const userIdentity = String(
        user?.id || user?.email || user?.documentNumber || "unknown",
      );

      // Si llegan vacíos en una recarga, intentamos hidratar desde /auth/me una sola vez.
      if (
        permissionsCount === 0 &&
        hydrationAttemptRef.current !== userIdentity
      ) {
        hydrationAttemptRef.current = userIdentity;
        setLoading(true);
        refreshPermissions().finally(() => {
          setLoading(false);
        });
        return;
      }

      permissionsService.setUserPermissions(user, userPermissions);
      setPermissions(userPermissions);
      saveCachedPermissions(userPermissions, user);
      setLoading(false);
    } else {
      // Limpiar permisos si no está autenticado
      hydrationAttemptRef.current = "";
      permissionsService.clearPermissions();
      setPermissions(null);
      setLoading(false);
    }
  }, [
    getCachedPermissions,
    isAuthenticated,
    refreshPermissions,
    saveCachedPermissions,
    user,
  ]);

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
