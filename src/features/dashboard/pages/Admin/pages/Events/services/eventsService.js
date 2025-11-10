/**
 * Servicio para gestionar eventos
 * Maneja todas las peticiones HTTP al backend de eventos
 */

import apiClient from '../../../../../../../shared/services/apiClient.js';

class EventsService {
  constructor() {
    this.endpoint = '/events';
  }

  /**
   * Obtener todos los eventos con paginación y filtros
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
   * Obtener un evento por ID
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
   * Crear un nuevo evento
   */
  async create(eventData) {
    try {
      const response = await apiClient.post(this.endpoint, eventData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un evento existente
   */
  async update(id, eventData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, eventData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un evento
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
   * Obtener estadísticas de eventos
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
   * Obtener datos de referencia (categorías y tipos)
   */
  async getReferenceData() {
    try {
      const response = await apiClient.get(`${this.endpoint}/reference-data`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new EventsService();
