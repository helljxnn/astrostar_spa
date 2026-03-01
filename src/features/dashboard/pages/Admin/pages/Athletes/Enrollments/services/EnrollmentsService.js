import apiClient from "../../../../../../../../shared/services/apiClient.js";

// ============================================================================
// CONSTANTES
// ============================================================================
const ENROLLMENT_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

const ENDPOINTS = {
  ATHLETES: "/athletes",
  ENROLLMENTS: "/enrollments",
};

const DEFAULT_ENROLLMENT_DURATION_YEARS = 1;

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Calcula la fecha de vencimiento de una matrícula
 * @param {Date} startDate - Fecha de inicio
 * @param {number} years - Años de duración
 * @returns {string} Fecha de vencimiento en formato ISO
 */
const calculateExpirationDate = (startDate = new Date(), years = DEFAULT_ENROLLMENT_DURATION_YEARS) => {
  const expirationDate = new Date(startDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + years);
  return expirationDate.toISOString();
};

/**
 * Prepara los datos de matrícula para enviar al backend
 * @param {Object} athleteData - Datos del atleta
 * @param {number|null} preRegistrationId - ID de pre-inscripción
 * @returns {Object} Datos formateados para el backend
 */
const prepareEnrollmentData = (athleteData, preRegistrationId = null) => {
  const now = new Date();
  
  return {
    athlete: athleteData,
    enrollment: {
      estado: ENROLLMENT_STATUS.ACTIVE,
      fechaMatricula: now.toISOString(),
      fechaInicio: now.toISOString(),
      fechaVencimiento: calculateExpirationDate(now),
    },
    ...(preRegistrationId && { preRegistrationId }),
  };
};

// ============================================================================
// SERVICIO
// ============================================================================

class EnrollmentsService {
  constructor() {
    this.endpoint = ENDPOINTS.ATHLETES;
    this.enrollmentsEndpoint = ENDPOINTS.ENROLLMENTS;
  }

  /**
   * Obtiene todas las deportistas con matrículas
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Resultado con datos y metadata
   */
  async getAll(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.pageSize || 10,
        ...(filters.estadoMatricula && {
          estadoInscripcion: filters.estadoMatricula,
        }),
      };

      const response = await apiClient.get(this.endpoint, { params });

      console.log(
        "📡 [EnrollmentsService.getAll] Respuesta del backend:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      console.log(
        "📡 [EnrollmentsService.getAll] Total de deportistas:",
        data.length
      );

      return {
        success: true,
        data: data,
        total: response.data.total || data.length,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.getAll] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene deportista por ID
   * @param {number} id - ID del atleta
   * @returns {Promise<Object>} Resultado con datos del atleta
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.getById] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crea matrícula (convierte pre-inscripción en deportista matriculada)
   * @param {Object} athleteData - Datos del atleta
   * @param {number|null} preRegistrationId - ID de pre-inscripción
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createEnrollment(athleteData, preRegistrationId = null) {
    try {
      console.log("📤 [EnrollmentsService.createEnrollment] Iniciando...");
      console.log("📤 [EnrollmentsService.createEnrollment] Datos recibidos:", athleteData);
      console.log("📤 [EnrollmentsService.createEnrollment] preRegistrationId:", preRegistrationId);

      // USAR EL ENDPOINT ANTIGUO /api/athletes que SÍ funciona
      // Enviar datos en formato plano con preRegistrationId
      const dataToSend = {
        ...athleteData,
        ...(preRegistrationId && { preRegistrationId }),
      };

      console.log(
        "📤 [EnrollmentsService.createEnrollment] Data final:",
        JSON.stringify(dataToSend, null, 2)
      );

      // Usar el endpoint de athletes (el que funciona actualmente)
      const response = await apiClient.post(this.endpoint, dataToSend);

      console.log("✅ [EnrollmentsService.createEnrollment] Respuesta:", response);

      return {
        success: true,
        data: response.data,
        emailSent: response.emailSent || false,
        temporaryPassword: response.temporaryPassword || null,
        message: response.message || "Deportista creada exitosamente",
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.createEnrollment] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Renueva matrícula de deportista inactivo
   * @param {number} athleteId - ID del atleta
   * @param {Object} enrollmentData - Datos de la matrícula
   * @returns {Promise<Object>} Resultado de la operación
   */
  async renewEnrollment(athleteId, enrollmentData = {}) {
    try {
      const response = await apiClient.post(
        `/enrollments/renew/${athleteId}`,
        enrollmentData
      );

      return {
        success: true,
        data: response.data,
        message: "Matrícula renovada exitosamente",
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.renewEnrollment] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Procesa matrículas vencidas manualmente
   * @returns {Promise<Object>} Resultado de la operación
   */
  async processExpiredEnrollments() {
    try {
      const response = await apiClient.post("/enrollments/process-expired");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.processExpiredEnrollments] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualiza matrícula
   * @param {number} id - ID del atleta
   * @param {Object} enrollmentData - Datos a actualizar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateEnrollment(id, enrollmentData) {
    try {
      await apiClient.put(`${this.endpoint}/${id}`, enrollmentData);

      return { success: true };
    } catch (error) {
      console.error("❌ [EnrollmentsService.updateEnrollment] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Elimina deportista
   * @param {number} id - ID del atleta
   * @returns {Promise<Object>} Resultado de la operación
   */
  async delete(id) {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ [EnrollmentsService.delete] Error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EnrollmentsService();
