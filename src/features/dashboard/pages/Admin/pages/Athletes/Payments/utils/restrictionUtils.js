/**
 * Utilidades para manejo de restricciones de acceso
 * Centraliza la lógica de prioridades y mensajes de bloqueo
 */

import { 
  BLOCKING_PRIORITIES, 
  BLOCKING_REASONS, 
  BLOCKING_MESSAGES,
  BUSINESS_CONSTANTS 
} from '../constants/paymentConstants.js';

/**
 * Determina todas las restricciones activas de un atleta
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {Array} - Array de restricciones ordenadas por prioridad
 */
export const getActiveRestrictions = (financialStatus, accessStatus) => {
  const restrictions = [];

  if (!financialStatus) return restrictions;

  // 1. Verificar matrícula inicial pendiente
  if (financialStatus.enrollment?.isInitial && !financialStatus.enrollment?.fechaInicio) {
    restrictions.push({
      reason: BLOCKING_REASONS.ENROLLMENT_INITIAL_PENDING,
      priority: BLOCKING_PRIORITIES.ENROLLMENT_INITIAL_PENDING,
      message: BLOCKING_MESSAGES[BLOCKING_REASONS.ENROLLMENT_INITIAL_PENDING],
      severity: 'critical',
      blockType: 'total',
      data: {
        enrollmentId: financialStatus.enrollment?.id,
        amount: financialStatus.enrollment?.amount || 0
      }
    });
  }

  // 2. Verificar matrícula vencida
  if (financialStatus.enrollment?.estado === 'Vencida') {
    restrictions.push({
      reason: BLOCKING_REASONS.MATRICULA_VENCIDA,
      priority: BLOCKING_PRIORITIES.MATRICULA_VENCIDA,
      message: BLOCKING_MESSAGES[BLOCKING_REASONS.MATRICULA_VENCIDA],
      severity: 'critical',
      blockType: 'total',
      data: {
        expirationDate: financialStatus.enrollment?.fechaVencimiento,
        enrollmentId: financialStatus.enrollment?.id
      }
    });
  }

  // 3. Verificar renovación pendiente
  if (financialStatus.enrollment?.needsRenewal && !financialStatus.enrollment?.isInitial) {
    restrictions.push({
      reason: BLOCKING_REASONS.ENROLLMENT_RENEWAL_PENDING,
      priority: BLOCKING_PRIORITIES.ENROLLMENT_RENEWAL_PENDING,
      message: BLOCKING_MESSAGES[BLOCKING_REASONS.ENROLLMENT_RENEWAL_PENDING],
      severity: 'important',
      blockType: 'total',
      data: {
        expirationDate: financialStatus.enrollment?.fechaVencimiento,
        renewalAmount: financialStatus.enrollment?.renewalAmount || 0
      }
    });
  }

  // 4. Verificar mora excesiva (>= 15 días)
  if (financialStatus.totalDebt?.maxDaysLate >= BUSINESS_CONSTANTS.MAX_LATE_DAYS_MONTHLY) {
    restrictions.push({
      reason: BLOCKING_REASONS.MORA_MENSUALIDAD,
      priority: BLOCKING_PRIORITIES.MORA_MENSUALIDAD,
      message: `${BLOCKING_MESSAGES[BLOCKING_REASONS.MORA_MENSUALIDAD]}. Días de retraso: ${financialStatus.totalDebt.maxDaysLate}`,
      severity: 'warning',
      blockType: 'partial',
      data: {
        daysLate: financialStatus.totalDebt.maxDaysLate,
        totalDebt: financialStatus.totalDebt.totalAmount,
        lateFeeAmount: financialStatus.totalDebt.lateFeeAmount,
        obligationsCount: financialStatus.totalDebt.obligationsCount
      }
    });
  }

  // Ordenar por prioridad (menor número = mayor prioridad)
  return restrictions.sort((a, b) => a.priority - b.priority);
};

/**
 * Obtiene la restricción de mayor prioridad
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {Object|null} - Restricción de mayor prioridad o null
 */
export const getHighestPriorityRestriction = (financialStatus, accessStatus) => {
  const restrictions = getActiveRestrictions(financialStatus, accessStatus);
  return restrictions.length > 0 ? restrictions[0] : null;
};

/**
 * Verifica si un atleta tiene acceso completo al sistema
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {boolean} - True si tiene acceso completo
 */
export const hasFullAccess = (financialStatus, accessStatus) => {
  const restrictions = getActiveRestrictions(financialStatus, accessStatus);
  return restrictions.length === 0;
};

/**
 * Verifica si un atleta tiene acceso parcial (solo a pagos)
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {boolean} - True si tiene acceso parcial
 */
export const hasPartialAccess = (financialStatus, accessStatus) => {
  const restrictions = getActiveRestrictions(financialStatus, accessStatus);
  
  // Si no hay restricciones, tiene acceso completo
  if (restrictions.length === 0) return false;
  
  // Si la restricción de mayor prioridad es de tipo 'partial', tiene acceso parcial
  const highestRestriction = restrictions[0];
  return highestRestriction.blockType === 'partial';
};

/**
 * Verifica si un atleta está completamente bloqueado
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {boolean} - True si está completamente bloqueado
 */
export const isCompletelyBlocked = (financialStatus, accessStatus) => {
  const restrictions = getActiveRestrictions(financialStatus, accessStatus);
  
  // Si no hay restricciones, no está bloqueado
  if (restrictions.length === 0) return false;
  
  // Si la restricción de mayor prioridad es de tipo 'total', está completamente bloqueado
  const highestRestriction = restrictions[0];
  return highestRestriction.blockType === 'total';
};

/**
 * Obtiene los módulos permitidos según las restricciones
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {Array} - Array de módulos permitidos
 */
export const getAllowedModules = (financialStatus, accessStatus) => {
  const allModules = ['Perfil', 'Pagos', 'Citas', 'Eventos', 'Inscripciones', 'Materiales'];

  // ✅ Prioridad: si el backend marca restricción por mora, limitar a Perfil + Pagos
  if (accessStatus?.restricted && accessStatus?.reason === 'MONTHLY_OVERDUE') {
    return ['Perfil', 'Pagos'];
  }
  
  if (hasFullAccess(financialStatus, accessStatus)) {
    return allModules;
  }
  
  if (hasPartialAccess(financialStatus, accessStatus)) {
    return ['Perfil', 'Pagos']; // Solo perfil y pagos
  }
  
  if (isCompletelyBlocked(financialStatus, accessStatus)) {
    return ['Pagos']; // Solo pagos para resolver la situación
  }
  
  return ['Perfil']; // Fallback mínimo
};

/**
 * Genera el mensaje de restricción apropiado
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {Object} - Objeto con mensaje y tipo de restricción
 */
export const getRestrictionMessage = (financialStatus, accessStatus) => {
  const highestRestriction = getHighestPriorityRestriction(financialStatus, accessStatus);
  
  if (!highestRestriction) {
    return {
      type: 'none',
      title: 'Acceso Completo',
      message: 'Tienes acceso completo al sistema',
      severity: 'success'
    };
  }
  
  const messageConfig = {
    [BLOCKING_REASONS.ENROLLMENT_INITIAL_PENDING]: {
      type: 'enrollment_initial',
      title: 'Matrícula Inicial Requerida',
      message: 'Completa el pago de tu matrícula inicial para acceder al sistema',
      actionText: 'Pagar Matrícula',
      severity: 'error'
    },
    [BLOCKING_REASONS.MATRICULA_VENCIDA]: {
      type: 'enrollment_expired',
      title: 'Matrícula Vencida',
      message: 'Tu matrícula ha vencido. Renueva tu matrícula para continuar',
      actionText: 'Renovar Matrícula',
      severity: 'error'
    },
    [BLOCKING_REASONS.ENROLLMENT_RENEWAL_PENDING]: {
      type: 'enrollment_renewal',
      title: 'Renovación Pendiente',
      message: 'Tu matrícula necesita renovación para mantener el acceso',
      actionText: 'Renovar Matrícula',
      severity: 'warning'
    },
    [BLOCKING_REASONS.MORA_MENSUALIDAD]: {
      type: 'overdue_payments',
      title: 'Cuenta Bloqueada por Mora',
      message: `Tienes ${highestRestriction.data.daysLate} días de mora. Paga tus deudas para recuperar el acceso completo`,
      actionText: 'Ver Deudas',
      severity: 'warning'
    }
  };
  
  return {
    ...messageConfig[highestRestriction.reason],
    restriction: highestRestriction,
    allowedModules: getAllowedModules(financialStatus, accessStatus)
  };
};

/**
 * Verifica si un módulo específico está permitido
 * @param {string} moduleId - ID del módulo
 * @param {Object} financialStatus - Estado financiero del atleta
 * @param {Object} accessStatus - Estado de acceso del atleta
 * @returns {boolean} - True si el módulo está permitido
 */
export const isModuleAllowed = (moduleId, financialStatus, accessStatus) => {
  const allowedModules = getAllowedModules(financialStatus, accessStatus);
  
  // ✅ ARREGLADO: Mapeo completo de IDs de módulo
  const moduleMap = {
    'profile': 'Perfil',
    'payments': 'Pagos',
    'myPayments': 'Pagos', // ✅ AGREGADO: Mapear myPayments a Pagos
    'appointments': 'Citas',
    'appointmentManagement': 'Citas', // ✅ AGREGADO: Mapear appointmentManagement a Citas
    'events': 'Eventos',
    'inscriptions': 'Inscripciones',
    'materials': 'Materiales'
  };
  
  const moduleName = moduleMap[moduleId] || moduleId;
  
  // ✅ DEBUG: Log para diagnosticar problemas
  
  return allowedModules.includes(moduleName);
};

/**
 * Obtiene el color del badge según la severidad de la restricción
 * @param {string} severity - Severidad de la restricción
 * @returns {Object} - Clases de color para el badge
 */
export const getRestrictionBadgeColors = (severity) => {
  const colors = {
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    important: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: 'text-yellow-500'
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'text-green-500'
    }
  };
  
  return colors[severity] || colors.warning;
};
