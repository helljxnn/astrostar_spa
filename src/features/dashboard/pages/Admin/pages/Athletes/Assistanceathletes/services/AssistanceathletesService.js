import apiClient from "../../../../../../../../shared/services/apiClient.js";

class AssistanceathletesService {
  async getAttendanceByDate(params = {}) {
    return apiClient.get("/assistance-athletes", params);
  }

  async saveAttendanceBulk(date, items = []) {
    return apiClient.put("/assistance-athletes/bulk", { date, items });
  }

  async getAthleteHistory(athleteId, params = {}) {
    return apiClient.get("/assistance-athletes/history", {
      athleteId,
      ...params,
    });
  }

  async getHistorySummary(params = {}) {
    return apiClient.get("/assistance-athletes/history/summary", params);
  }

  async getSportsCategories(params = {}) {
    return apiClient.get("/sports-categories", params);
  }

  /**
   * Obtener todos los datos del historial de asistencia para reportes (sin paginación)
   * Aplica los mismos filtros que la vista principal
   */
  async getAllForReport(params = {}) {
    try {
      const { startDate, endDate, search, categoria } = params;

      let allData = [];
      let currentPage = 1;
      let hasMorePages = true;
      const limit = 100; // Límite máximo permitido por el backend
      
      // Hacer peticiones paginadas hasta obtener todos los datos
      while (hasMorePages) {
        const reportParams = {
          page: currentPage,
          limit: limit,
        };

        if (startDate) reportParams.startDate = startDate;
        if (endDate) reportParams.endDate = endDate;
        if (search && search.trim()) reportParams.search = search.trim();
        if (categoria && categoria !== "Todas") reportParams.categoria = categoria;

        const response = await apiClient.get("/assistance-athletes/history/summary", reportParams);

        if (response && response.success) {
          const pageData = response.data || [];
          allData = [...allData, ...pageData];
          
          // Verificar si hay más páginas
          hasMorePages = response.pagination?.hasNext || false;
          currentPage++;
          
          // Seguridad: evitar bucle infinito
          if (currentPage > 100) {
            console.warn("⚠️ Deteniendo después de 100 páginas por seguridad");
            break;
          }
        } else {
          hasMorePages = false;
        }
      }

      return {
        success: true,
        data: allData,
      };
    } catch (error) {
      console.error("Error al obtener datos de asistencia para reporte:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }
}

export default new AssistanceathletesService();
