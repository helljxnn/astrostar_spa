import apiClient from '@shared/services/apiClient';

class ProvidersService {
  constructor() {
    this.endpoint = '/providers';
  }

  /**
   * Obtener todos los proveedores
   */
  async getProviders(params = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      status = "", 
      entityType = "" 
    } = params;
    
    console.log("📋 Fetching providers:", { 
      page, limit, search, status, entityType 
    });
    
    return apiClient.get(this.endpoint, { 
      page, 
      limit, 
      search,
      status,
      entityType
    });
  }

  /**
   * Obtener proveedor por ID
   */
  async getProviderById(id) {
    console.log("🔍 Fetching provider by ID:", id);
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Crear nuevo proveedor
   */
  async createProvider(providerData) {
    console.log("➕ Creating new provider:", providerData);
    return apiClient.post(this.endpoint, providerData);
  }

  /**
   * Actualizar proveedor
   */
  async updateProvider(id, providerData) {
    console.log("✏️ Updating provider:", { id, providerData });
    return apiClient.put(`${this.endpoint}/${id}`, providerData);
  }

  /**
   * Eliminar proveedor
   */
  async deleteProvider(id) {
    console.log("🗑️ Deleting provider:", id);
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Cambiar estado de proveedor
   */
  async changeProviderStatus(id, status) {
    console.log("🔄 Changing provider status:", { id, status });
    return apiClient.patch(`${this.endpoint}/${id}/status`, { status });
  }

  /**
   * Verificar disponibilidad de NIT
   */
  async checkNitAvailability(nit, excludeId = null) {
    const params = { nit };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    console.log("🔍 Checking NIT availability:", { nit, excludeId });
    return apiClient.get(`${this.endpoint}/check-nit`, params);
  }

  /**
   * Obtener estadísticas de proveedores
   */
  async getProviderStats() {
    console.log("📊 Fetching provider statistics");
    return apiClient.get(`${this.endpoint}/stats`);
  }

  /**
   * Buscar proveedores por término específico
   */
  async searchProviders(searchTerm, limit = 20) {
    console.log("🔍 Searching providers:", { searchTerm, limit });
    return this.getProviders({ 
      search: searchTerm, 
      limit,
      page: 1 
    });
  }

  /**
   * Obtener proveedores activos únicamente
   */
  async getActiveProviders() {
    return this.getProviders({ status: 'Activo' });
  }

  /**
   * Obtener proveedores por tipo de entidad
   */
  async getProvidersByEntityType(entityType) {
    return this.getProviders({ entityType });
  }
}

// Exportar instancia única del servicio
export default new ProvidersService();