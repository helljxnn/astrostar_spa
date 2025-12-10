/**
 * Servicio para gestionar deportistas
 * Maneja todas las peticiones HTTP al backend de deportistas
 */

import apiClient from '../../../../../../../../shared/services/apiClient.js';

class AthletesService {
  constructor() {
    this.endpoint = '/athletes';
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
        estadoInscripcion = ""
      } = params;
      
      console.log('🟢 [AthletesService] Obteniendo deportistas con params:', { page, limit, search, status, categoria, estadoInscripcion });
      const response = await apiClient.get(this.endpoint, { 
        page, 
        limit, 
        search,
        status,
        categoria,
        estadoInscripcion
      });
      console.log('🟢 [AthletesService] Respuesta del backend:', response);
      console.log('🟢 [AthletesService] Direcciones de deportistas:', response?.data?.map(a => ({ id: a.id, nombre: a.firstName, address: a.address })));
      
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
            hasPrev: false
          }
        };
      } else {
        console.error('❌ [AthletesService] Respuesta sin success:', response);
        return {
          success: false,
          data: [],
          pagination: {
            page: parseInt(page), 
            limit: parseInt(limit), 
            total: 0, 
            totalPages: 0, 
            hasNext: false, 
            hasPrev: false
          }
        };
      }
    } catch (error) {
      console.error('❌ [AthletesService] Error al obtener deportistas:', error);
      return {
        success: false,
        data: [],
        pagination: {
          page: params.page || 1, 
          limit: params.limit || 10, 
          total: 0, 
          totalPages: 0, 
          hasNext: false, 
          hasPrev: false
        },
        error: error.message
      };
    }
  }

  /**
   * Obtener un deportista por ID
   */
  async getAthleteById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error obteniendo deportista'
      };
    } catch (error) {
      console.error(`Error obteniendo deportista ${id}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crear un nuevo deportista
   */
  async createAthlete(athleteData) {
    try {
      console.log('🟢 [AthletesService] Enviando datos al backend:', athleteData);
      const response = await apiClient.post(this.endpoint, athleteData);
      console.log('🟢 [AthletesService] Respuesta del backend:', response);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error creando deportista'
      };
    } catch (error) {
      console.error('❌ [AthletesService] Error al crear deportista:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar un deportista existente
   */
  async updateAthlete(id, athleteData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, athleteData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error actualizando deportista'
      };
    } catch (error) {
      console.error(`Error actualizando deportista ${id}:`, error);
      return {
        success: false,
        error: error.message
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
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error eliminando deportista'
      };
    } catch (error) {
      console.error(`Error eliminando deportista ${id}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cambiar estado del deportista
   */
  async changeAthleteStatus(id, status) {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${id}/status`, { status });
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error cambiando estado'
      };
    } catch (error) {
      console.error(`Error cambiando estado del deportista ${id}:`, error);
      return {
        success: false,
        error: error.message
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
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error obteniendo estadísticas'
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: error.message
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
      page: 1 
    });
  }

  /**
   * Obtener deportistas activos
   */
  async getActiveAthletes() {
    return this.getAthletes({ status: 'Activo' });
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
          data: response.data || []
        };
      }
      
      return {
        success: false,
        data: [],
        error: response?.message || 'Error obteniendo tipos de documento'
      };
    } catch (error) {
      console.error('Error obteniendo tipos de documento:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Verificar disponibilidad de email (busca en TODOS los usuarios)
   */
  async checkEmailAvailability(email, excludeId = null) {
    try {
      // Construir params solo con valores no nulos
      const params = { email };
      if (excludeId !== null && excludeId !== undefined) {
        params.excludeUserId = excludeId;
      }
      
      const response = await apiClient.get('/users/check-email', params);
      
      return {
        available: response.available !== false,
        message: response.message || ''
      };
    } catch (error) {
      console.error('Error verificando email:', error);
      return {
        available: true, // En caso de error, permitir continuar
        message: ''
      };
    }
  }

  /**
   * Verificar disponibilidad de identificación (busca en TODOS los usuarios)
   */
  async checkIdentificationAvailability(identification, excludeId = null) {
    try {
      // Construir params solo con valores no nulos
      const params = { identification };
      if (excludeId !== null && excludeId !== undefined) {
        params.excludeUserId = excludeId;
      }
      
      const response = await apiClient.get('/users/check-identification', params);
      
      return {
        available: response.available !== false,
        message: response.message || ''
      };
    } catch (error) {
      console.error('Error verificando identificación:', error);
      return {
        available: true, // En caso de error, permitir continuar
        message: ''
      };
    }
  }
}

export default new AthletesService();
