/**
 * Configuración de rendimiento para optimizar la aplicación
 */

export const PERFORMANCE_CONFIG = {
  // Configuración de debounce para búsquedas
  SEARCH_DEBOUNCE: {
    ATHLETES: 300, // ms - Deportistas
    ENROLLMENTS: 500, // ms - Matrículas (más lento por ser más complejo)
    GUARDIANS: 400, // ms - Acudientes
    GENERAL: 300, // ms - Búsqueda general
  },

  // Configuración de paginación optimizada
  PAGINATION: {
    ATHLETES_PAGE_SIZE: 10,
    ENROLLMENTS_PAGE_SIZE: 10,
    GUARDIANS_PAGE_SIZE: 20, // Menos acudientes por página
    MAX_ITEMS_MOBILE: 5, // Máximo en móvil
  },

  // Configuración de auto-refresh
  AUTO_REFRESH: {
    INSCRIPTIONS: 60000, // 60 segundos para inscripciones
    PAYMENTS: 30000, // 30 segundos para pagos
    GENERAL: 120000, // 2 minutos para datos generales
  },

  // Configuración de carga de datos
  DATA_LOADING: {
    GUARDIANS_LIMIT: 20, // Límite inicial de acudientes
    SEARCH_MIN_LENGTH: 2, // Mínimo caracteres para búsqueda
    SILENT_OPERATIONS: true, // Operaciones silenciosas cuando sea posible
  },

  // Configuración de loaders
  LOADER: {
    SKIP_FOR_VALIDATIONS: true, // No mostrar loader en validaciones
    SKIP_FOR_SEARCHES: false, // Mostrar loader en búsquedas
    SKIP_FOR_SILENT: true, // No mostrar en operaciones silenciosas
  },

  // Configuración de caché
  CACHE: {
    REFERENCE_DATA_TTL: 300000, // 5 minutos para datos de referencia
    SEARCH_RESULTS_TTL: 60000, // 1 minuto para resultados de búsqueda
  }
};

// Utilidades de rendimiento
export const performanceUtils = {
  /**
   * Crear debounce optimizado
   */
  createDebounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  /**
   * Verificar si debe mostrar loader
   */
  shouldShowLoader: (operation, silent = false) => {
    if (silent && PERFORMANCE_CONFIG.LOADER.SKIP_FOR_SILENT) return false;
    if (operation === 'validation' && PERFORMANCE_CONFIG.LOADER.SKIP_FOR_VALIDATIONS) return false;
    if (operation === 'search' && PERFORMANCE_CONFIG.LOADER.SKIP_FOR_SEARCHES) return false;
    return true;
  },

  /**
   * Obtener configuración de paginación por módulo
   */
  getPaginationConfig: (module) => {
    const key = `${module.toUpperCase()}_PAGE_SIZE`;
    return PERFORMANCE_CONFIG.PAGINATION[key] || PERFORMANCE_CONFIG.PAGINATION.ATHLETES_PAGE_SIZE;
  },

  /**
   * Obtener configuración de debounce por módulo
   */
  getDebounceConfig: (module) => {
    const key = module.toUpperCase();
    return PERFORMANCE_CONFIG.SEARCH_DEBOUNCE[key] || PERFORMANCE_CONFIG.SEARCH_DEBOUNCE.GENERAL;
  }
};
