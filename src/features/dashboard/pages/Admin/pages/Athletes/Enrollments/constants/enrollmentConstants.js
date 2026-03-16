/**
 * Constantes para el módulo de matrículas
 * Centraliza valores y configuraciones para mejor mantenibilidad
 */

// Estados de matrícula del backend (simplificados a 3)
export const ENROLLMENT_STATUS = {
  PENDING_PAYMENT: 'Pending_Payment',
  VIGENTE: 'Vigente', 
  VENCIDA: 'Vencida'
};

// Mapeo de estados para mostrar al usuario
export const ENROLLMENT_STATUS_LABELS = {
  [ENROLLMENT_STATUS.PENDING_PAYMENT]: 'Pendiente de Pago',
  [ENROLLMENT_STATUS.VIGENTE]: 'Vigente',
  [ENROLLMENT_STATUS.VENCIDA]: 'Vencida'
};

// Colores para los badges de estado
export const ENROLLMENT_STATUS_COLORS = {
  [ENROLLMENT_STATUS.PENDING_PAYMENT]: 'bg-yellow-100 text-yellow-800',
  [ENROLLMENT_STATUS.VIGENTE]: 'bg-green-100 text-green-800',
  [ENROLLMENT_STATUS.VENCIDA]: 'bg-red-100 text-red-800'
};

// Columnas de la tabla de matrículas (sin fecha de matrícula)
export const ENROLLMENT_TABLE_COLUMNS = [
  "Nombre Completo",
  "Número de Documento", 
  "Fecha de activación",
  "Estado Matrícula",
  "Fecha Vencimiento"
];

// Propiedades de datos para la tabla (sin fecha de matrícula)
export const ENROLLMENT_DATA_PROPERTIES = [
  "nombreCompleto",
  "numeroDocumento",
  "fechaActivacion", 
  "estadoMatricula",
  "fechaVencimiento"
];

// Mensajes por defecto
export const DEFAULT_MESSAGES = {
  NO_NAME: "Sin nombre",
  NO_DOCUMENT: "Sin documento", 
  NO_DATE: "N/A",
  PENDING_ACTIVATION: "Pendiente de activación",
  NO_ENROLLMENT: "Sin matrícula"
};

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 400, // ms
  MIN_SEARCH_LENGTH: 2,
  PLACEHOLDER_ENROLLMENTS: "Buscar por nombre o documento...",
  PLACEHOLDER_INSCRIPTIONS: "Buscar inscripción..."
};

// Configuración de vencimientos
export const EXPIRATION_CONFIG = {
  CRITICAL_DAYS: 7,     // Días para considerar crítico
  WARNING_DAYS: 15,     // Días para mostrar advertencia
  ATTENTION_DAYS: 30,   // Días para mostrar atención
  REFRESH_INTERVAL: 60000 // Intervalo de actualización en ms
};

// Filtros de vencimiento
export const EXPIRATION_FILTERS = {
  ALL: 'all',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  CRITICAL: 'critical'
};
