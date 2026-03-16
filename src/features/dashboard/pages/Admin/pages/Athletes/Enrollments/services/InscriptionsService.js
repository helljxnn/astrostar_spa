import apiClient from "../../../../../../../../shared/services/apiClient.js";

class InscriptionsService {
  constructor() {
    this.endpoint = "/pre-registrations"; // El endpoint del backend sigue siendo el mismo
  }

  // Obtener todas las inscripciones
  async getAll(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.pageSize || 100,
        ...(filters.estado && { estado: filters.estado }),
      };

      const response = await apiClient.get(this.endpoint, params);

      // Manejar diferentes estructuras de respuesta
      const data = response.data?.data || response.data || [];
      const total = response.data?.total || response.total || data.length;

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        total: total,
        hasMore: response.data?.hasMore || false,
      };
    } catch (error) {
      console.error("Error getting inscriptions:", error);
      return { 
        success: false, 
        error: error.message,
        data: [],
        total: 0 
      };
    }
  }

  // Obtener inscripción por ID
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting inscription:", error);
      return { success: false, error: error.message };
    }
  }

  // Buscar por documento
  async getByDocument(numeroDocumento) {
    try {
      const response = await apiClient.get(`${this.endpoint}/search`, {
        params: { numeroDocumento },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error searching inscription:", error);
      return { success: false, error: error.message };
    }
  }

  // Verificar si un documento ya está inscrito o matriculado
  async checkDocumentExists(numeroDocumento) {
    try {
      const response = await apiClient.get(`${this.endpoint}/check-document/${numeroDocumento}`, { skipLoader: true });
      
      // El backend puede retornar la respuesta de dos formas:
      // 1. { data: { exists: true, message: "..." } }
      // 2. { exists: true, message: "..." }
      const exists = response.data?.exists ?? response.exists ?? false;
      const message = response.data?.message ?? response.message ?? null;
      const details = response.data?.details ?? response.details ?? null;
      
      return {
        success: true,
        exists: exists,
        message: message,
        details: details,
      };
    } catch (error) {
      console.error("Error checking document:", error);
      
      // Si el endpoint no existe (404), retornar false
      if (error.message.includes("404") || error.message.includes("Not Found")) {
        return { success: true, error: "Endpoint no implementado", exists: false };
      }
      
      // Si hay error de Prisma (500), asumir que no existe para no bloquear
      // El otro servicio (atletas) ya validará si está matriculado
      if (error.message.includes("prisma") || error.message.includes("Invalid")) {
        return { success: true, error: "Error de backend", exists: false };
      }
      
      // Para cualquier otro error, asumir que no existe (fail-safe)
      return { success: true, error: error.message, exists: false };
    }
  }

  // Verificar si un email ya está inscrito o matriculado
  async checkEmailExists(email) {
    try {
      const response = await apiClient.get(`${this.endpoint}/check-email/${email}`, { skipLoader: true });
      
      const exists = response.data?.exists ?? response.exists ?? false;
      const message = response.data?.message ?? response.message ?? null;
      const details = response.data?.details ?? response.details ?? null;
      
      return {
        success: true,
        exists: exists,
        message: message,
        details: details,
      };
    } catch (error) {
      console.error("Error checking email:", error);
      
      if (error.message.includes("404") || error.message.includes("Not Found")) {
        return { success: true, error: "Endpoint no implementado", exists: false };
      }
      
      if (error.message.includes("prisma") || error.message.includes("Invalid")) {
        return { success: true, error: "Error de backend", exists: false };
      }
      
      return { success: true, error: error.message, exists: false };
    }
  }

  // Crear inscripción (desde el landing)
  async create(inscriptionData) {
    try {
      const response = await apiClient.post(this.endpoint, inscriptionData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating inscription:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar estado de inscripción
  async updateStatus(id, newStatus) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}/status`, {
        status: newStatus, // Cambiar de "estado" a "status" (inglés)
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating inscription status:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar inscripción
  async delete(id) {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting inscription:", error);
      return { success: false, error: error.message };
    }
  }

  // Reenviar correo de confirmación
  async resendEmail(email, identification = null) {
    try {
      const payload = { email };
      if (identification) {
        payload.identification = identification;
      }
      
      const response = await apiClient.post(`${this.endpoint}/resend-email`, payload);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error resending email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todas las inscripciones para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de inscripciones
   */
  async getAllForReport(params = {}) {
    try {
      const queryParams = {
        ...params,
        limit: 10000, // Límite alto para obtener todos los datos
      };

      // Limpiar parámetros de paginación
      delete queryParams.page;
      delete queryParams.pageSize;

      const response = await apiClient.get(this.endpoint, queryParams);

      // Manejar diferentes estructuras de respuesta
      const data = response.data?.data || response.data || [];

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
      };
    } catch (error) {
      console.error("Error getting inscriptions for report:", error);
      return { 
        success: false, 
        error: error.message,
        data: [],
      };
    }
  }
}

export default new InscriptionsService();

