import { useMemo } from "react";
import { usePermissions } from "./usePermissions";
import { useAuth } from "../contexts/authContext";
import {
  MODULE_CONFIG,
  MODULE_GROUPS,
  getChildModules,
} from "../constants/moduleConfig";

/**
 * Hook mejorado para determinar qué módulos son visibles en el sidebar
 * Usa la configuración centralizada y es completamente escalable
 */
export const useSidebarVisibility = () => {
  const { hasModuleAccess, isAdmin } = usePermissions();
  const { user, userRole } = useAuth();

  // Normalizar el rol del usuario
  const normalizedRole = useMemo(() => {
    return (user?.role?.name || user?.rol || userRole || "").toString().toLowerCase();
  }, [user, userRole]);

  const isAthleteOrGuardian = useMemo(() => {
    return normalizedRole === "deportista" || normalizedRole === "athlete" || normalizedRole === "acudiente" || normalizedRole === "guardian";
  }, [normalizedRole]);

  /**
   * Calcula qué módulos individuales son visibles
   */
  const visibleModules = useMemo(() => {
    const visible = {};

    // Iterar sobre todos los módulos configurados
    Object.keys(MODULE_CONFIG).forEach((moduleId) => {
      // Excepción: Deportistas y acudientes siempre ven Gestión de Citas
      if (moduleId === "appointmentManagement" && isAthleteOrGuardian) {
        visible[moduleId] = true;
      }
      // Excepción: "Mis Pagos" solo para deportistas y acudientes
      else if (moduleId === "myPayments") {
        visible[moduleId] = isAthleteOrGuardian;
      }
      // Excepción: "Gestión de Pagos" NO para deportistas y acudientes
      else if (moduleId === "paymentsManagement") {
        visible[moduleId] = !isAthleteOrGuardian && (isAdmin || hasModuleAccess(moduleId));
      }
      else {
        visible[moduleId] = isAdmin || hasModuleAccess(moduleId);
      }
    });

    return visible;
  }, [hasModuleAccess, isAdmin, isAthleteOrGuardian]);

  /**
   * Calcula qué grupos de módulos son visibles
   * Un grupo es visible si al menos uno de sus hijos es visible
   */
  const visibleGroups = useMemo(() => {
    const visible = {};

    Object.keys(MODULE_GROUPS).forEach((groupId) => {
      const childModules = getChildModules(groupId);
      visible[groupId] = childModules.some(
        (childId) => visibleModules[childId],
      );
    });

    return visible;
  }, [visibleModules]);

  /**
   * Obtiene los módulos visibles de un grupo específico
   */
  const getVisibleChildModules = (groupId) => {
    const childModules = getChildModules(groupId);
    return childModules.filter((childId) => visibleModules[childId]);
  };

  /**
   * Verifica si un módulo específico debe ser visible
   */
  const isModuleVisible = (moduleId) => {
    return visibleModules[moduleId] || false;
  };

  /**
   * Verifica si un grupo específico debe ser visible
   */
  const isGroupVisible = (groupId) => {
    return visibleGroups[groupId] || false;
  };

  /**
   * Obtiene la configuración de un módulo si es visible
   */
  const getVisibleModuleConfig = (moduleId) => {
    if (!visibleModules[moduleId]) return null;
    return MODULE_CONFIG[moduleId];
  };

  /**
   * Obtiene todos los módulos visibles con su configuración
   */
  const getAllVisibleModules = () => {
    return Object.keys(visibleModules)
      .filter((moduleId) => visibleModules[moduleId])
      .map((moduleId) => ({
        id: moduleId,
        ...MODULE_CONFIG[moduleId],
      }));
  };

  return {
    visibleModules,
    visibleGroups,
    isModuleVisible,
    isGroupVisible,
    getVisibleChildModules,
    getVisibleModuleConfig,
    getAllVisibleModules,
  };
};
