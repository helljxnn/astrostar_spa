import apiClient from "../../../../../../../../shared/services/apiClient.js";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";

// ============================================================================
// CONSTANTES
// ============================================================================
const ENDPOINTS = {
  ATHLETES: "/athletes",
  ENROLLMENTS: "/enrollments",
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Prepara los datos de matrícula para enviar al backend
 * @param {Object} athleteData - Datos del atleta
 * @param {number|null} preRegistrationId - ID de pre-inscripción
 * @returns {Object} Datos formateados para el backend
 */
const prepareEnrollmentData = (athleteData, preRegistrationId = null) => {
  return {
    athlete: athleteData,
    enrollment: {
      // Estado inicial: Pending_Payment. createdAt = fecha de creación (backend).
      // fechaInicio y fechaVencimiento se asignan al aprobar el pago inicial.
      estado: "Pending_Payment",
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
   * Obtener todos los registros para reporte (sin paginación)
   * @param {Object} params - Filtros (search, estado, etc.)
   * @returns {Promise<Object>} Todos los registros
   */
  async getAllForReport(params = {}) {
    try {
      const response = await apiClient.get(`${this.enrollmentsEndpoint}/report`, { params });
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error('Error fetching enrollments report:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Obtiene todas las deportistas con matrículas desde GET /api/enrollments
   * Soporta búsqueda por nombre completo y número de documento
   * @param {Object} filters - { page, pageSize, search, estado }
   * @returns {Promise<Object>} Resultado con datos y metadata
   */
  async getAll(filters = {}) {
    try {
      const params = {
        page: filters.page || PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: filters.pageSize || PAGINATION_CONFIG.ROWS_PER_PAGE,
        sortBy: 'createdAt',
        sortOrder: 'desc', // Más recientes primero
        ...(filters.estado && { estado: filters.estado }),
        ...(filters.search && filters.search.trim() && { search: filters.search.trim() }),
      };

      const response = await apiClient.get(this.enrollmentsEndpoint, { params });

      const raw = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const data = raw.map((item, index) => {
        const enrollment = item.enrollment || item;
        const athlete = item.athlete || item.athleteData || {};
        const user = athlete.user || item.user || {};

        const firstName =
          user.firstName ||
          athlete.firstName ||
          athlete.nombres ||
          "";

        const lastName =
          user.lastName ||
          athlete.lastName ||
          athlete.apellidos ||
          "";

        const identification =
          user.identification ||
          athlete.identification ||
          athlete.numeroDocumento ||
          "";

        const email =
          user.email ||
          athlete.email ||
          athlete.correo ||
          "";

        const phoneNumber =
          user.phoneNumber ||
          athlete.phoneNumber ||
          athlete.telefono ||
          "";

        const fechaMatricula =
          enrollment.fechaMatricula ||
          enrollment.enrollmentDate ||
          enrollment.fechaInscripcion ||
          enrollment.createdAt ||
          item.fechaMatricula ||
          item.createdAt ||
          null;

        const fechaVencimiento =
          enrollment.fechaVencimiento ||
          enrollment.expirationDate ||
          null;

        const estadoMatricula =
          enrollment.estado ||
          enrollment.status ||
          item.estadoMatricula ||
          null;

        const base = {
          id: athlete.id || item.athleteId || item.id,
          firstName,
          lastName,
          identification,
          email,
          phoneNumber,
          categoria: athlete.categoria || null,
          estado: athlete.status || athlete.estado || null,
          fechaMatricula,
          fechaVencimiento,
          estadoMatricula,
        };

        const enrollmentForLists = {
          id: enrollment.id,
          fechaMatricula,
          fechaVencimiento,
          estado: estadoMatricula,
          fechaInicio: enrollment.fechaInicio || null,
        };

        const result = {
          ...base,
          enrollments: [enrollmentForLists],
          latestEnrollment: enrollmentForLists,
          athlete: {
            ...athlete,
            user,
          },
        };

        return result;
      });

      // Verificar duplicados
      const ids = data.map(item => item.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn('⚠️ [EnrollmentsService.getAll] Duplicados detectados:', duplicateIds);
      }

      return {
        success: true,
        data,
        total: response.pagination?.total || data.length,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.getAll] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el historial completo de matrículas de un deportista específico
   * @param {number} athleteId - ID del deportista
   * @returns {Promise<Object>} Todas las matrículas del deportista
   */
  async getAthleteEnrollmentHistory(athleteId) {
    try {
      // Usar el NUEVO endpoint específico creado por el backend
      const response = await apiClient.get(`${this.enrollmentsEndpoint}/athlete/${athleteId}/history`);
      
      return {
        success: true,
        data: response.data || [],
        message: response.message || 'Historial obtenido exitosamente'
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.getAthleteEnrollmentHistory] Error:", error);
      return { success: false, error: error.message, data: [] };
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
      // USAR EL ENDPOINT CORRECTO /api/enrollments para crear matrículas con estado PENDING_PAYMENT
      const dataToSend = prepareEnrollmentData(athleteData, preRegistrationId);

      // Usar el endpoint de enrollments (el correcto para matrículas)
      const response = await apiClient.post(this.enrollmentsEndpoint, dataToSend);

      // Si la matrícula se creó exitosamente, intentar actualizar la categoría del atleta
      if (response.data && athleteData.categoria) {
        try {
          // Buscar el ID del atleta en diferentes lugares de la respuesta
          let athleteId = null;
          if (response.data.athlete?.id) {
            athleteId = response.data.athlete.id;
          } else if (response.data.athleteId) {
            athleteId = response.data.athleteId;
          } else if (response.data.id) {
            // Si la respuesta es directamente el atleta
            athleteId = response.data.id;
          }
          
          if (athleteId) {
            // Primero obtener los datos completos del atleta
            const athleteResponse = await apiClient.get(`${this.endpoint}/${athleteId}`);
            
            if (athleteResponse.success && athleteResponse.data) {
              // Actualizar solo la categoría manteniendo todos los demás datos
              const updateData = {
                ...athleteResponse.data,
                categoria: athleteData.categoria
              };
              
              const updateResponse = await apiClient.put(`${this.endpoint}/${athleteId}`, updateData);
            } else {
              console.warn("⚠️ [EnrollmentsService.createEnrollment] No se pudieron obtener los datos del atleta");
            }
          } else {
            console.warn("⚠️ [EnrollmentsService.createEnrollment] No se encontró ID del atleta en la respuesta");
          }
        } catch (categoryError) {
          console.warn("⚠️ [EnrollmentsService.createEnrollment] Error actualizando categoría:", categoryError);
          // No fallar la operación completa por este error
        }
      }

      return {
        success: true,
        data: response.data,
        emailSent: response.emailSent || false,
        temporaryPassword: response.temporaryPassword || null,
        message: response.message || "Matrícula creada exitosamente con estado pendiente de pago",
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.createEnrollment] Error:", error);
      
      let errorMessage = error.message;
      
      // Manejar error específico de timeout de transacción
      if (error.message && error.message.includes('Transaction already closed')) {
        errorMessage = 'El servidor está procesando muchas solicitudes. Por favor, intenta crear la matrícula nuevamente en unos segundos.';
      }
      
      // Manejar otros errores de timeout
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'La operación está tomando más tiempo del esperado. Por favor, intenta nuevamente.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Activa una matrícula cuando se aprueba el pago inicial
   * @param {number} enrollmentId - ID de la matrícula
   * @returns {Promise<Object>} Resultado de la operación
   */
  async activateEnrollment(enrollmentId) {
    try {
      const response = await apiClient.post(`${this.enrollmentsEndpoint}/${enrollmentId}/activate`);

      return {
        success: true,
        data: response.data,
        message: response.message || "Matrícula activada exitosamente",
      };
    } catch (error) {
      console.error("❌ [EnrollmentsService.activateEnrollment] Error:", error);
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

