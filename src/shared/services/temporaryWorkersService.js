import apiClient from './apiClient';

class TemporaryWorkersService {
  constructor() {
    this.baseURL = '/temporary-workers';
  }

  /**
   * Obtener todas las personas temporales
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(this.baseURL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching temporary workers:', error);
      throw error;
    }
  }

  /**
   * Obtener persona temporal por ID
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching temporary worker by ID:', error);
      throw error;
    }
  }

  /**
   * Crear nueva persona temporal
   */
  async create(data) {
    try {
      const response = await apiClient.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating temporary worker:', error);
      throw error;
    }
  }

  /**
   * Actualizar persona temporal
   */
  async update(id, data) {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating temporary worker:', error);
      throw error;
    }
  }

  /**
   * Eliminar persona temporal
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting temporary worker:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas
   */
  async getStats() {
    try {
      const response = await apiClient.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching temporary worker stats:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de referencia
   */
  async getReferenceData() {
    try {
      const response = await apiClient.get(`${this.baseURL}/reference-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reference data:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de identificación
   */
  async checkIdentificationAvailability(identification, excludeId = null) {
    try {
      const params = { identification };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await apiClient.get(`${this.baseURL}/check-identification`, { params });
      return response.data;
    } catch (error) {
      console.error('Error checking identification availability:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de email
   */
  async checkEmailAvailability(email, excludeId = null) {
    try {
      const params = { email };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await apiClient.get(`${this.baseURL}/check-email`, { params });
      return response.data;
    } catch (error) {
      console.error('Error checking email availability:', error);
      throw error;
    }
  }
}

export default new TemporaryWorkersService();