import apiClient from '../../../../../../../../shared/services/apiClient';

class TeamsService {
  constructor() {
    this.endpoint = '/teams';
  }

  async getTeams(params = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        status = "", 
        teamType = "" 
      } = params;
      
      const response = await apiClient.get(this.endpoint, { 
        params: {
          page, 
          limit, 
          search,
          status,
          teamType
        }
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
      return {
        success: false,
        data: [],
        pagination: {
          page: params.page || 1, 
          limit: params.limit || 5, 
          total: 0, 
          totalPages: 0, 
          hasNext: false, 
          hasPrev: false
        },
        error: error.message
      };
    }
  }

  async getTeamById(id) {
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
        error: response?.message || 'Error obteniendo equipo'
      };
    } catch (error) {
      console.error(`Error obteniendo equipo ${id}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createTeam(teamData) {
    try {
      const response = await apiClient.post(this.endpoint, teamData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error creando equipo'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async updateTeam(id, teamData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, teamData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error actualizando equipo'
      };
    } catch (error) {
      console.error(`Error actualizando equipo ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async deleteTeam(id) {
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
        error: response?.message || 'Error eliminando equipo'
      };
    } catch (error) {
      console.error(`Error eliminando equipo ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async changeTeamStatus(id, status) {
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
      console.error(`Error cambiando estado del equipo ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async checkNameAvailability(name, excludeId = null) {
    try {
      const params = { name };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      const response = await apiClient.get(`${this.endpoint}/check-name`, { params });
      
      if (response && response.success) {
        return {
          success: true,
          available: response.available,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error verificando nombre'
      };
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTeamStats() {
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

  async getTrainers() {
    try {
      const response = await apiClient.get('/trainers');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }
      
      return {
        success: false,
        data: [],
        error: response?.message || 'Error obteniendo entrenadores'
      };
    } catch (error) {
      console.error('❌ Error obteniendo entrenadores:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getAthletes() {
    try {
      const response = await apiClient.get('/athletes');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }
      
      return {
        success: false,
        data: [],
        error: response?.message || 'Error obteniendo deportistas'
      };
    } catch (error) {
      console.error('❌ Error obteniendo deportistas:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async searchTeams(searchTerm, limit = 20) {
    return this.getTeams({ 
      search: searchTerm, 
      limit,
      page: 1 
    });
  }

  async getActiveTeams() {
    return this.getTeams({ status: 'Active' });
  }

  async getTeamsByType(teamType) {
    return this.getTeams({ teamType });
  }
}

export default new TeamsService();