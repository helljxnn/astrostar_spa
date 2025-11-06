/**
 * Servicio de Personas Temporales - Integración con Backend API
 * Maneja todas las operaciones CRUD de personas temporales
 */

import apiClient from '../../../../../../../../shared/services/apiClient.js';

class TemporaryPersonsService {
  constructor() {
    this.endpoint = '/temporary-workers';
  }

  /**
   * Obtener todas las personas temporales con filtros opcionales
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Lista de personas temporales con paginación
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(this.endpoint, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener persona temporal por ID
   * @param {number} id - ID de la persona temporal
   * @returns {Promise} Datos de la persona temporal
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear nueva persona temporal
   * @param {Object} personData - Datos de la persona temporal
   * @returns {Promise} Persona temporal creada
   */
  async create(personData) {
    try {
      const response = await apiClient.post(this.endpoint, personData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar persona temporal existente
   * @param {number} id - ID de la persona temporal
   * @param {Object} personData - Datos actualizados
   * @returns {Promise} Persona temporal actualizada
   */
  async update(id, personData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, personData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar persona temporal (soft delete)
   * @param {number} id - ID de la persona temporal
   * @returns {Promise} Confirmación de eliminación
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de personas temporales
   * @returns {Promise} Estadísticas
   */
  async getStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener datos de referencia para formularios
   * @returns {Promise} Tipos de documento
   */
  async getReferenceData() {
    try {
      const response = await apiClient.get(`${this.endpoint}/reference-data`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de email
   * @param {string} email - Email a verificar
   * @param {number} excludeId - ID a excluir (para edición)
   * @returns {Promise} Disponibilidad del email
   */
  async checkEmailAvailability(email, excludeId = null) {
    try {
      const params = { email };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await apiClient.get(`${this.endpoint}/check-email`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de identificación
   * @param {string} identification - Identificación a verificar
   * @param {number} excludeId - ID a excluir (para edición)
   * @returns {Promise} Disponibilidad de la identificación
   */
  async checkIdentificationAvailability(identification, excludeId = null) {
    try {
      const params = { identification };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await apiClient.get(`${this.endpoint}/check-identification`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new TemporaryPersonsService();