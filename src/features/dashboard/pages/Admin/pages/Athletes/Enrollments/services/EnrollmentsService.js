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

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
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
  async createEnrollment(athleteData) {
    try {
      const response = await apiClient.post(this.endpoint, athleteData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating enrollment:", error);
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
