
import apiClient from '../../../../../../../shared/services/apiClient';

class RolesService {
  constructor() {
    this.endpoint = '/roles';
  }

  /**
   * Obtener todos los roles con paginación y búsqueda
   * @param {object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.search - Término de búsqueda
   * @returns {Promise} Lista de roles con paginación
   */
  async getAllRoles(params = {}) {
    const { page = 1, limit = 10, search = "" } = params;

    return apiClient.get(this.endpoint, { page, limit, search });
  }

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise} Datos del rol
   */
  async getRoleById(id) {

    return apiClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Crear nuevo rol
   * @param {object} roleData - Datos del rol a crear
   * @param {string} roleData.name - Nombre del rol
   * @param {string} roleData.description - Descripción del rol
   * @param {object} roleData.permissions - Permisos del rol
   * @returns {Promise} Rol creado
   */
  async createRole(roleData) {

    return apiClient.post(this.endpoint, roleData);
  }

  /**
   * Actualizar rol existente
   * @param {number} id - ID del rol a actualizar
   * @param {object} roleData - Nuevos datos del rol
   * @returns {Promise} Rol actualizado
   */
  async updateRole(id, roleData) {

    return apiClient.put(`${this.endpoint}/${id}`, roleData);
  }

  /**
   * Eliminar rol
   * @param {number} id - ID del rol a eliminar
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteRole(id) {

    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Verificar disponibilidad de nombre de rol
   * @param {string} name - Nombre a verificar
   * @param {number|null} excludeId - ID a excluir de la verificación (para edición)
   * @returns {Promise} Resultado de disponibilidad
   */
  async checkRoleNameAvailability(name, excludeId = null) {
    const params = { name };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    const response = await apiClient.get(`${this.endpoint}/check-name`, params);

    return response;
  }

  /**
   * Obtener estadísticas de roles
   * @returns {Promise} Estadísticas de roles
   */
  async getRoleStats() {

    return apiClient.get(`${this.endpoint}/stats`);
  }

  /**
   * Obtener permisos disponibles del sistema
   * @returns {Promise} Lista de permisos disponibles
   */
  async getAvailablePermissions() {

    return apiClient.get(`${this.endpoint}/permissions`);
  }

  /**
   * Obtener roles activos únicamente
   * @returns {Promise} Lista de roles activos
   */
  async getActiveRoles() {

    return this.getAllRoles({ limit: 100, page: 1 });
  }

  /**
   * Duplicar un rol existente
   * @param {number} id - ID del rol a duplicar
   * @param {string} newName - Nuevo nombre para el rol duplicado
   * @returns {Promise} Rol duplicado
   */
  async duplicateRole(id, newName) {

    
    // Primero obtener el rol original
    const originalRole = await this.getRoleById(id);
    
    // Crear nuevo rol con los mismos datos pero diferente nombre
    const duplicatedRoleData = {
      name: newName,
      description: `${originalRole.data.description} (Copia)`,
      permissions: originalRole.data.permissions,
    };

    return this.createRole(duplicatedRoleData);
  }

  /**
   * Buscar roles por término específico
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise} Roles que coinciden con la búsqueda
   */
  async searchRoles(searchTerm, limit = 20) {

    return this.getAllRoles({ 
      search: searchTerm, 
      limit,
      page: 1 
    });
  }

  /**
   * Exportar roles (preparar datos para exportación)
   * @param {string} format - Formato de exportación (json, csv)
   * @returns {Promise} Datos formateados para exportación
   */
  async exportRoles(format = "json") {

    
    // Obtener todos los roles sin paginación
    const allRoles = await this.getAllRoles({ limit: 100 });
    
    if (format === "csv") {
      return this.formatRolesForCSV(allRoles.data);
    }
    
    return allRoles.data;
  }

  /**
   * Formatear roles para exportación CSV
   * @param {Array} roles - Lista de roles
   * @returns {string} Datos en formato CSV
   */
  formatRolesForCSV(roles) {
    const headers = ["ID", "Nombre", "Descripción", "Fecha Creación"];
    const csvRows = [headers.join(",")];

    roles.forEach(role => {
      const row = [
        role.id,
        `"${role.name}"`,
        `"${role.description}"`,
        new Date(role.createdAt).toLocaleDateString()
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }
}

// Exportar instancia única del servicio (Singleton)
export default new RolesService();

// También exportar la clase para testing
export { RolesService };