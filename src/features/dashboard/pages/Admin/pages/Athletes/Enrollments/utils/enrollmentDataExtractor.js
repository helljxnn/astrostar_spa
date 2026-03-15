/**
 * Utilidades para extraer y normalizar datos de matrículas
 * Siguiendo las mejores prácticas de escalabilidad y mantenibilidad
 */

import { 
  ENROLLMENT_STATUS_LABELS, 
  ENROLLMENT_STATUS,
  DEFAULT_MESSAGES 
} from '../constants/enrollmentConstants.js';

/**
 * Extrae el nombre completo de un atleta desde diferentes fuentes de datos
 * @param {Object} athlete - Datos del atleta
 * @param {Object} user - Datos del usuario asociado
 * @param {Object} row - Datos de la fila (fallback)
 * @returns {string} Nombre completo formateado
 */
export const extractFullName = (athlete = {}, user = {}, row = {}) => {
  const firstName = 
    athlete.firstName ||
    athlete.nombres ||
    user.firstName ||
    user.nombres ||
    row.firstName ||
    "";

  const lastName = 
    athlete.lastName ||
    athlete.apellidos ||
    user.lastName ||
    user.apellidos ||
    row.lastName ||
    "";

  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || DEFAULT_MESSAGES.NO_NAME;
};

/**
 * Extrae el número de documento desde diferentes fuentes de datos
 * @param {Object} athlete - Datos del atleta
 * @param {Object} user - Datos del usuario asociado
 * @param {Object} row - Datos de la fila (fallback)
 * @returns {string} Número de documento
 */
export const extractIdentification = (athlete = {}, user = {}, row = {}) => {
  const identification = (
    user.identification ||
    athlete.identification ||
    athlete.numeroDocumento ||
    row.identification ||
    ""
  );
  
  return identification || DEFAULT_MESSAGES.NO_DOCUMENT;
};

/**
 * Extrae la fecha de inicio de vigencia de la matrícula
 * @param {Object} enrollment - Datos de la matrícula
 * @returns {string} Fecha de inicio formateada o mensaje apropiado
 */
export const extractActivationDate = (enrollment = {}) => {
  const rawDate = enrollment.fechaInicio;

  if (!rawDate) {
    // Si no hay fecha de inicio, significa que aún no se ha activado
    return "No activada";
  }

  try {
    const fecha = new Date(rawDate);
    return !isNaN(fecha.getTime()) 
      ? fecha.toLocaleDateString("es-ES")
      : DEFAULT_MESSAGES.NO_DATE;
  } catch {
    return DEFAULT_MESSAGES.NO_DATE;
  }
};

/**
 * Extrae la fecha de matrícula desde diferentes fuentes
 * @param {Object} enrollment - Datos de la matrícula
 * @param {Object} row - Datos de la fila (fallback)
 * @returns {string} Fecha formateada o "N/A"
 */
export const extractCreationDate = (enrollment = {}, row = {}) => {
  const rawDate = 
    enrollment.fechaMatricula ||
    enrollment.enrollmentDate ||
    enrollment.fechaInscripcion ||
    enrollment.createdAt ||
    row.fechaMatricula ||
    row.createdAt;

  if (!rawDate) return DEFAULT_MESSAGES.NO_DATE;

  try {
    const fecha = new Date(rawDate);
    return !isNaN(fecha.getTime()) 
      ? fecha.toLocaleDateString("es-ES")
      : DEFAULT_MESSAGES.NO_DATE;
  } catch {
    return DEFAULT_MESSAGES.NO_DATE;
  }
};

/**
 * Extrae y formatea la fecha de vencimiento
 * @param {Object} enrollment - Datos de la matrícula
 * @param {string} enrollmentStatus - Estado de la matrícula
 * @returns {string} Fecha de vencimiento formateada
 */
export const extractExpirationDate = (enrollment = {}, enrollmentStatus = "") => {
  // Si está pendiente de pago, mostrar mensaje específico
  if (enrollmentStatus === ENROLLMENT_STATUS.PENDING_PAYMENT) {
    return DEFAULT_MESSAGES.PENDING_ACTIVATION;
  }

  const rawDate = 
    enrollment.fechaVencimiento ||
    enrollment.expirationDate;

  if (!rawDate) return DEFAULT_MESSAGES.NO_DATE;

  try {
    const fecha = new Date(rawDate);
    return !isNaN(fecha.getTime()) 
      ? fecha.toLocaleDateString("es-ES")
      : DEFAULT_MESSAGES.NO_DATE;
  } catch {
    return DEFAULT_MESSAGES.NO_DATE;
  }
};

/**
 * Mapea estados del backend al frontend con etiquetas amigables
 * @param {string} backendStatus - Estado desde el backend
 * @returns {string} Estado mapeado para mostrar al usuario
 */
export const mapEnrollmentStatus = (backendStatus = "") => {
  return ENROLLMENT_STATUS_LABELS[backendStatus] || backendStatus || DEFAULT_MESSAGES.NO_ENROLLMENT;
};

/**
 * Verifica si una matrícula está vencida basándose en la fecha de vencimiento
 * @param {Object} enrollment - Datos de la matrícula
 * @returns {boolean} true si está vencida, false en caso contrario
 */
export const isEnrollmentExpired = (enrollment = {}) => {
  const expirationDate = 
    enrollment.fechaVencimiento ||
    enrollment.expirationDate;

  if (!expirationDate) return false;

  try {
    const fechaVenc = new Date(expirationDate);
    const hoy = new Date();
    return fechaVenc < hoy;
  } catch {
    return false;
  }
};