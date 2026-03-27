/**
 * Servicio para gestionar deportistas
 * Maneja todas las peticiones HTTP al backend de deportistas
 */

import apiClient from "../../../../../../../../shared/services/apiClient.js";

const normalizeAthleteState = (athlete) => {
  let estadoFinal = "Activo";

  if (athlete.estado === "Activo" || athlete.estado === "Inactivo") {
    estadoFinal = athlete.estado;
  } else if (athlete.status === "Active") {
    estadoFinal = "Activo";
  } else if (athlete.status === "Inactive") {
    estadoFinal = "Inactivo";
  } else if (athlete.isActive !== undefined && athlete.isActive !== null) {
    estadoFinal = athlete.isActive ? "Activo" : "Inactivo";
  } else if (athlete.active !== undefined && athlete.active !== null) {
    estadoFinal = athlete.active ? "Activo" : "Inactivo";
  }

  return {
    ...athlete,
    estado: estadoFinal,
  };
};

class AthletesService {
  constructor() {
    this.endpoint = "/athletes";
  }

  /**
   * Obtener todos los deportistas con paginación y filtros
   */
  async getAthletes(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        categoria = "",
        estadoInscripcion = "",
      } = params;

      const response = await apiClient.get(this.endpoint, {
        page,
        limit,
        search,
        status,
        categoria,
        estadoInscripcion,
        _t: Date.now(),
        _refresh: Math.random()
      });

      if (response && response.success) {
        const mappedData = (response.data || []).map(normalizeAthleteState);

        return {
          success: true,
          data: mappedData,
          pagination: response.pagination || {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

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
    } catch (error) {
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
   * Resumen de mensualidades para varios atletas (admin)
   */
  async getMonthlySummaryByAthletes(athleteIds = []) {
    try {
      const ids = (athleteIds || []).map((id) => id?.toString()).filter(Boolean);
      if (ids.length === 0) {
        return { success: true, data: {} };
      }
      const response = await apiClient.get("/payments/monthly-summary", {
        athleteIds: ids.join(","),
        _t: Date.now()
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
return { success: false, data: {}, error: error.message };
    }
  }

  /**
   * Historial mensual de un atleta (admin)
   */
  async getMonthlyHistory(athleteId) {
    try {
      const response = await apiClient.get(`/payments/athletes/${athleteId}/monthly-history`, {
        _t: Date.now()
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Historial de intentos de pago mensual (aprobados/rechazados)
   */
  async getMonthlyAttempts(athleteId) {
    try {
      const response = await apiClient.get(`/payments/athletes/${athleteId}/history`, {
        _t: Date.now()
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Obtener un deportista por ID
   */
  async getAthleteById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`, {
        _t: Date.now(),
        _refresh: Math.random()
      });

      if (response && response.success) {
        return {
          success: true,
          data: normalizeAthleteState(response.data),
        };
      }

      return {
        success: false,
        error: response?.message || "Error obteniendo deportista",
      };
    } catch (error) {
return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Crear un nuevo deportista
   */
  async createAthlete(athleteData) {
    try {

      const response = await apiClient.post(this.endpoint, athleteData);

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      return {
        success: false,
        error: response?.message || "Error creando deportista",
      };
    } catch (error) {
return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Actualizar un deportista existente
   */
  async updateAthlete(id, athleteData) {
    try {
      const response = await apiClient.put(
        `${this.endpoint}/${id}`,
        athleteData
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
        error: response?.message || "Error actualizando deportista",
      };
    } catch (error) {
return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Eliminar un deportista
   */
  async deleteAthlete(id) {
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
        error: response?.message || "Error eliminando deportista",
      };
    } catch (error) {
return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cambiar estado del deportista
   */
  /**
     * Cambiar estado de un deportista (Sistema de Mora Congelada)
     * Utiliza endpoint específico para cambio de estado que implementa
     * el sistema de mora congelada del backend
     */
    async changeAthleteStatus(id, status, reason = null) {
      try {
        
        // El backend espera el campo 'status' con valores en español
        const payload = { status };

        // Si se está inactivando, incluir razón si se proporciona
        if (status === 'Inactivo' && reason) {
          payload.inactivityReason = reason;
        }


        const response = await apiClient.patch(`${this.endpoint}/${id}/status`, payload);


        if (response && response.success) {
          return {
            success: true,
            data: response.data,
            message: response.message || 'Estado actualizado correctamente',
          };
        }

        return {
          success: false,
          error: response?.message || "Error cambiando estado",
        };
      } catch (error) {
return {
          success: false,
          error: error.message,
        };
      }
    }


  /**
   * Obtener estadísticas de deportistas
   */
  async getAthleteStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats`);

      if (response && response.success) {
        return {
          success: true,
          data: normalizeAthleteState(response.data),
        };
      }

      return {
        success: false,
        error: response?.message || "Error obteniendo estadísticas",
      };
    } catch (error) {
return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Buscar deportistas
   */
  async searchAthletes(searchTerm, limit = 20) {
    return this.getAthletes({
      search: searchTerm,
      limit,
      page: 1,
    });
  }

  /**
   * Obtener deportistas activos
   */
  async getActiveAthletes() {
    return this.getAthletes({ status: "Activo" });
  }

  /**
   * Obtener deportistas por categoría
   */
  async getAthletesByCategory(categoria) {
    return this.getAthletes({ categoria });
  }

  /**
   * Obtener deportistas por estado de inscripción
   */
  async getAthletesByInscriptionStatus(estadoInscripcion) {
    return this.getAthletes({ estadoInscripcion });
  }

  /**
   * Obtener tipos de documento válidos para deportistas
   */
  async getDocumentTypes() {
    try {
      const response = await apiClient.get(`${this.endpoint}/document-types`);

      if (response && response.success) {
        return {
          success: true,
          data: response.data || [],
        };
      }

      return {
        success: false,
        data: [],
        error: response?.message || "Error obteniendo tipos de documento",
      };
    } catch (error) {
return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  /**
   * Verificar disponibilidad de email (busca en TODOS los usuarios) - OPTIMIZADO
   */
  async checkEmailAvailability(email, excludeId = null) {
    try {
      // Construir params solo con valores no nulos
      const params = { email };
      if (excludeId !== null && excludeId !== undefined) {
        params.excludeUserId = excludeId;
      }

      const response = await apiClient.get("/users/check-email", { 
        params, 
        skipLoader: true // No mostrar loader para verificaciones
      });

      return {
        available: response.available !== false,
        message: response.message || "",
      };
    } catch (error) {
return {
        available: true, // En caso de error, permitir continuar
        message: "",
      };
    }
  }

  /**
   * Verificar disponibilidad de identificación (busca en TODOS los usuarios) - OPTIMIZADO
   */
  async checkIdentificationAvailability(identification, excludeId = null) {
    try {
      // Construir params solo con valores no nulos
      const params = { identification };
      if (excludeId !== null && excludeId !== undefined) {
        params.excludeUserId = excludeId;
      }

      const response = await apiClient.get("/users/check-identification", { 
        params, 
        skipLoader: true // No mostrar loader para verificaciones
      });

      return {
        available: response.available !== false,
        message: response.message || "",
      };
    } catch (error) {
return {
        available: true, // En caso de error, permitir continuar
        message: "",
      };
    }
  }

  /**
   * Obtener todos los deportistas para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de deportistas
   */
  async getAllForReport(params = {}) {
    try {
      // Llamar al endpoint /report del backend
      const response = await apiClient.get(`${this.endpoint}/report`, {
        params: {
          search: params.search || '',
          status: params.status || '',
          categoria: params.categoria || '',
          estadoInscripcion: params.estadoInscripcion || '',
        }
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data || [],
        };
      } else {
        return {
          success: false,
          data: [],
          error: response?.message || "Error obteniendo deportistas para reporte",
        };
      }
    } catch (error) {
return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }
}

export default new AthletesService();

