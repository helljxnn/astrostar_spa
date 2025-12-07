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

      console.log("🌐 InscriptionsService.getAll - Endpoint:", this.endpoint);
      console.log("🌐 InscriptionsService.getAll - Params:", params);

      const response = await apiClient.get(this.endpoint, params);
      
      console.log("📡 InscriptionsService.getAll - Respuesta completa:", response);

      // Manejar diferentes estructuras de respuesta
      const data = response.data?.data || response.data || [];
      const total = response.data?.total || response.total || data.length;

      console.log("📊 InscriptionsService.getAll - Data extraída:", data);
      console.log("📊 InscriptionsService.getAll - Total:", total);

      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        total: total,
        hasMore: response.data?.hasMore || false,
      };
    } catch (error) {
      console.error("❌ InscriptionsService.getAll - Error:", error);
      console.error("❌ InscriptionsService.getAll - Error message:", error.message);
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
        estado: newStatus,
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
  async resendEmail(email) {
    try {
      const response = await apiClient.post(`${this.endpoint}/resend-email`, { email });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error resending email:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new InscriptionsService();
