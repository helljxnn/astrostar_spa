import apiClient from "../../../../../../../../shared/services/apiClient";

class DonationsService {
  async list(params = {}) {
    return apiClient.get("/donations", params);
  }

  async create(data) {
    return apiClient.post("/donations", data);
  }

  async update(id, data) {
    if (!id) return null;
    return apiClient.put(`/donations/${id}`, data);
  }

  async uploadFiles(donationId, files = [], fileType = "soporte") {
    if (!donationId || files.length === 0) return null;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiClient.post(
      `/donations/${donationId}/files?fileType=${fileType}`,
      formData,
    );
  }

  async getStatistics() {
    return apiClient.get("/donations", { params: { limit: 10000 } });
  }

  /**
   * Download donation certificate PDF
   * @param {number} donationId - Donation ID
   * @returns {Promise<Blob>} PDF file
   */
  async downloadCertificate(donationId) {
    try {
      const response = await apiClient.get(
        `/donations/${donationId}/certificate`,
        {
          responseType: "blob",
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las donaciones para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de donaciones
   */
  async getAllForReport(params = {}) {
    try {
      const response = await apiClient.get("/donations", {
        ...params,
        limit: 10000, // Límite alto para obtener todos los datos
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new DonationsService();
