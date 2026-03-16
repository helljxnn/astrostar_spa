/**
 * Servicio para gestionar acudientes
 * Maneja todas las peticiones HTTP al backend de acudientes
 */

import apiClient from "../../../../../../../../shared/services/apiClient.js";

class GuardiansService {
  constructor() {
    this.endpoint = "/guardians";
  }

  /**
   * Obtener todos los acudientes con paginación y filtros
   */
  async getGuardians(params = {}) {
    try {
      const { page = 1, limit = 10, search = "", status = "" } = params;

      const response = await apiClient.get(this.endpoint, {
        page,
        limit,
        search,
        status,
      });
if (response && response.success) {
        return {
          success: true,
          data: response.data || [],
          pagination: response.pagination || {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      } else {
        return {
          success: false,
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
    } catch (error) {
      console.error("Error al obtener acudientes:", error);
      return {
        success: false,
        data: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: error.message,
      };
    }
  }

  /**
   * Obtener un acudiente por ID
   */
  async getGuardianById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response?.message || "Error obteniendo acudiente",
      };
    } catch (error) {
      console.error(`Error obteniendo acudiente ${id}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Crear un nuevo acudiente
   */
  async createGuardian(guardianData) {
    try {
      const response = await apiClient.post(this.endpoint, guardianData);

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      return {
        success: false,
        error: response?.message || "Error creando acudiente",
      };
    } catch (error) {
      console.error("Error al crear acudiente:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Actualizar un acudiente existente
   */
  async updateGuardian(id, guardianData) {
    try {
      const response = await apiClient.put(
        `${this.endpoint}/${id}`,
        guardianData
      );

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      return {
        success: false,
        error: response?.message || "Error actualizando acudiente",
      };
    } catch (error) {
      console.error(`Error actualizando acudiente ${id}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Eliminar un acudiente
   */
  async deleteGuardian(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`);

      if (response && response.success) {
        return {
          success: true,
          message: response.message,
        };
      }

      return {
        success: false,
        error: response?.message || "Error eliminando acudiente",
      };
    } catch (error) {
      console.error(`Error eliminando acudiente ${id}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener estadísticas de acudientes
   */
  async getGuardianStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats`);

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response?.message || "Error obteniendo estadísticas",
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Buscar acudientes
   */
  async searchGuardians(searchTerm, limit = 20) {
    return this.getGuardians({
      search: searchTerm,
      limit,
      page: 1,
    });
  }

  /**
   * Obtener acudientes activos
   */
  async getActiveGuardians() {
    return this.getGuardians({ status: "Activo" });
  }

  /**
   * Obtener todos los acudientes sin paginación
   * Hace múltiples peticiones automáticas si hay más de 100 registros
   */
  async getAll() {
    try {
      let allGuardians = [];
      let currentPage = 1;
      let hasMorePages = true;
      const limit = 100; // Límite máximo permitido por el backend

      // Hacer peticiones hasta obtener todos los registros
      while (hasMorePages) {
        const response = await apiClient.get(this.endpoint, {
          page: currentPage,
          limit: limit,
        });

        if (response && response.success) {
          const guardians = response.data || [];
          allGuardians = [...allGuardians, ...guardians];

          // Si recibimos menos registros que el límite, ya no hay más páginas
          hasMorePages = guardians.length === limit;
          currentPage++;
        } else {
          // Si hay un error, detenemos el loop
          hasMorePages = false;
        }
      }

      return {
        success: true,
        data: allGuardians,
      };
    } catch (error) {
      console.error("Error al obtener todos los acudientes:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  /**
   * Verificar si un documento ya está registrado
   */
  async checkDocumentExists(identification, excludeId = null) {
    try {
      const response = await apiClient.get(`${this.endpoint}/check-document`, {
        identification,
        excludeId,
      });

      return {
        success: true,
        exists: response.exists || false,
        guardian: response.guardian || null,
      };
    } catch (error) {
      console.error("Error verificando documento:", error);
      return {
        success: false,
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Verificar si un email ya está registrado
   */
  async checkEmailExists(email, excludeId = null) {
    try {
      const response = await apiClient.get(`${this.endpoint}/check-email`, {
        email,
        excludeId,
      });

      return {
        success: true,
        exists: response.exists || false,
        guardian: response.guardian || null,
      };
    } catch (error) {
      console.error("Error verificando email:", error);
      return {
        success: false,
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener todos los acudientes para reportes (sin paginación)
   * Aplica los mismos filtros que la vista principal
   */
  async getAllForReport(params = {}) {
    try {
      const { search = "", status = "" } = params;

      let allData = [];
      let currentPage = 1;
      let hasMorePages = true;
      const limit = 100; // Límite máximo permitido por el backend
      
      // Hacer peticiones paginadas hasta obtener todos los datos
      while (hasMorePages) {
        const response = await apiClient.get(this.endpoint, {
          page: currentPage,
          limit: limit,
          search,
          status,
        });

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
      console.error("Error al obtener acudientes para reporte:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  /**
   * Remover acudiente de un deportista específico (desasociar)
   */
  async removeGuardianFromAthlete(athleteId) {
    try {
      const response = await apiClient.put(
        `/athletes/${athleteId}/remove-guardian`,
        {}
      );

      if (response && response.success) {
        return {
          success: true,
          message: response.message || "Acudiente removido correctamente",
        };
      }

      return {
        success: false,
        error: response?.message || "Error removiendo acudiente",
      };
    } catch (error) {
      console.error(
        `Error removiendo acudiente del deportista ${athleteId}:`,
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new GuardiansService();

