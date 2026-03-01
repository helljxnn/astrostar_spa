import apiClient from "../../../../../../../../shared/services/apiClient.js";

class EnrollmentsService {
  constructor() {
    this.endpoint = "/athletes";
  }
  // Obtener todas las deportistas con matrículas
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

      // El backend puede devolver un array directo o un objeto con data
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      return {
        success: true,
        data: data,
        total: response.data.total || data.length,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      console.error("Error getting enrollments:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener deportista por ID
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting athlete:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear matrícula (convertir pre-inscripción en deportista matriculada)
  async createEnrollment(athleteData, preRegistrationId = null) {
    try {




      // Agregar preRegistrationId al body si existe
      const dataToSend = {
        ...athleteData,
        ...(preRegistrationId && { preRegistrationId }),
      };

      const response = await apiClient.post(this.endpoint, dataToSend);

      return {
        success: true,
        data: response.data,
        emailSent: response.emailSent || false,
        temporaryPassword: response.temporaryPassword || null,
        message: response.message || "Deportista creada exitosamente",
      };
    } catch (error) {
      console.error("Error creating enrollment:", error);
      return { success: false, error: error.message };
    }
  }

  // Renovar matrícula de deportista inactivo
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
      console.error("Error renewing enrollment:", error);
      return { success: false, error: error.message };
    }
  }

  // Procesar matrículas vencidas manualmente
  async processExpiredEnrollments() {
    try {
      const response = await apiClient.post("/enrollments/process-expired");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error processing expired enrollments:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar matrícula
  async updateEnrollment(id, enrollmentData) {
    try {
      await apiClient.put(`${this.endpoint}/${id}`, enrollmentData);

      return { success: true };
    } catch (error) {
      console.error("Error updating enrollment:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar deportista
  async delete(id) {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting athlete:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EnrollmentsService();
