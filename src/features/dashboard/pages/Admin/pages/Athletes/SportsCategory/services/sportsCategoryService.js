/**
 * Servicio de Categorías Deportivas - Integración con Backend API
 */

import apiClient from "../../../../../../../../shared/services/apiClient.js";

class SportsCategoryService {
  constructor() {
    this.endpoint = "/sports-categories";
  }

  /**
   * Obtener todas las categorías deportivas con filtros opcionales
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Lista de categorías deportivas con paginación
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
   * Obtener todas las categorías deportivas para reporte (sin paginación)
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista completa de categorías deportivas
   */
  async getAllForReport(params = {}) {
    try {
      const response = await apiClient.get(this.endpoint, {
        ...params,
        limit: 10000, // Límite alto para obtener todos los datos
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener categoría deportiva por ID
   * @param {number} id - ID de la categoría deportiva
   * @returns {Promise} Datos de la categoría deportiva
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
   * Crear nueva categoría deportiva
   * @param {Object} categoryData - Datos de la categoría deportiva
   * @returns {Promise} Categoría deportiva creada
   */
  async create(categoryData) {
    try {
      const response = await apiClient.post(this.endpoint, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar categoría deportiva
   * @param {number} id - ID de la categoría deportiva
   * @param {Object} categoryData - Datos actualizados
   * @returns {Promise} Categoría deportiva actualizada
   */
  async update(id, categoryData) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar categoría deportiva
   * @param {number} id - ID de la categoría deportiva
   * @returns {Promise} Resultado de la eliminación
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new SportsCategoryService();
