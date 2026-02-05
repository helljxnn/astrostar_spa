import {
  ALL_MODULES,
  AVAILABLE_ACTIONS,
  generateAdminPermissions,
} from "./moduleConfig";

// Re-exportar desde moduleConfig para mantener compatibilidad
export { ALL_MODULES, generateAdminPermissions };

// Todas las acciones disponibles
export const ALL_ACTIONS = AVAILABLE_ACTIONS;

/**
 * Genera permisos vacíos para un nuevo rol
 * @returns {Object} Objeto con todos los permisos en false
 */
export const generateEmptyPermissions = () => {
  const emptyPermissions = {};

  ALL_MODULES.forEach((module) => {
    emptyPermissions[module] = {};
    ALL_ACTIONS.forEach((action) => {
      emptyPermissions[module][action] = false;
    });
  });

  return emptyPermissions;
};

/**
 * Valida que un objeto de permisos tenga la estructura correcta
 * @param {Object} permissions - Permisos a validar
 * @returns {boolean} True si la estructura es válida
 */
export const validatePermissionsStructure = (permissions) => {
  if (!permissions || typeof permissions !== "object") {
    return false;
  }

  // Verificar que todos los módulos estén presentes
  for (const module of ALL_MODULES) {
    if (!permissions[module] || typeof permissions[module] !== "object") {
      return false;
    }

    // Verificar que todas las acciones estén presentes
    for (const action of ALL_ACTIONS) {
      if (typeof permissions[module][action] !== "boolean") {
        return false;
      }
    }
  }

  return true;
};

/**
 * Completa permisos faltantes con valores por defecto
 * @param {Object} permissions - Permisos existentes
 * @param {boolean} defaultValue - Valor por defecto para permisos faltantes
 * @returns {Object} Permisos completos
 */
export const completePermissions = (permissions = {}, defaultValue = false) => {
  const completePerms = { ...permissions };

  ALL_MODULES.forEach((module) => {
    if (!completePerms[module]) {
      completePerms[module] = {};
    }

    ALL_ACTIONS.forEach((action) => {
      if (typeof completePerms[module][action] !== "boolean") {
        completePerms[module][action] = defaultValue;
      }
    });
  });

  return completePerms;
};
