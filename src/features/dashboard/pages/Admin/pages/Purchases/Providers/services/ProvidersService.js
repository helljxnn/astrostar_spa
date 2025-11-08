// src/features/dashboard/pages/Admin/pages/Providers/services/ProvidersService.js
import apiClient from '../../../../../../../../shared/services/apiClient';

class ProvidersService {
  constructor() {
    this.endpoint = '/providers';
  }

  async getProviders(params = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      status = "", 
      entityType = "" 
    } = params;
    
    return apiClient.get(this.endpoint, { 
      page, 
      limit, 
      search,
      status,
      entityType
    });
  }

  async getProviderById(id) {
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  async createProvider(providerData) {
    const transformedData = this.transformToBackend(providerData);
    return apiClient.post(this.endpoint, transformedData);
  }

  async updateProvider(id, providerData) {
    const transformedData = this.transformToBackend(providerData);
    return apiClient.put(`${this.endpoint}/${id}`, transformedData);
  }

  async deleteProvider(id) {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async changeProviderStatus(id, status) {
    return apiClient.patch(`${this.endpoint}/${id}/status`, { status });
  }

  /**
   * Verificar disponibilidad de NIT/Documento
   * @param {string} nit - NIT o documento a verificar
   * @param {number|null} excludeId - ID a excluir de la verificación (para edición)
   * @param {string} tipoEntidad - Tipo de entidad ('juridica' o 'natural')
   * @returns {Promise} Resultado de disponibilidad
   */
  async checkNitAvailability(nit, excludeId = null, tipoEntidad = 'juridica') {
    const params = { nit, tipoEntidad };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    const response = await apiClient.get(`${this.endpoint}/check-nit`, params);
    return response;
  }

  /**
   * Verificar disponibilidad de razón social/nombre
   * @param {string} businessName - Razón social o nombre a verificar
   * @param {number|null} excludeId - ID a excluir de la verificación (para edición)
   * @param {string} tipoEntidad - Tipo de entidad ('juridica' o 'natural')
   * @returns {Promise} Resultado de disponibilidad
   */
  async checkBusinessNameAvailability(businessName, excludeId = null, tipoEntidad = 'juridica') {
    const params = { businessName, tipoEntidad };
    if (excludeId) {
      params.excludeId = excludeId;
    }

    const response = await apiClient.get(`${this.endpoint}/check-business-name`, params);
    return response;
  }

  async checkEmailAvailability(email, excludeId = null) {
    const params = { email };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    return apiClient.get(`${this.endpoint}/check-email`, params);
  }

  async checkContactAvailability(contact, excludeId = null) {
    const params = { contact };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    return apiClient.get(`${this.endpoint}/check-contact`, params);
  }

  async checkActivePurchases(providerId) {
    return apiClient.get(`${this.endpoint}/${providerId}/active-purchases`);
  }

  async getProviderStats() {
    return apiClient.get(`${this.endpoint}/stats`);
  }

  async searchProviders(searchTerm, limit = 20) {
    return this.getProviders({ 
      search: searchTerm, 
      limit,
      page: 1 
    });
  }

  async getActiveProviders() {
    return this.getProviders({ status: 'Activo' });
  }

  async getProvidersByEntityType(entityType) {
    return this.getProviders({ entityType });
  }

  transformToBackend(providerData) {
    const cleanedNit = providerData.nit ? providerData.nit.replace(/[.\-\s]/g, '') : '';
    
    const transformed = {
      tipoEntidad: providerData.tipoEntidad,
      razonSocial: providerData.razonSocial,
      nit: cleanedNit,
      contactoPrincipal: providerData.contactoPrincipal,
      correo: providerData.correo,
      telefono: providerData.telefono,
      direccion: providerData.direccion,
      ciudad: providerData.ciudad,
      descripcion: providerData.descripcion || '',
      estado: providerData.estado
    };

    if (providerData.tipoEntidad === 'natural' && providerData.tipoDocumento) {
      transformed.tipoDocumento = providerData.tipoDocumento;
    }

    return transformed;
  }
}

export default new ProvidersService();