/**
 * Constantes del Sistema de Pagos
 * Sincronizadas con el backend para mantener consistencia
 */

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE NEGOCIO (Sincronizadas con Backend)
// ══════════════════════════════════════════════════════════════════════════════

export const BUSINESS_CONSTANTS = {
  // ✅ SISTEMA EMPRESARIAL ESTÁNDAR (OPCIÓN A)
  
  // Mora diaria por mensualidad (sin días de gracia)
  LATE_FEE_DAILY: 2000,
  
  // Días máximos de mora para bloqueo de acceso
  MAX_LATE_DAYS_MONTHLY: 15,
  
  // Días de gracia: se reflejan en la fecha dueEnd enviada por backend
  
  // ✅ Límite máximo de días de mora (90 días)
  // Protege a atletas de deudas desproporcionadas
  MAX_LATE_DAYS_CAP: 90,
  
  // Mora máxima posible (90 días × $2,000)
  MAX_LATE_FEE: 90 * 2000, // $180,000
};

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS DE OBLIGACIONES
// ══════════════════════════════════════════════════════════════════════════════

export const OBLIGATION_TYPES = {
  MONTHLY: 'MONTHLY',
  ENROLLMENT_INITIAL: 'ENROLLMENT_INITIAL',
  ENROLLMENT_RENEWAL: 'ENROLLMENT_RENEWAL',
};

export const OBLIGATION_TYPE_LABELS = {
  [OBLIGATION_TYPES.MONTHLY]: 'Mensualidad',
  [OBLIGATION_TYPES.ENROLLMENT_INITIAL]: 'Matrícula Inicial',
  [OBLIGATION_TYPES.ENROLLMENT_RENEWAL]: 'Renovación Matrícula',
};

// ══════════════════════════════════════════════════════════════════════════════
// ESTADOS DE PAGO
// ══════════════════════════════════════════════════════════════════════════════

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pendiente',
  [PAYMENT_STATUS.APPROVED]: 'Aprobado',
  [PAYMENT_STATUS.REJECTED]: 'Rechazado',
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [PAYMENT_STATUS.APPROVED]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [PAYMENT_STATUS.REJECTED]: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// PRIORIDADES DE BLOQUEO (Sincronizadas con Backend)
// ══════════════════════════════════════════════════════════════════════════════

export const BLOCKING_PRIORITIES = {
  ENROLLMENT_INITIAL_PENDING: 1,  // Prioridad más alta
  MATRICULA_VENCIDA: 2,
  ENROLLMENT_RENEWAL_PENDING: 2,
  MORA_MENSUALIDAD: 3,            // Prioridad más baja
};

export const BLOCKING_REASONS = {
  ENROLLMENT_INITIAL_PENDING: 'ENROLLMENT_INITIAL_PENDING',
  MATRICULA_VENCIDA: 'MATRICULA_VENCIDA',
  ENROLLMENT_RENEWAL_PENDING: 'ENROLLMENT_RENEWAL_PENDING',
  MORA_MENSUALIDAD: 'MORA_MENSUALIDAD',
};

export const BLOCKING_MESSAGES = {
  [BLOCKING_REASONS.ENROLLMENT_INITIAL_PENDING]: 'Tu matrícula está pendiente de pago inicial',
  [BLOCKING_REASONS.MATRICULA_VENCIDA]: 'Tu matrícula ha vencido',
  [BLOCKING_REASONS.ENROLLMENT_RENEWAL_PENDING]: 'Tu matrícula necesita renovación',
  [BLOCKING_REASONS.MORA_MENSUALIDAD]: 'Tienes mora acumulada en mensualidades',
};

// ══════════════════════════════════════════════════════════════════════════════
// ESTADOS DE MATRÍCULA
// ══════════════════════════════════════════════════════════════════════════════

export const ENROLLMENT_STATUS = {
  VIGENTE: 'Vigente',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada',
};

// ══════════════════════════════════════════════════════════════════════════════
// ESTADOS DE ATLETA
// ══════════════════════════════════════════════════════════════════════════════

export const ATHLETE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

// ══════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE CÁLCULO
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la mora con límite de 90 días
 * Nota: los días de gracia ya vienen reflejados en dueEnd desde backend
 * REGLA DE NEGOCIO: Mora continua desde vencimiento hasta fecha actual
 * @param {number} lateDays - Días de mora
 * @param {number} dailyFee - Mora diaria (default: 2000)
 * @returns {number} - Mora calculada con límite empresarial
 */
export const calculateLateFee = (lateDays, dailyFee = BUSINESS_CONSTANTS.LATE_FEE_DAILY) => {
  if (lateDays <= 0) return 0;
  
  // ✅ SISTEMA EMPRESARIAL: NO aplicar días de gracia
  // La mora empieza desde el primer día de vencimiento
  
  // ✅ Aplicar límite de 90 días para proteger a atletas
  const cappedLateDays = Math.min(lateDays, BUSINESS_CONSTANTS.MAX_LATE_DAYS_CAP);
  
  return cappedLateDays * dailyFee;
};

/**
 * Calcula días de mora desde vencimiento hasta FECHA ACTUAL
 * Nota: los días de gracia ya vienen reflejados en dueEnd desde backend
 * @param {Date|string} dueDate - Fecha de vencimiento
 * @returns {number} - Días de mora desde vencimiento hasta hoy
 */
export const calculateLateDays = (dueDate) => {
  if (!dueDate) return 0;
  
  // ✅ CRÍTICO: Siempre usar fecha actual (no fecha de subida)
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Verifica si una obligación está suspendida
 * @param {Object} obligation - Obligación de pago
 * @returns {boolean} - True si está suspendida
 */
export const isObligationSuspended = (obligation) => {
  return obligation?.metadata?.suspended === true;
};

/**
 * Obtiene la mora de una obligación considerando suspensión y días de gracia
 * @param {Object} obligation - Obligación de pago
 * @returns {number} - Mora calculada
 */
export const getObligationLateFee = (obligation) => {
  if (!obligation) return 0;
  
  // Si está suspendida, retornar mora congelada
  if (isObligationSuspended(obligation)) {
    return obligation.metadata?.moraAtSuspension || 0;
  }
  
  // Si fue reactivada, calcular mora incremental
  if (obligation.metadata?.reactivatedAt) {
    const reactivatedDate = new Date(obligation.metadata.reactivatedAt);
    const daysSinceReactivation = calculateLateDays(reactivatedDate);
    const moraAtSuspension = obligation.metadata.moraAtSuspension || 0;
    const newMora = calculateLateFee(daysSinceReactivation);
    
    return moraAtSuspension + newMora;
  }
  
  // Cálculo normal con días de gracia aplicados
  const lateDays = calculateLateDays(obligation.dueEnd);
  return calculateLateFee(lateDays);
};

/**
 * Determina el color de la mora según días de atraso
 * @param {number} daysLate - Días de mora
 * @returns {string} - Clase de color Tailwind
 */
export const getLateFeeColorClass = (daysLate) => {
  if (daysLate === 0) return 'text-green-600';
  if (daysLate <= 5) return 'text-yellow-600';
  if (daysLate <= 15) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Obtiene el mensaje de bloqueo de mayor prioridad
 * @param {Array} blockingReasons - Array de razones de bloqueo
 * @returns {Object} - Razón de mayor prioridad
 */
export const getHighestPriorityBlock = (blockingReasons) => {
  if (!blockingReasons || blockingReasons.length === 0) {
    return null;
  }
  
  return blockingReasons.sort((a, b) => {
    const priorityA = BLOCKING_PRIORITIES[a.reason] || 999;
    const priorityB = BLOCKING_PRIORITIES[b.reason] || 999;
    return priorityA - priorityB;
  })[0];
};

