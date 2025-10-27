import apiClient from '../../../../../../../shared/services/apiClient';

class UsersService {
  constructor() {
    this.endpoint = '/users';
  }

  /**
   * Obtener todos los usuarios (SOLO LECTURA)
   * @param {object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.status - Estado del usuario
   * @param {number} params.roleId - ID del rol
   * @param {string} params.userType - Tipo de usuario
   * @returns {Promise} Lista de usuarios con paginación
   */
  async getUsers(params = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      status = "", 
      roleId = "", 
      userType = "" 
    } = params;
    
    console.log("📋 Fetching users (READ-ONLY):", { 
      page, limit, search, status, roleId, userType 
    });
    
    return apiClient.get(this.endpoint, { 
      page, 
      limit, 
      search,
      status,
      roleId,
      userType
    });
  }

  /**
   * Obtener usuario por ID (SOLO LECTURA)
   * @param {number} id - ID del usuario
   * @returns {Promise} Datos del usuario
   */
  async getUserById(id) {
    console.log("🔍 Fetching user by ID:", id);
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise} Estadísticas de usuarios
   */
  async getUserStats() {
    console.log("📊 Fetching user statistics");
    return apiClient.get(`${this.endpoint}/stats`);
  }

  /**
   * Obtener usuarios atletas
   * @param {object} params - Parámetros de consulta
   * @returns {Promise} Lista de atletas
   */
  async getAthletes(params = {}) {
    return this.getUsers({ ...params, userType: 'athletes' });
  }

  /**
   * Obtener usuarios empleados
   * @param {object} params - Parámetros de consulta
   * @returns {Promise} Lista de empleados
   */
  async getEmployees(params = {}) {
    return this.getUsers({ ...params, userType: 'employees' });
  }

  /**
   * Obtener usuarios del sistema (con login)
   * @param {object} params - Parámetros de consulta
   * @returns {Promise} Lista de usuarios del sistema
   */
  async getSystemUsers(params = {}) {
    return this.getUsers({ ...params, userType: 'system' });
  }

  /**
   * Buscar usuarios por término específico
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise} Usuarios que coinciden con la búsqueda
   */
  async searchUsers(searchTerm, limit = 20) {
    console.log("🔍 Searching users:", { searchTerm, limit });
    return this.getUsers({ 
      search: searchTerm, 
      limit,
      page: 1 
    });
  }
}

// Exportar instancia única del servicio (Singleton)
export default new UsersService();