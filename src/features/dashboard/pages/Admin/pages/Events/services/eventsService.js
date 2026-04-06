/**
 * Servicio para gestionar eventos
 * Maneja todas las peticiones HTTP al backend de eventos
 */

import apiClient from "../../../../../../../shared/services/apiClient.js";

class EventsService {
  constructor() {
    this.endpoint = "/events";
  }

  /**
   * Obtener todos los eventos con paginación y filtros
   */
  async getAll(params = {}) {
    const response = await apiClient.get(this.endpoint, params);
    return response;
  }

  /**
   * Obtener un evento por ID
   */
  async getById(id) {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response;
  }

  /**
   * Crear un nuevo evento
   */
  async create(eventData) {
    const response = await apiClient.post(this.endpoint, eventData);
    return response;
  }

  /**
   * Actualizar un evento existente
   */
  async update(id, eventData) {
    const response = await apiClient.put(`${this.endpoint}/${id}`, eventData);
    return response;
  }

  /**
   * Eliminar un evento
   */
  async delete(id) {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response;
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getStats() {
    const response = await apiClient.get(`${this.endpoint}/stats`);
    return response;
  }

  /**
   * Obtener eventos agrupados por trimestre
   */
  async getByQuarter() {
    const response = await apiClient.get(`${this.endpoint}/by-quarter`);
    return response;
  }

  /**
   * Obtener datos de referencia (categorías, tipos y patrocinadores)
   */
  async getReferenceData() {
    const response = await apiClient.get(`${this.endpoint}/reference-data`);
    return response;
  }

  /**
   * Obtener eventos activos (para asignación de materiales)
   */
  async getActiveEvents() {
    const response = await apiClient.get(`${this.endpoint}`, {
      limit: 1000,
    });
    return response;
  }

  /**
   * Verificar inscripciones afectadas por cambio de categorías
   */
  async checkAffectedRegistrations(eventId, categoryIds) {
    const response = await apiClient.post(
      `${this.endpoint}/${eventId}/check-affected-registrations`,
      { categoryIds },
    );
    return response;
  }
}

export default new EventsService();

