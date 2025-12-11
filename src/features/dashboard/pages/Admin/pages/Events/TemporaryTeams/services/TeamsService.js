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
      const params = new URLSearchParams({ name: name.toString() });
      if (excludeId) {
        params.append('excludeId', excludeId.toString());
      }
      
      const url = `${this.endpoint}/check-name?${params}`;
      console.log('🌐 Verificando disponibilidad de nombre');
      console.log('   URL:', url);
      console.log('   name:', name);
      console.log('   excludeId:', excludeId);
      
      const response = await apiClient.get(url);
      
      console.log('📡 Respuesta disponibilidad nombre:', response);
      
      if (response && response.success !== undefined) {
        return {
          success: true,
          available: response.available,
          message: response.message
        };
      }
      
      return {
        success: false,
        available: true,
        error: response?.message || 'Error verificando nombre'
      };
    } catch (error) {
      console.error('❌ Error verificando disponibilidad:', error);
      console.error('   Error completo:', error.response?.data || error.message);
      return {
        success: false,
        available: true,
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
      console.log('🔵 Obteniendo entrenadores de fundación...');
      const employeesResponse = await apiClient.get('/employees');
      console.log('📦 Respuesta employees:', employeesResponse);
      
      console.log('🟡 Obteniendo personas temporales...');
      const temporalResponse = await apiClient.get('/temporary-workers');
      console.log('📦 Respuesta temporal:', temporalResponse);
      
      const trainers = [];
      
      // Transformar empleados (fundación) - Filtrar solo entrenadores
      if (employeesResponse?.success && Array.isArray(employeesResponse.data)) {
        console.log('✅ Employees encontrados:', employeesResponse.data.length);
        if (employeesResponse.data.length > 0) {
          console.log('📊 Primer employee COMPLETO:', JSON.stringify(employeesResponse.data[0], null, 2));
        }
        
        const entrenadores = employeesResponse.data.filter(emp => emp.user?.role?.name === 'Entrenador');
        console.log('👨‍🏫 Entrenadores filtrados:', entrenadores.length);
        
        const foundationTrainers = entrenadores.map(emp => ({
            id: emp.id,
            name: `${emp.user?.firstName || ''} ${emp.user?.middleName || ''} ${emp.user?.lastName || ''} ${emp.user?.secondLastName || ''}`.trim().replace(/\s+/g, ' '),
            identification: emp.user?.identification,
            phoneNumber: emp.user?.phoneNumber,
            type: 'fundacion'
          }));
        trainers.push(...foundationTrainers);
      }
      
      // Transformar temporales - Filtrar solo entrenadores
      if (temporalResponse?.success && Array.isArray(temporalResponse.data)) {
        console.log('✅ Temporales encontrados:', temporalResponse.data.length);
        if (temporalResponse.data.length > 0) {
          console.log('📊 Primer temporal COMPLETO:', JSON.stringify(temporalResponse.data[0], null, 2));
        }
        
        const entrenadoresTemp = temporalResponse.data.filter(temp => temp.personType === 'Entrenador');
        console.log('👨‍🏫 Entrenadores temporales filtrados:', entrenadoresTemp.length);
        
        const temporalTrainers = entrenadoresTemp.map(temp => ({
            id: temp.id,
            name: `${temp.firstName || ''} ${temp.middleName || ''} ${temp.lastName || ''} ${temp.secondLastName || ''}`.trim().replace(/\s+/g, ' '),
            identification: temp.identification,
            phoneNumber: temp.phone || temp.phoneNumber,
            type: 'temporal'
          }));
        trainers.push(...temporalTrainers);
      }
      
      return {
        success: true,
        data: trainers
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
      console.log('🔵 Obteniendo deportistas de fundación...');
      const athletesResponse = await apiClient.get('/athletes');
      console.log('📦 Respuesta athletes:', athletesResponse);
      
      console.log('🟡 Obteniendo personas temporales...');
      const temporalResponse = await apiClient.get('/temporary-workers');
      console.log('📦 Respuesta temporal:', temporalResponse);
      
      const athletes = [];
      
      // Transformar deportistas de fundación - Excluir inactivos
      if (athletesResponse?.success && Array.isArray(athletesResponse.data)) {
        console.log('✅ Athletes fundación encontrados:', athletesResponse.data.length);
        
        // Log de todos los status
        athletesResponse.data.forEach((ath, index) => {
          const name = `${ath.firstName || ''} ${ath.lastName || ''}`.trim();
          console.log(`📋 Athlete ${index + 1}: ${name} - status: "${ath.status}"`);
        });
        
        const foundationAthletes = athletesResponse.data
          .filter(ath => {
            const isActive = ath.status !== 'Inactivo';
            if (!isActive) {
              console.log(`❌ Filtrando: ${ath.firstName} ${ath.lastName} - status: "${ath.status}"`);
            }
            return isActive;
          })
          .map(ath => ({
            id: ath.id,
            name: `${ath.firstName || ''} ${ath.middleName || ''} ${ath.lastName || ''} ${ath.secondLastName || ''}`.trim().replace(/\s+/g, ' '),
            identification: ath.identification,
            phoneNumber: ath.phoneNumber,
            categoria: ath.sportsCategory?.name || ath.categoria,
            type: 'fundacion'
          }));
        console.log('✅ Athletes fundación activos:', foundationAthletes.length);
        athletes.push(...foundationAthletes);
      }
      
      // Transformar deportistas temporales
      if (temporalResponse?.success && Array.isArray(temporalResponse.data)) {
        console.log('✅ Temporales encontrados:', temporalResponse.data.length);
        console.log('📊 Primer temporal COMPLETO:', JSON.stringify(temporalResponse.data[0], null, 2));
        
        const deportistas = temporalResponse.data.filter(temp => temp.personType === 'Deportista');
        console.log('🏃 Deportistas filtrados:', deportistas.length);
        
        const temporalAthletes = deportistas.map(temp => ({
            id: temp.id,
            name: `${temp.firstName || ''} ${temp.middleName || ''} ${temp.lastName || ''} ${temp.secondLastName || ''}`.trim().replace(/\s+/g, ' '),
            identification: temp.identification,
            phoneNumber: temp.phone || temp.phoneNumber,
            type: 'temporal'
          }));
        console.log('✅ Deportistas temporales activos:', temporalAthletes.length);
        athletes.push(...temporalAthletes);
      }
      
      console.log('🎯 Total deportistas:', athletes.length);
      return {
        success: true,
        data: athletes
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

  async getSportsCategories() {
    try {
      const response = await apiClient.get('/sports-categories');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }
      
      return {
        success: false,
        data: [],
        error: response?.message || 'Error obteniendo categorías deportivas'
      };
    } catch (error) {
      console.error('Error obteniendo categorías deportivas:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async checkDuplicateTemporalTeam({ athleteIds, trainerId, excludeId = null }) {
    try {
      // Validar que al menos uno de los parámetros esté presente
      if ((!athleteIds || athleteIds.length === 0) && !trainerId) {
        throw new Error('Se requiere al menos athleteIds o trainerId');
      }
      
      // Construir los parámetros correctamente
      const queryParams = new URLSearchParams();
      
      // Solo agregar athleteIds si hay elementos
      if (athleteIds && athleteIds.length > 0) {
        queryParams.append('athleteIds', athleteIds.join(','));
      }
      
      // Solo agregar trainerId si existe
      if (trainerId) {
        queryParams.append('trainerId', trainerId.toString());
      }
      
      // Solo agregar excludeId si existe
      if (excludeId) {
        queryParams.append('excludeId', excludeId.toString());
      }
      
      console.log('🌐 Llamando al backend con params:', queryParams.toString());
      
      const response = await apiClient.get(`${this.endpoint}/check-duplicate-temporal?${queryParams.toString()}`);
      
      console.log('📡 Respuesta del backend:', response);
      
      if (response && response.success !== undefined) {
        return {
          success: true,
          available: response.available,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error verificando equipo duplicado'
      };
    } catch (error) {
      console.error('Error verificando equipo duplicado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkTemporalTrainerAvailability(trainerId, excludeId = null) {
    try {
      // Construir los parámetros manualmente para evitar el error del backend
      const queryParams = new URLSearchParams();
      queryParams.append('trainerId', trainerId.toString());
      
      if (excludeId) {
        queryParams.append('excludeId', excludeId.toString());
      }
      
      console.log('🌐 Validando entrenador con params:', queryParams.toString());
      
      const response = await apiClient.get(`${this.endpoint}/check-duplicate-temporal?${queryParams.toString()}`);
      
      console.log('📡 Respuesta validación entrenador:', response);
      
      if (response && response.success !== undefined) {
        return {
          success: true,
          available: response.available,
          message: response.message
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Error verificando entrenador'
      };
    } catch (error) {
      console.error('❌ Error verificando entrenador:', error);
      return {
        success: false,
        error: error.message,
        available: true // Asumir disponible en caso de error para no bloquear
      };
    }
  }

  async checkTemporalAthletesAvailability(athleteIds, excludeId = null) {
    // No enviar trainerId null, solo athleteIds
    return this.checkDuplicateTemporalTeam({ 
      athleteIds, 
      excludeId 
    });
  }

  async checkTemporalPersonAvailability(personId, excludeTeamId = null) {
    try {
      const params = new URLSearchParams({ 
        personId: personId.toString() 
      });
      
      if (excludeTeamId) {
        params.append('excludeTeamId', excludeTeamId.toString());
      }
      
      const url = `${this.endpoint}/check-temporal-person-availability?${params}`;
      console.log('🌐 Verificando disponibilidad de persona temporal');
      console.log('   URL:', url);
      console.log('   personId:', personId);
      console.log('   excludeTeamId:', excludeTeamId);
      
      const response = await apiClient.get(url);
      
      console.log('📡 Respuesta disponibilidad completa:', response);
      console.log('   available:', response.available);
      console.log('   message:', response.message);
      console.log('   success:', response.success);
      
      if (response && response.success !== undefined) {
        return {
          success: true,
          available: response.available,
          message: response.message
        };
      }
      
      return {
        success: false,
        available: true,
        error: response?.message || 'Error verificando disponibilidad'
      };
    } catch (error) {
      console.error('❌ Error verificando disponibilidad:', error);
      console.error('   Error completo:', error.response?.data || error.message);
      return {
        success: false,
        available: true,
        error: error.message
      };
    }
  }

  async checkEventAssignments(teamId) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${teamId}/check-event-assignments`);
      
      if (response && response.success !== undefined) {
        return {
          success: true,
          isAssigned: response.isAssigned || false,
          count: response.count || 0,
          events: response.events || [],
          message: response.message || ''
        };
      }
      
      return {
        success: false,
        isAssigned: false,
        count: 0,
        events: [],
        error: response?.message || 'Error verificando asignación a eventos'
      };
    } catch (error) {
      console.error('Error verificando asignación a eventos:', error);
      return {
        success: false,
        isAssigned: false,
        count: 0,
        events: [],
        error: error.message
      };
    }
  }
}

export default new TeamsService();