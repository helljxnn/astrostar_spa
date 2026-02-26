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
        console.warn("⚠️ [InscriptionsService] Error de backend (Prisma), asumiendo documento no inscrito");
        return { success: true, error: "Error de backend", exists: false };
      }
      
      // Para cualquier otro error, asumir que no existe (fail-safe)
      return { success: true, error: error.message, exists: false };
    }
  }

  // Crear inscripción (desde el landing)
  async create(inscriptionData) {
    try {
      console.log("📤 [InscriptionsService.create] Datos recibidos del formulario:", inscriptionData);
      console.log("📤 [InscriptionsService.create] Enviando datos al backend:", inscriptionData);
      
      const response = await apiClient.post(this.endpoint, inscriptionData);
      console.log("📥 [InscriptionsService.create] Respuesta del backend:", response);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("❌ [InscriptionsService.create] Error:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar estado de inscripción
  async updateStatus(id, newStatus) {
    try {
      console.log("🔄 [InscriptionsService.updateStatus] Actualizando estado...");
      console.log("🔄 [InscriptionsService.updateStatus] ID:", id);
      console.log("🔄 [InscriptionsService.updateStatus] Nuevo estado:", newStatus);
      console.log("🔄 [InscriptionsService.updateStatus] URL:", `${this.endpoint}/${id}/status`);
      
      const response = await apiClient.put(`${this.endpoint}/${id}/status`, {
        estado: newStatus,
      });

      console.log("✅ [InscriptionsService.updateStatus] Respuesta:", response);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ [InscriptionsService.updateStatus] Error:", error);
      console.error("❌ [InscriptionsService.updateStatus] Error message:", error.message);
      console.error("❌ [InscriptionsService.updateStatus] Error response:", error.response);
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
