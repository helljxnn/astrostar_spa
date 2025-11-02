
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
    console.log("📋 Fetching roles with params:", { page, limit, search });
    return apiClient.get(this.endpoint, { page, limit, search });
  }

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise} Datos del rol
   */
  async getRoleById(id) {
    console.log("🔍 Fetching role by ID:", id);
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Crear nuevo rol
   * @param {object} roleData - Datos del rol a crear
   * @param {string} roleData.name - Nombre del rol
   * @param {string} roleData.description - Descripción del rol
   * @param {string} roleData.status - Estado del rol (Active/Inactive)
   * @param {object} roleData.permissions - Permisos del rol
   * @returns {Promise} Rol creado
   */
  async createRole(roleData) {
    console.log("➕ Creating new role:", roleData);
    return apiClient.post(this.endpoint, roleData);
  }

  /**
   * Actualizar rol existente
   * @param {number} id - ID del rol a actualizar
   * @param {object} roleData - Nuevos datos del rol
   * @returns {Promise} Rol actualizado
   */
  async updateRole(id, roleData) {
    console.log("✏️ Updating role:", { id, roleData });
    return apiClient.put(`${this.endpoint}/${id}`, roleData);
  }

  /**
   * Eliminar rol
   * @param {number} id - ID del rol a eliminar
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteRole(id) {
    console.log("🗑️ Deleting role:", id);
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

    console.log("🔍 Checking name availability:", { name, excludeId });
    const response = await apiClient.get(`${this.endpoint}/check-name`, params);
    console.log("📨 Name availability response:", response);

    return response;
  }

  /**
   * Obtener estadísticas de roles
   * @returns {Promise} Estadísticas de roles
   */
  async getRoleStats() {
    console.log("📊 Fetching role statistics");
    return apiClient.get(`${this.endpoint}/stats`);
  }

  /**
   * Obtener permisos disponibles del sistema
   * @returns {Promise} Lista de permisos disponibles
   */
  async getAvailablePermissions() {
    console.log("🔐 Fetching available permissions");
    return apiClient.get(`${this.endpoint}/permissions`);
  }

  /**
   * Cambiar estado de un rol (Activar/Desactivar)
   * @param {number} id - ID del rol
   * @param {string} status - Nuevo estado (Active/Inactive)
   * @returns {Promise} Rol con estado actualizado
   */
  async changeRoleStatus(id, status) {
    console.log("🔄 Changing role status:", { id, status });
    return this.updateRole(id, { status });
  }

  /**
   * Obtener roles activos únicamente
   * @returns {Promise} Lista de roles activos
   */
  async getActiveRoles() {
    console.log("✅ Fetching active roles only");
    return this.getAllRoles({ limit: 1000, page: 1 }).then(response => {
      if (response.success) {
        return {
          ...response,
          data: response.data.filter(role => role.status === 'Active')
        };
      }
      return response;
    });
  }

  /**
   * Duplicar un rol existente
   * @param {number} id - ID del rol a duplicar
   * @param {string} newName - Nuevo nombre para el rol duplicado
   * @returns {Promise} Rol duplicado
   */
  async duplicateRole(id, newName) {
    console.log("📋 Duplicating role:", { id, newName });
    
    // Primero obtener el rol original
    const originalRole = await this.getRoleById(id);
    
    // Crear nuevo rol con los mismos datos pero diferente nombre
    const duplicatedRoleData = {
      name: newName,
      description: `${originalRole.data.description} (Copia)`,
      status: originalRole.data.status,
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
    console.log("🔍 Searching roles:", { searchTerm, limit });
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
    console.log("📤 Preparing roles export:", format);
    
    // Obtener todos los roles sin paginación
    const allRoles = await this.getAllRoles({ limit: 1000 });
    
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
    const headers = ["ID", "Nombre", "Descripción", "Estado", "Fecha Creación"];
    const csvRows = [headers.join(",")];

    roles.forEach(role => {
      const row = [
        role.id,
        `"${role.name}"`,
        `"${role.description}"`,
        role.status,
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