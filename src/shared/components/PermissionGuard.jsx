import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Componente para Controlar la visibilidad de elementos según los permisos del usuario actual.
 */
const PermissionGuard = ({ 
  children, 
  module, 
  action, 
  fallback = null,
  requireAll = true // Si es true, requiere todos los permisos. Si es false, requiere al menos uno
}) => {
  const { hasPermission, hasModuleAccess, isAdmin } = usePermissions();

  // Si es admin, mostrar siempre
  if (isAdmin) {
    return children;
  }

  // Si se especifica módulo y acción
  if (module && action) {
    // Si es un array de permisos
    if (Array.isArray(module) && Array.isArray(action)) {
      const permissionChecks = module.map((mod, index) => ({
        module: mod,
        action: action[index] || action[0]
      }));

      const hasPermissions = requireAll 
        ? permissionChecks.every(({ module: mod, action: act }) => hasPermission(mod, act))
        : permissionChecks.some(({ module: mod, action: act }) => hasPermission(mod, act));

      return hasPermissions ? children : fallback;
    }

    // Permiso individual
    return hasPermission(module, action) ? children : fallback;
  }

  // Si solo se especifica módulo (acceso general)
  if (module) {
    // Si es un array de módulos
    if (Array.isArray(module)) {
      const hasAccess = requireAll
        ? module.every(mod => hasModuleAccess(mod))
        : module.some(mod => hasModuleAccess(mod));

      return hasAccess ? children : fallback;
    }

    // Módulo individual
    return hasModuleAccess(module) ? children : fallback;
  }

  // Si no se especifican permisos, mostrar por defecto
  return children;
};

/**
 * Hook para usar PermissionGuard de forma condicional
 */
export const usePermissionGuard = (module, action) => {
  const { hasPermission, hasModuleAccess, isAdmin } = usePermissions();

  if (isAdmin) return true;

  if (module && action) {
    return hasPermission(module, action);
  }

  if (module) {
    return hasModuleAccess(module);
  }

  return true;
};

export default PermissionGuard;