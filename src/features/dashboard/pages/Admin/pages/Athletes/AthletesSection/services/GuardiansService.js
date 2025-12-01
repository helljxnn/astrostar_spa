/**
 * Servicio para gestionar acudientes
 * Maneja todas las peticiones HTTP al backend de acudientes
 */

import apiClient from '../../../../../../../../shared/services/apiClient.js';

class GuardiansService {
  constructor() {
    this.endpoint = '/guardians';
  }

  /**
   * Obtener todos los acudientes con paginación y filtros
   */
  async getGuardians(params = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        status = ""
      } = params;
      
      const response = await apiClient.get(this.endpoint, { 
        page, 
        limit, 
        search,
        status
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
            hasPrev: false
          }
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
            hasPrev: false
          }
        };
      }
    } catch (error) {
      console.error('Error al obtener acudientes:', error);
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
   * Obtener un acudiente por ID
   */
  async getGuardianById(id) {
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
        error: response?.message || 'Error obteniendo acudiente'
      };
    } catch (error) {
      console.error(`Error obteniendo acudiente ${id}:`, error);
      return {
        success: false,
        error: error.message
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
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error creando acudiente'
      };
    } catch (error) {
      console.error('Error al crear acudiente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar un acudiente existente
   */
  async updateGuardian(id, guardianData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, guardianData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error actualizando acudiente'
      };
    } catch (error) {
      console.error(`Error actualizando acudiente ${id}:`, error);
      return {
        success: false,
        error: error.message
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
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error eliminando acudiente'
      };
    } catch (error) {
      console.error(`Error eliminando acudiente ${id}:`, error);
      return {
        success: false,
        error: error.message
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
   * Buscar acudientes
   */
  async searchGuardians(searchTerm, limit = 20) {
    return this.getGuardians({ 
      search: searchTerm, 
      limit,
      page: 1 
    });
  }

  /**
   * Obtener acudientes activos
   */
  async getActiveGuardians() {
    return this.getGuardians({ status: 'Activo' });
  }
}

export default new GuardiansService();
